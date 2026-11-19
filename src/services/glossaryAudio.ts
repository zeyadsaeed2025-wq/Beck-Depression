import type { Language } from '../types/platform';

export type GlossaryAudioSegment = 'term' | 'explanation';
export type GlossaryAudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface GlossaryAudioState {
  status: GlossaryAudioStatus;
  termId: string | null;
  segment: GlossaryAudioSegment | null;
  language: Language;
  dialect: 'ar-EG' | 'en-US';
  errorMessage: string;
}

type Listener = (state: GlossaryAudioState) => void;

/**
 * Isolated TTS playback controller for the Psychology Glossary.
 * - Uses server-side Gemini 3.8 TTS (/api/glossary/tts) strictly bound to UI language:
 *     'ar' -> Egyptian Colloquial Arabic (ar-EG)
 *     'en' -> American English (en-US)
 * - Explicitly avoids Modern Standard Arabic (Fusha) fallback via browser SpeechSynthesis.
 * - Guarantees zero overlapping playback and clean cancellation on language change or close.
 */
class GlossaryAudioController {
  private state: GlossaryAudioState = {
    status: 'idle',
    termId: null,
    segment: null,
    language: 'ar',
    dialect: 'ar-EG',
    errorMessage: '',
  };

  private listeners = new Set<Listener>();
  private audioEl: HTMLAudioElement | null = null;
  private abortController: AbortController | null = null;
  private urlCache = new Map<string, string>();
  private requestSeq = 0;

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): GlossaryAudioState {
    return this.state;
  }

  private emit(partial: Partial<GlossaryAudioState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((fn) => fn(this.state));
  }

  /**
   * Synchronize audio engine with UI language immediately without page reload.
   * Stops any active audio in the previous language so mixed-language playback never occurs.
   */
  syncLanguage(language: Language) {
    const dialect = language === 'ar' ? 'ar-EG' : 'en-US';
    if (this.state.language !== language) {
      this.stop();
      this.emit({ language, dialect, errorMessage: '' });
    }
  }

  stop() {
    this.requestSeq += 1;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.audioEl) {
      this.audioEl.onended = null;
      this.audioEl.onerror = null;
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
      this.audioEl = null;
    }
    this.emit({
      status: 'idle',
      termId: null,
      segment: null,
      errorMessage: '',
    });
  }

  pause() {
    if (this.audioEl && this.state.status === 'playing') {
      this.audioEl.pause();
      this.emit({ status: 'paused' });
    }
  }

  async resume() {
    if (this.audioEl && this.state.status === 'paused') {
      try {
        await this.audioEl.play();
        this.emit({ status: 'playing', errorMessage: '' });
      } catch {
        this.emit({
          status: 'error',
          errorMessage:
            this.state.language === 'ar'
              ? 'تعذر استئناف تشغيل الصوت. يرجى المحاولة مرة أخرى.'
              : 'Could not resume audio playback. Please try again.',
        });
      }
    }
  }

  async play(
    termId: string,
    segment: GlossaryAudioSegment,
    language: Language,
    text: string
  ) {
    const dialect = language === 'ar' ? 'ar-EG' : 'en-US';

    // If paused on the exact same clip and language, resume seamlessly
    if (
      this.state.status === 'paused' &&
      this.state.termId === termId &&
      this.state.segment === segment &&
      this.state.language === language &&
      this.audioEl
    ) {
      await this.resume();
      return;
    }

    // Stop any previous audio or in-flight request to guarantee zero overlap
    this.stop();

    const seq = ++this.requestSeq;
    const cacheKey = `${language}:${segment}:${termId}:${text}`;

    this.emit({
      status: 'loading',
      termId,
      segment,
      language,
      dialect,
      errorMessage: '',
    });

    try {
      let objectUrl = this.urlCache.get(cacheKey);

      if (!objectUrl) {
        const controller = new AbortController();
        this.abortController = controller;

        const res = await fetch('/api/glossary/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language, segment }),
          signal: controller.signal,
        });

        const data = (await res.json().catch(() => null)) as {
          ok?: boolean;
          audioBase64?: string;
          mimeType?: string;
          error?: string;
        } | null;

        if (seq !== this.requestSeq) return;

        if (!res.ok || !data?.ok || !data.audioBase64) {
          throw new Error(
            data?.error ||
              (language === 'ar'
                ? 'تعذر توليد الصوت بالعامية المصرية حاليًا. يرجى التحقق من الاتصال والمحاولة مرة أخرى.'
                : 'Unable to generate English audio right now. Please check your connection and try again.')
          );
        }

        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
        objectUrl = URL.createObjectURL(blob);
        this.urlCache.set(cacheKey, objectUrl);
      }

      if (seq !== this.requestSeq) return;

      const audio = new Audio(objectUrl);
      this.audioEl = audio;

      audio.onended = () => {
        if (seq === this.requestSeq) {
          this.audioEl = null;
          this.emit({
            status: 'idle',
            termId: null,
            segment: null,
            errorMessage: '',
          });
        }
      };

      audio.onerror = () => {
        if (seq === this.requestSeq) {
          this.audioEl = null;
          this.emit({
            status: 'error',
            errorMessage:
              language === 'ar'
                ? 'حدث خطأ أثناء تشغيل الملف الصوتي. يرجى المحاولة مرة أخرى.'
                : 'An error occurred while playing the audio clip. Please try again.',
          });
        }
      };

      await audio.play();
      if (seq === this.requestSeq) {
        this.emit({
          status: 'playing',
          termId,
          segment,
          language,
          dialect,
          errorMessage: '',
        });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      if (seq !== this.requestSeq) return;
      const fallbackMsg =
        language === 'ar'
          ? 'تعذر تشغيل الصوت بالعامية المصرية. تأكد من الاتصال بالشبكة وحاول مرة أخرى.'
          : 'Could not play English audio. Please check your network connection and try again.';
      this.emit({
        status: 'error',
        errorMessage:
          err instanceof Error && err.message && !err.message.includes('{')
            ? err.message
            : fallbackMsg,
      });
    }
  }
}

export const glossaryAudio = new GlossaryAudioController();
