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
        <div className="min-h-screen bg-[#F8FAFA] flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-lg border border-[#E1E8EB] p-6 text-center space-y-5 shadow-[0_8px_24px_-8px_rgba(11,23,35,0.08)]">
            <div className="mx-auto size-14 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-center justify-center">
              <AlertCircle className="size-8" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h1 className="font-heading text-lg font-bold text-[#0B1723]">
                Terjadi Kendala pada Tampilan
              </h1>
              <p className="text-xs text-[#526474] leading-relaxed">
                Aplikasi mengalami kendala saat memuat komponen ini. Anda dapat memuat ulang halaman atau kembali ke beranda.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-[#FEF2F2] rounded-md text-xs font-mono text-[#B91C1C] text-left overflow-auto max-h-28 border border-[#FECACA]">
                {this.state.error.message}
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <Button
                variant="outline"
                className="flex-1 text-xs h-10"
                onClick={this.handleHome}
              >
                <Home className="mr-1.5 size-3.5" aria-hidden="true" />
                Beranda
              </Button>
              <Button
                className="flex-1 text-xs h-10"
                onClick={this.handleReload}
              >
                <RefreshCw className="mr-1.5 size-3.5" aria-hidden="true" />
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
