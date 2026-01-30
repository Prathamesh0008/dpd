import "./globals.css";

export const metadata = { title: "DPD Label System" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
