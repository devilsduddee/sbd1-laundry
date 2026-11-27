import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Download, Smartphone, Share, PlusSquare, X, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_STORAGE_KEY = 'qwash_pwa_notice_dismissed_at';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari

export const PwaInstallPrompt: React.FC = () => {
  const location = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);

  const hasBottomNav = ['/pesanan', '/pelanggan', '/layanan', '/petugas', '/laporan'].some(
    (prefix) => location.pathname.startsWith(prefix)
  );

  useEffect(() => {
    // Cek apakah sudah terpasang sebagai aplikasi standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as any).standalone);
    if (isStandalone) return;

    // Cek apakah user baru saja menutup notifikasi dalam 7 hari terakhir
    try {
      const dismissedAt = localStorage.getItem(DISMISS_STORAGE_KEY);
      if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_DURATION_MS) {
        return;
      }
    } catch {
      // Abaikan error storage pada mode privat
    }

    // Deteksi dibuka lewat perangkat HP/mobile (coarse pointer atau layar sempit)
    const isMobileViewport =
      window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    if (!isMobileViewport) return;

    const ua = window.navigator.userAgent;
    const iosDevice = /iPhone|iPad|iPod/i.test(ua);
    setIsIos(iosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Tampilkan notifikasi ramah HP setelah jeda singkat agar tidak menghalangi load awal
    const timer = window.setTimeout(() => {
      setVisible(true);
    }, 1200);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.clearTimeout(timer);
    };
  }, []);

  useGSAP(
    () => {
      if (!visible || !cardRef.current) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          cardRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out', clearProps: 'transform,opacity' }
        );
      });
    },
    { dependencies: [visible], scope: cardRef }
  );

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    } catch {
      // Abaikan
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Pemberitahuan Pasang Aplikasi PWA"
      className={`print:hidden fixed left-3 right-3 z-50 md:hidden pb-safe ${
        hasBottomNav ? 'bottom-20' : 'bottom-4'
      }`}
    >
      <div
        ref={cardRef}
        className="max-w-md mx-auto bg-white border border-[#D5E4E4] rounded-lg shadow-lg p-3.5 text-[#071422]"
      >
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-md bg-[#0B253B] text-white flex items-center justify-center shrink-0">
            <Smartphone className="size-5 stroke-[1.75]" aria-hidden="true" />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-heading text-xs font-bold text-[#0B253B] leading-tight">
                Pasang Aplikasi Qwash di HP
              </h2>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Tutup pemberitahuan pasang aplikasi"
                className="text-[#425869] hover:text-[#0B253B] p-1 -mr-1 -mt-1 rounded-sm"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            {deferredPrompt ? (
              <>
                <p className="text-xs text-[#425869] leading-snug">
                  Tambahkan ke layar utama untuk akses lebih cepat tanpa membuka browser.
                </p>
                <div className="pt-1.5 flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleInstallClick}
                    className="h-8 px-3 bg-[#006EB3] hover:bg-[#00588F] text-white rounded-md text-xs font-semibold gap-1.5"
                  >
                    <Download className="size-3.5" aria-hidden="true" />
                    Pasang Sekarang
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-8 px-2.5 text-xs text-[#425869] hover:text-[#0B253B]"
                  >
                    Nanti
                  </Button>
                </div>
              </>
            ) : isIos ? (
              <p className="text-xs text-[#425869] leading-relaxed">
                Ketuk ikon{' '}
                <span className="inline-flex items-center font-semibold text-[#006EB3]">
                  <Share className="size-3.5 mx-0.5" aria-hidden="true" /> Bagikan
                </span>{' '}
                di Safari, lalu pilih{' '}
                <span className="inline-flex items-center font-semibold text-[#0B253B]">
                  <PlusSquare className="size-3.5 mx-0.5" aria-hidden="true" /> Tambah ke Layar Utama
                </span>
                .
              </p>
            ) : (
              <p className="text-xs text-[#425869] leading-relaxed">
                Buka menu browser{' '}
                <span className="inline-flex items-center font-semibold text-[#0B253B]">
                  <MoreVertical className="size-3.5 mx-0.5" aria-hidden="true" />
                </span>{' '}
                lalu pilih <strong className="text-[#0B253B]">Instal Aplikasi</strong> atau{' '}
                <strong className="text-[#0B253B]">Tambahkan ke Layar Utama</strong>.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
