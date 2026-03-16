import type { Metadata } from "next";
import { Audiowide, Outfit } from "next/font/google";
import "./globals.css";

const audiowide = Audiowide({
  weight: "400",
  variable: "--font-audiowide",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Phase Delegation Map | Global Validator Distribution",
  description:
    "Interactive map showing Phase Delegation validators across the globe. Explore validator locations, stake distribution, and ecosystem diversity.",
  openGraph: {
    title: "Phase Delegation Map",
    description:
      "Interactive map of Phase Delegation validators worldwide.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${audiowide.variable} ${outfit.variable} font-body antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
