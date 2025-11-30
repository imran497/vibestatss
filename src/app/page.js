'use client';

import { Outfit } from 'next/font/google';
import Header from './components/Header';
import { Button } from './components/ui/button';
import { Sparkles, Zap, Video, Download } from 'lucide-react';
import Link from 'next/link';
import VideoCarousel from './components/VideoCarousel';

const outfit = Outfit({ subsets: ['latin'] });

export default function LandingPage() {
    return (
        <main className={`min-h-screen bg-background ${outfit.className}`}>
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-12 px-8 overflow-hidden">
                {/* Ambient Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
                    <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
                </div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                <div className="relative z-10 max-w-[1400px] mx-auto">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                            <Sparkles size={16} />
                            <span>Celebrate Your Milestones</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-b from-gray-700 via-gray-400 to-gray-700 bg-clip-text text-transparent">
                            Turn Your Stats Into
                            <br />
                            Celebration Videos
                        </h1>

                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                            Share your achievements in style. Create stunning animated videos of your milestones,
                            follower counts, and progress stats. Perfect for social media celebrations.
                        </p>

                        <div className="flex items-center justify-center gap-4 mb-16">
                            <Link href="/creator">
                                <Button size="lg" className="text-lg px-8 py-6">
                                    <Zap className="mr-2" size={20} />
                                    Start Creating
                                </Button>
                            </Link>
                            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                                <Video className="mr-2" size={20} />
                                Watch Demo
                            </Button>
                        </div>

                        {/* Video Carousel */}
                        <div id="templates">
                            <VideoCarousel />
                        </div>

                        {/* Title and Description below videos */}
                        <div className="text-center mt-8">
                            <h2 className="text-3xl font-bold mb-3">See What You Can Create</h2>
                            <p className="text-lg text-muted-foreground">
                                Real examples created with our platform
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-8 bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
                        <p className="text-xl text-muted-foreground">
                            Powerful features to bring your content to life
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-card p-8 rounded-2xl border border-border">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                                <Sparkles className="text-purple-500" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Stunning Animations</h3>
                            <p className="text-muted-foreground">
                                Choose from 6 animation styles including fade, slide, scale, rotate, and bounce effects.
                            </p>
                        </div>

                        <div className="bg-card p-8 rounded-2xl border border-border">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center mb-4">
                                <Zap className="text-orange-500" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Easy Customization</h3>
                            <p className="text-muted-foreground">
                                Customize colors, fonts, gradients, and timing with our intuitive interface.
                            </p>
                        </div>

                        <div className="bg-card p-8 rounded-2xl border border-border">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-teal-500/20 flex items-center justify-center mb-4">
                                <Download className="text-green-500" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Export Ready</h3>
                            <p className="text-muted-foreground">
                                Download high-quality MP4 videos optimized for all social media platforms.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl font-bold mb-6">
                        Ready to Create Amazing Videos?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        Join thousands of creators making stunning content every day
                    </p>
                    <Link href="/creator">
                        <Button size="lg" className="text-lg px-12 py-6">
                            <Sparkles className="mr-2" size={20} />
                            Get Started Free
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-12 px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-muted-foreground">
                            &copy; {new Date().getFullYear()} <span className="font-semibold">VibeStatss</span>. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Terms & Conditions
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
