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
  title: "VibeStatss - Turn Anything Into Engaging Videos | Free Video Creator",
  description: "Create stunning animated videos for social media in seconds. Announce launches, celebrate milestones, visualize stats, or share updates. Built for creators and developers. 100% Free.",
  keywords: "video creator, social media videos, animated videos, product launch video, milestone video, stats visualization, GitHub contributions, X analytics, free video maker",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: "VibeStatss - Turn Anything Into Engaging Videos",
    description: "Create stunning animated videos for social media. Announce launches, celebrate milestones, visualize stats. Built for creators and developers.",
    url: 'https://vibestatss.com',
    siteName: 'VibeStatss',
    images: [
      {
        url: `/VibeStatss.png?v=${Date.now()}`,
        width: 2702,
        height: 1406,
        alt: 'VibeStatss - Turn Anything Into Engaging Videos',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "VibeStatss - Turn Anything Into Engaging Videos",
    description: "Create stunning animated videos for social media. Announce launches, celebrate milestones, visualize stats. Built for creators and developers.",
    images: [`/VibeStatss.png?v=${Date.now()}`],
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
