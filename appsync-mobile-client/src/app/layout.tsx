export const metadata = {
  title: 'AppSync Payment Demo',
  description: 'QR Payment with AppSync',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
    <body>{children}</body>
    </html>
  );
}
