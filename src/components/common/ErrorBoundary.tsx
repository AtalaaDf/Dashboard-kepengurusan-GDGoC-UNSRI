import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'Terjadi kesalahan tidak terduga pada aplikasi.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Di lingkungan produksi, error dapat dikirim ke layanan pelaporan log
    void error;
    void errorInfo;
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center animate-fade-in">
          <div className="max-w-md w-full p-8 rounded-2xl border border-[#1e1e1e]/10 flex flex-col items-center gap-4">
            <img
              src="/logoGDG.png"
              alt="GDG on Campus"
              className="h-10 w-auto object-contain mb-2"
            />
            <h1 className="text-xl font-semibold text-[#1e1e1e]">
              Terjadi Kendala Memuat Halaman
            </h1>
            <p className="text-xs text-[#1e1e1e]/60 leading-relaxed">
              Sistem mengalami kendala saat memproses tampilan ini. Anda dapat mencoba memuat ulang halaman atau kembali ke beranda dashboard.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-3 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={this.handleReload}
                className="w-full sm:w-auto"
              >
                Muat Ulang Halaman
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto"
              >
                Kembali ke Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
