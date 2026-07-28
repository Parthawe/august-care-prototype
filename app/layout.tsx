import type { Metadata } from "next";
import { DM_Serif_Display, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const editorial = DM_Serif_Display({
  variable: "--font-editorial",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "August — Independent care flows",
  description:
    "An interactive product design prototype with focused August care flows for intake, clinician care, reports, decisions, and safety.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "August — Independent care flows",
    description:
      "Review focused August flows for intake, clinician care, reports, decisions, and safety.",
    images: ["/og-august-conversation.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${editorial.variable}`}>
        {children}
      </body>
    </html>
  );
}
