export const metadata = {
  title: 'DocFactory API',
  description: 'Lightweight Markdown to PDF/Image/Word/HTML conversion API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}