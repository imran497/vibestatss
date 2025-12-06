'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import Image from 'next/image';
import UserDropdown from './UserDropdown';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, loading } = useAuth();

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
                    <Link href="/" className="group">
                        <Image
                            src="/VibeLogo_black.svg"
                            alt="VibeStatss"
                            width={150}
                            height={40}
                            className="h-8 w-auto group-hover:opacity-80 transition-opacity"
                            priority
                        />
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
                        {!loading && (
                            user ? (
                                <UserDropdown position="bottom" />
                            ) : (
                                <Link href="/login">
                                    <Button>Get Started</Button>
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
