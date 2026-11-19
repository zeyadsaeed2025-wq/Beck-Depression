import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Platform ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center p-6" dir="rtl">
          <div className="max-w-lg w-full calm-card p-8 space-y-4">
            <h1 className="text-xl font-bold text-[#587564]">
              حدث خطأ غير متوقع في المنصة / Unexpected Application Error
            </h1>
            <p className="text-sm text-[#5F6D64] leading-relaxed">
              يرجى إعادة تحميل الصفحة أو التحقق من اتصال الشبكة وصلاحيات الجلسة.
            </p>
            <div className="bg-[#FAF8F3] border border-[#E4E9E3] rounded-xl p-3 text-xs font-mono-num text-[#34443A] break-words">
              {this.state.message}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="calm-btn-primary px-5 py-2.5 text-sm font-semibold cursor-pointer"
            >
              إعادة تحميل المنصة / Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
