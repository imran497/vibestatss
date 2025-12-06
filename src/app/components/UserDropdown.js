'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function UserDropdown({ position = 'top' }) {
    const { user, loading, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* User Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
            >
                {/* User Avatar */}
                {user.profile_image ? (
                    <img
                        src={user.profile_image}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-border/50"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                    </div>
                )}

                {/* User Info */}
                <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-medium truncate">
                        {user.name}
                    </p>
                    {user.email && (
                        <p className="text-[10px] text-muted-foreground truncate">
                            {user.email}
                        </p>
                    )}
                </div>

                {/* Dropdown Arrow */}
                <ChevronDown
                    className={`w-3.5 h-3.5 flex-shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={`
                    absolute left-0 right-0 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50
                    ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
                `}>
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                        <div className="flex items-center gap-3">
                            {user.profile_image ? (
                                <img
                                    src={user.profile_image}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-border"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
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

                    {/* Menu Items */}
                    <div className="py-1">
                        <Link
                            href="/creator"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                        >
                            <User className="w-4 h-4" />
                            <span>My Creator Studio</span>
                        </Link>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                logout();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors text-red-500 hover:text-red-600"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
