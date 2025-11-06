import type { Metadata } from 'next';
import '@/styles/globals.css';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'EnglishBrain - AI-Powered English Speaking Practice',
  description:
    'Practice your English speaking skills with AI-powered instant feedback and personalized learning',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
          <footer className="border-t border-gray-200 bg-white py-6">
            <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-600 sm:px-6 lg:px-8">
              <p>
                &copy; {new Date().getFullYear()} EnglishBrain. AI-powered English
                learning platform.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
