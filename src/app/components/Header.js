'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`
                fixed top-0 left-0 right-0 z-50
                transition-all duration-500 ease-in-out
                ${isScrolled
                    ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-sm'
                    : 'bg-transparent'
                }
            `}
        >
            <div
                className={`
                    mx-auto px-8 py-4
                    transition-all duration-500 ease-in-out
                    ${isScrolled ? 'max-w-[1200px]' : 'max-w-[1400px]'}
                `}
            >
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <TrendingUp className="w-6 h-6 text-foreground group-hover:translate-y-[-2px] transition-transform" />
                        <span className={`text-2xl font-bold tracking-tight text-foreground ${spaceGrotesk.className}`}>
                            VibeStatss
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                            Features
                        </Link>
                        <Link href="#templates" className="text-sm font-medium hover:text-primary transition-colors">
                            Templates
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link href="/creator">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
