'use client';

import { useState } from 'react';
import { Menu, X, LogOut, User as UserIcon, Home, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();

    const handleLogout = () => {
        setIsOpen(false);
        logout();
    };

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-card border border-border shadow-lg hover:bg-muted/50 transition-colors"
                aria-label="Open menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Slide-in Menu */}
                    <div className="lg:hidden fixed top-0 right-0 bottom-0 w-[280px] bg-card border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <Link href="/" onClick={() => setIsOpen(false)}>
                                <Image
                                    src="/VibeLogo_black.svg"
                                    alt="VibeStatss"
                                    width={120}
                                    height={32}
                                    className="h-6 w-auto"
                                />
                            </Link>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                aria-label="Close menu"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Menu Content */}
                        <div className="flex-1 overflow-y-auto">
                            {/* User Info Section */}
                            {user && (
                                <div className="p-4 border-b border-border bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        {user.profile_image ? (
                                            <img
                                                src={user.profile_image}
                                                alt={user.name}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-border"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                                <UserIcon className="w-6 h-6 text-white" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">
                                                {user.name}
                                            </p>
                                            {user.email && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {user.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Links */}
                            <nav className="p-4 space-y-1">
                                <Link
                                    href="/creator"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Creator Studio
                                </Link>
                                <Link
                                    href="/"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium"
                                >
                                    <Home className="w-5 h-5" />
                                    Home
                                </Link>
                            </nav>
                        </div>

                        {/* Logout Button at Bottom */}
                        <div className="p-4 border-t border-border">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 transition-colors text-sm font-medium text-red-500"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
