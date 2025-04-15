export const metadata = {
  title: 'AppSync Payment Demo',
  description: 'QR Payment with AppSync',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
    <body className="w-full min-h-screen bg-gray-100">
    <div className="max-w-screen-xl mx-auto p-6">
      {children}
    </div>
    </body>
    </html>
  );
}
