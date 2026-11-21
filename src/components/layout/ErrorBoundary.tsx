import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#E4E7F2] p-6 text-center space-y-5">
            <div className="mx-auto size-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-inner">
              <AlertCircle className="size-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-lg font-bold text-[#1A1A2E]">
                Terjadi Kendala pada Tampilan
              </h1>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Aplikasi mengalami kendala saat memuat komponen ini. Anda dapat memuat ulang halaman atau kembali ke beranda.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-red-50/60 rounded-xl text-[11px] font-mono text-red-700 text-left overflow-auto max-h-28 border border-red-100">
                {this.state.error.message}
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl text-xs h-10 border-[#E4E7F2]"
                onClick={this.handleHome}
              >
                <Home className="mr-1.5 size-3.5" />
                Beranda
              </Button>
              <Button
                className="flex-1 rounded-xl text-xs h-10 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={this.handleReload}
              >
                <RefreshCw className="mr-1.5 size-3.5" />
                Muat Ulang
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
