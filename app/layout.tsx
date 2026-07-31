import type { Metadata } from "next";
import { DM_Serif_Display, Inter, Poppins } from "next/font/google";
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

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://august-care-handoff.pawar-d-parth.chatgpt.site",
  ),
  title: {
    default: "August Care — Interactive Prototype",
    template: "%s · August Care",
  },
  description:
    "A fictional product-design prototype for conversational intake, direct clinician care, prescriptions, and nearby testing.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "August Care — Interactive Prototype",
    description:
      "Care that starts with a conversation, then moves directly to a human clinician.",
    images: [
      {
        url: "/og-august-care-v2.png",
        width: 1200,
        height: 630,
        alt: "August Care conversational prototype",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "August Care — Interactive Prototype",
    description:
      "Care that starts with a conversation, then moves directly to a human clinician.",
    images: ["/og-august-care-v2.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${editorial.variable} ${inter.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
