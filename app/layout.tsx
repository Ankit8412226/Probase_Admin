import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Probase Solutions Admin Dashboard",
  description: "Premium operational admin panel for IT services teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans text-ink">{children}</body>
    </html>
  );
}
