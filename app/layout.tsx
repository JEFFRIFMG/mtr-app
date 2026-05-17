import type { Metadata } from "next";
import { Gantari } from "next/font/google";
import "./globals.css";

// Load font Gantari dari Google Fonts
const gantari = Gantari({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: "MyTradingReviews",
  description: "Independent rankings of 590+ regulated brokers worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      {/* Pasang class font Gantari langsung di tag body */}
      <body className={`${gantari.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}