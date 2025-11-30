'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Preview from '../components/Preview';
import { Outfit, Inter, Playfair_Display, Space_Mono } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({ subsets: ['latin'] });
const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'] });

const fonts = {
    outfit: outfit.className,
    inter: inter.className,
    playfair: playfair.className,
    spaceMono: spaceMono.className,
};

function RenderContent() {
    const searchParams = useSearchParams();
    const [config, setConfig] = useState(null);

    useEffect(() => {
        const configParam = searchParams.get('config');
        if (configParam) {
            try {
                const decoded = JSON.parse(atob(configParam));
                setConfig(decoded);
            } catch (e) {
                console.error('Failed to parse config:', e);
            }
        }
    }, [searchParams]);

    if (!config) return <div className="text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Preview config={config} fonts={fonts} hideControls={true} />
        </div>
    );
}

export default function RenderPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RenderContent />
        </Suspense>
    );
}
