import Script from 'next/script'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VibeStatss - Create Stunning Social Media Videos",
  description: "Transform your milestones into engaging videos. Create professional follower count animations, stats videos, and more with customizable templates and stunning effects.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <script
        defer
        data-website-id="dfid_p36MUe7umZldomrEKtBko"
        data-domain="vibestatss.com"
        src="https://datafa.st/js/script.js">
      </script>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
      <Script src="https://scripts.simpleanalyticscdn.com/latest.js"  />
    </html>
  );
}
