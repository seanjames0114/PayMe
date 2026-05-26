import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PayMe — Split bills, not friendships",
  description: "Snap your receipt, share a link, everyone picks what they ordered and pays you directly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#FFFBF7]">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
