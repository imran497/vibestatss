'use client';

import { useRouter } from 'next/navigation';
import { Outfit } from 'next/font/google';
import Header from './components/Header';
import { Button } from './components/ui/button';
import { Sparkles, Zap, Video, Download, Github, Star, Shield, Palette, Share2, ChevronDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import VideoCarousel from './components/VideoCarousel';
import { motion } from 'framer-motion';

const outfit = Outfit({ subsets: ['latin'] });

export default function LandingPage() {
    const router = useRouter();

    return (
        <main className={`min-h-screen bg-white text-gray-900 selection:bg-primary/20 ${outfit.className}`}>
            <Header />

            {/* --- HERO SECTION --- */}
            <section className="relative pt-24 pb-8 lg:pt-36 lg:pb-12 px-6 overflow-hidden">
                {/* Sophisticated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />

                {/* Radial Gradient Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent" />

                {/* Animated Mesh Gradient Orbs */}
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0.6, 0.4]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-0 left-[10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-[120px]"
                />

                <motion.div
                    animate={{
                        x: [0, -80, 0],
                        y: [0, 60, 0],
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute top-[20%] right-[5%] w-[500px] h-[500px] bg-gradient-to-bl from-purple-200/40 to-pink-200/40 rounded-full blur-[100px]"
                />

                <motion.div
                    animate={{
                        x: [0, 60, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 4
                    }}
                    className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] bg-gradient-to-tr from-orange-200/30 to-yellow-200/30 rounded-full blur-[90px]"
                />

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
                }} />

                {/* Floating Cards */}
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, 0]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-32 left-[12%] w-16 h-16 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center opacity-60 hidden lg:flex"
                >
                    <Sparkles className="h-8 w-8 text-purple-500" />
                </motion.div>

                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        rotate: [0, -5, 0]
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                    }}
                    className="absolute top-24 right-[12%] w-20 h-20 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center opacity-60 hidden lg:flex"
                >
                    <Zap className="h-10 w-10 text-blue-500" />
                </motion.div>

                <motion.div
                    animate={{
                        y: [0, -15, 0],
                        rotate: [0, 3, 0]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute top-[45%] left-[8%] w-14 h-14 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center opacity-60 hidden lg:flex"
                >
                    <Video className="h-7 w-7 text-pink-500" />
                </motion.div>

                <motion.div
                    animate={{
                        y: [0, 25, 0],
                        rotate: [0, -8, 0]
                    }}
                    transition={{
                        duration: 6.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3
                    }}
                    className="absolute top-[48%] right-[10%] w-16 h-16 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center opacity-60 hidden lg:flex"
                >
                    <Download className="h-8 w-8 text-green-500" />
                </motion.div>

                <motion.div
                    animate={{
                        y: [0, -18, 0],
                        rotate: [0, 6, 0]
                    }}
                    transition={{
                        duration: 5.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5
                    }}
                    className="absolute top-[35%] right-[6%] w-12 h-12 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center opacity-60 hidden lg:flex"
                >
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                </motion.div>

                <motion.div
                    animate={{
                        y: [0, 22, 0],
                        rotate: [0, -4, 0]
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.8
                    }}
                    className="absolute top-[38%] left-[6%] w-18 h-18 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center opacity-60 hidden lg:flex p-4"
                >
                    <Github className="h-9 w-9 text-gray-700" />
                </motion.div>

                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] [mask-image:linear-gradient(180deg,black,rgba(0,0,0,0))]" />

                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium mb-8 text-gray-600 hover:border-gray-300 hover:shadow-md transition-all cursor-default"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        New: GitHub Heatmap Video Template
                    </motion.div>

                    <motion.h1
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
                    >
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="inline-block text-gray-900"
                        >
                            Turn Your Stats Into
                        </motion.span>
                        <br />
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="inline-block relative"
                        >
                            <span className="text-gray-900">Celebration </span>
                            <span className="relative inline-block">
                                <span className="text-gray-900">Videos</span>
                                <motion.span
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 0.8, delay: 0.8 }}
                                    className="absolute bottom-2 left-0 h-3 bg-blue-200 -z-10"
                                />
                            </span>
                        </motion.span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        Create stunning, animated videos of your GitHub contributions, milestones, and achievements in seconds. No design skills required.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/creator/1">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl">
                                    <Zap className="mr-2 h-5 w-5" />
                                    Start Creating Free
                                </Button>
                            </motion.div>
                        </Link>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                                <Video className="mr-2 h-5 w-5" />
                                View Examples
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Video Carousel Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, type: "spring", stiffness: 50 }}
                    className="mt-16 relative z-10"
                >
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/40 to-transparent z-20 pointer-events-none" />
                    <VideoCarousel />
                </motion.div>
            </section>

            {/* --- SOCIAL PROOF --- */}
            <section className="py-6 border-y border-gray-100 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    {/* Featured On Badges */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-widest">Featured on</p>
                        <div className="flex flex-wrap justify-center items-center gap-6">
                            <a href="https://twelve.tools" target="_blank" rel="noopener noreferrer">
                                <img src="https://twelve.tools/badge0-white.svg" alt="Featured on Twelve Tools" width="180" height="48" className="transition-opacity hover:opacity-80" />
                            </a>
                            <a href="https://wired.business" target="_blank" rel="noopener noreferrer">
                                <img src="https://wired.business/badge0-white.svg" alt="Featured on Wired Business" width="180" height="48" className="transition-opacity hover:opacity-80" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- BENTO GRID FEATURES --- */}
            <section id="features" className="py-32 px-6 relative bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">Everything you need to <br /> go viral</h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Powerful tools designed to help you share your achievements with style and impact.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Large Card */}
                        <div className="md:col-span-2 bg-white border border-gray-100 rounded-3xl p-8 md:p-12 relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors" />
                            <div className="relative z-10">
                                <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                    <Palette className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-900">Custom Themes</h3>
                                <p className="text-gray-600 text-lg mb-8 max-w-md">
                                    Choose from our curated collection of themes or create your own. Match your personal brand perfectly.
                                </p>
                                <div className="grid grid-cols-3 gap-3 max-w-sm">
                                    {['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'].map((c, i) => (
                                        <div key={i} className="h-8 rounded-md w-full shadow-sm" style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Tall Card */}
                        <div className="md:row-span-2 bg-white border border-gray-100 rounded-3xl p-8 md:p-12 relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gray-50 to-transparent" />
                            <div className="relative z-10 h-full flex flex-col">
                                <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                                    <Download className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-900">4K Export</h3>
                                <p className="text-gray-600 text-lg mb-8">
                                    Crystal clear quality optimized for Twitter, LinkedIn, and Instagram.
                                </p>
                                <div className="mt-auto bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-500">Format</span>
                                        <span className="text-sm font-mono text-gray-900">MP4</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-500">Resolution</span>
                                        <span className="text-sm font-mono text-green-600 font-bold">4K UHD</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">FPS</span>
                                        <span className="text-sm font-mono text-gray-900">60</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Small Card 1 */}
                        <div className="bg-white border border-gray-100 rounded-3xl p-8 relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                            <div className="h-12 w-12 bg-green-50 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                                <Shield className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900">Privacy First</h3>
                            <p className="text-gray-600">No login required. We don't store your data.</p>
                        </div>

                        {/* Small Card 2 */}
                        <div className="bg-white border border-gray-100 rounded-3xl p-8 relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                            <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 text-orange-600">
                                <Share2 className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900">One-Click Share</h3>
                            <p className="text-gray-600">Instant sharing to your favorite platforms.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- STATS SECTION --- */}
            <section className="py-20 border-y border-gray-100 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">10k+</div>
                            <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Videos Created</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">50+</div>
                            <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Countries</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">1M+</div>
                            <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Views Generated</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">100%</div>
                            <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Free to Use</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- TESTIMONIALS --- */}
            <section className="py-32 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">Loved by Developers</h2>
                        <p className="text-gray-600 text-lg">Don't just take our word for it.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                name: "Sarah Chen",
                                role: "Frontend Engineer",
                                text: "The GitHub heatmap video generator is insane! I used it for my portfolio and got so many compliments. The animations are buttery smooth."
                            },
                            {
                                name: "Alex Rivera",
                                role: "Full Stack Dev",
                                text: "Finally, a way to share my coding streak that actually looks good on Instagram. The dark mode themes are perfect."
                            },
                            {
                                name: "Jordan Smith",
                                role: "Open Source Maintainer",
                                text: "I use VibeStatss to celebrate our project milestones. It's become a tradition for our team releases. Highly recommend!"
                            }
                        ].map((testimonial, i) => (
                            <div key={i} className="bg-white border border-gray-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-sm text-gray-700">
                                        {testimonial.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                        <div className="text-xs text-gray-500">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FAQ --- */}
            <section className="py-20 px-6 max-w-3xl mx-auto bg-white">
                <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {[
                        { q: "Is it really free?", a: "Yes! VibeStatss is currently 100% free to use. We might introduce premium features later, but the core features will remain free." },
                        { q: "Do I need to login?", a: "No login is required to create videos. However, creating an account lets you save your preferences and access history." },
                        { q: "Can I use the videos commercially?", a: "Absolutely. You own the rights to any video you create using our platform." },
                        { q: "How do I export in 4K?", a: "The export quality is automatically optimized based on your browser capabilities. We aim for the highest resolution possible." }
                    ].map((item, i) => (
                        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                            <details className="group">
                                <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-6 text-gray-900">
                                    <span>{item.q}</span>
                                    <span className="transition group-open:rotate-180">
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                    </span>
                                </summary>
                                <div className="text-gray-600 px-6 pb-6 pt-0 leading-relaxed">
                                    {item.a}
                                </div>
                            </details>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- CTA --- */}
            <section className="py-32 px-6 text-center bg-white">
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 p-1 rounded-3xl shadow-2xl">
                    <div className="bg-white rounded-[22px] p-12 md:p-20 border border-white/50 relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-[100px] pointer-events-none opacity-50" />

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">Ready to go viral?</h2>
                            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                                Join thousands of developers sharing their journey.
                            </p>
                            <Link href="/creator/1">
                                <Button size="lg" className="h-16 px-10 text-xl rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                                    Start Creating Now <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="border-t border-gray-100 py-12 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-8 w-8 bg-gray-900 rounded-lg flex items-center justify-center">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">VibeStatss</span>
                        </div>
                        <p className="text-gray-500 max-w-sm mb-8">
                            The easiest way to create stunning, animated videos for your social media.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><Github className="h-5 w-5" /></Link>
                            <Link href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><Share2 className="h-5 w-5" /></Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-gray-900">Product</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li><Link href="/creator/1" className="hover:text-gray-900 transition-colors">Templates</Link></li>
                            <li><Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-gray-900 transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-gray-900">Company</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li><Link href="/about" className="hover:text-gray-900 transition-colors">About</Link></li>
                            <li><Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link></li>
                            <li><Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-200 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} VibeStatss. All rights reserved.
                </div>
            </footer>
        </main>
    );
}
