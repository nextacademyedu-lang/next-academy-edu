import type { Metadata } from "next";
import {
  Dela_Gothic_One,
  General_Sans,
  Sansation,
  Noto_Sans,
} from "next/font/google";
import "./globals.css";

const delaGothicOne = Dela_Gothic_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dela-gothic-one",
});
const generalSans = General_Sans({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-general-sans",
});
const sansation = Sansation({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-sansation",
});
const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "900"],
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "Cardoo Headphone",
  description: "Cardoo Headphone landing page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${delaGothicOne.variable} ${generalSans.variable} ${sansation.variable} ${notoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
