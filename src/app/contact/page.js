'use client';

import { Outfit } from 'next/font/google';
import Header from '../components/Header';
import Link from 'next/link';
import { Mail, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

const outfit = Outfit({ subsets: ['latin'] });

export default function ContactPage() {
  return (
    <main className={`min-h-screen bg-background ${outfit.className}`}>
      <Header />

      <div className="pt-32 pb-20 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-muted-foreground mb-12 text-lg">
            Have questions or need help? We're here to assist you!
          </p>

          <div className="max-w-md mx-auto mb-12">
            {/* Contact Options */}
            <div className="bg-muted/50 rounded-lg p-6 border border-border text-center">
              <Mail className="w-8 h-8 text-primary mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Email Support</h3>
              <p className="text-muted-foreground mb-4">
                Get in touch with our support team for any inquiries.
              </p>
              <a href="mailto:support@vibestatss.com" className="text-primary hover:underline">
                support@vibestatss.com
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-muted/30 rounded-lg p-8 border border-border">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              Send us a Message
            </h2>

            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows="6"
                  className="w-full px-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>

              <Button type="submit" size="lg" className="w-full md:w-auto">
                Send Message
              </Button>
            </form>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <Link href="/" className="text-primary hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-8">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <div className="mb-4 space-x-4">
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} <span className="font-semibold">VibeStatss</span>. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
