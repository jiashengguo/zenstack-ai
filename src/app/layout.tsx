import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { type Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "ZenStack AI Chat Todo",
  description:
    "A full-stack AI chat Todo app built with Next.js, ZenStack, and Vercel AI SDK",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
