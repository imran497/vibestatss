import {
  Geist,
  Geist_Mono,
  Inter,
  Poppins,
  Montserrat,
  Outfit,
  DM_Sans,
  Work_Sans,
  Plus_Jakarta_Sans,
  Playfair_Display,
  Merriweather,
  Lora,
  Bebas_Neue,
  Oswald,
  Righteous,
  JetBrains_Mono,
  Space_Mono
} from "next/font/google";
import "./globals.css";
import GoogleAnalytics from './components/GoogleAnalytics';
import Analytics from './components/Analytics';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// High-quality Google Fonts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ['400', '500', '700'],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800'],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800', '900'],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ['300', '400', '700', '900'],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: ['400'],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
});

const righteous = Righteous({
  variable: "--font-righteous",
  subsets: ["latin"],
  weight: ['400'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800'],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ['400', '700'],
});

export const metadata = {
  title: "VibeStatss - Create Stunning Social Media Videos",
  description: "Transform your milestones into engaging videos. Create professional follower count animations, stats videos, and more with customizable templates and stunning effects.",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: "VibeStatss - Create Stunning Social Media Videos",
    description: "Transform your milestones into engaging videos. Create professional follower count animations, stats videos, and more with customizable templates and stunning effects.",
    url: 'https://vibestatss.com',
    siteName: 'VibeStatss',
    images: [
      {
        url: '/VibeStatss.png',
        width: 2702,
        height: 1406,
        alt: 'VibeStatss - Create Stunning Social Media Videos',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "VibeStatss - Create Stunning Social Media Videos",
    description: "Transform your milestones into engaging videos. Create professional follower count animations, stats videos, and more with customizable templates and stunning effects.",
    images: ['/VibeStatss.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${inter.variable}
          ${poppins.variable}
          ${montserrat.variable}
          ${outfit.variable}
          ${dmSans.variable}
          ${workSans.variable}
          ${plusJakarta.variable}
          ${playfair.variable}
          ${merriweather.variable}
          ${lora.variable}
          ${bebasNeue.variable}
          ${oswald.variable}
          ${righteous.variable}
          ${jetbrainsMono.variable}
          ${spaceMono.variable}
          antialiased
        `}
      >
        <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
