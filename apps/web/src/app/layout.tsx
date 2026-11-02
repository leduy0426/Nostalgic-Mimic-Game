import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/use-auth';
import { Header } from '@/components/layout/header';

export const metadata: Metadata = {
  title: 'Hồi Ức Học Trò - Nostalgic Mini Game Platform',
  description: 'Nền tảng mini game học đường hoài niệm: Tìm số 1-25, Cờ Caro, Lật hình với tính năng nâng cấp Avatar và chia sẻ kỷ lục.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-notebook-grid flex flex-col antialiased">
        <AuthProvider>
          <Header />
          <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
            {children}
          </main>
          <footer className="w-full border-t-2 border-ink bg-paper py-4 text-center text-xs text-ink-muted">
            <p className="font-bold">
              © 2026 Nostalgic Mini Game Platform • SE Project FPT University • Spec-Driven & Agent-Driven Development
            </p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

