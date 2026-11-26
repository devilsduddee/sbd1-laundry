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
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-lg border border-[#E2E8F0] p-6 text-center space-y-5">
            <div className="mx-auto size-14 rounded-md bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] flex items-center justify-center">
              <AlertCircle className="size-8" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h1 className="font-heading text-lg font-bold text-[#0F172A]">
                Terjadi Kendala pada Tampilan
              </h1>
              <p className="text-xs text-[#475569] leading-relaxed">
                Aplikasi mengalami kendala saat memuat komponen ini. Anda dapat memuat ulang halaman atau kembali ke beranda.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-[#FEE2E2] rounded-md text-xs font-mono text-[#B91C1C] text-left overflow-auto max-h-28 border border-[#FECACA]">
                {this.state.error.message}
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-md text-xs h-10 border-[#E2E8F0] text-[#0F172A] hover:bg-[#E8ECF1]"
                onClick={this.handleHome}
              >
                <Home className="mr-1.5 size-3.5" aria-hidden="true" />
                Beranda
              </Button>
              <Button
                className="flex-1 rounded-md text-xs h-10 bg-[#0369A1] hover:bg-[#0284C7] text-white"
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
