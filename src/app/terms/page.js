'use client';

import { Outfit } from 'next/font/google';
import Header from '../components/Header';
import Link from 'next/link';

const outfit = Outfit({ subsets: ['latin'] });

export default function TermsPage() {
  return (
    <main className={`min-h-screen bg-background ${outfit.className}`}>
      <Header />

      <div className="pt-32 pb-20 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">Terms and Conditions</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using VibeStatss, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">2. Use License</h2>
              <p className="text-muted-foreground mb-4">
                Permission is granted to temporarily use VibeStatss for personal, non-commercial purposes. This license shall automatically terminate if you violate any of these restrictions.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Create videos using our templates</li>
                <li>Download and share your created content</li>
                <li>Use the service for personal or commercial projects</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">3. User Content</h2>
              <p className="text-muted-foreground mb-4">
                You retain all rights to the content you create using VibeStatss. We do not claim ownership of your videos, images, or any content you upload to our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">4. Prohibited Uses</h2>
              <p className="text-muted-foreground mb-4">
                You may not use VibeStatss:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>In any way that violates any applicable law or regulation</li>
                <li>To transmit any harmful or malicious code</li>
                <li>To impersonate or attempt to impersonate the company or other users</li>
                <li>To engage in any automated use of the system</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">5. Disclaimer</h2>
              <p className="text-muted-foreground mb-4">
                The service is provided "as is" without any warranties, expressed or implied. We do not warrant that the service will be uninterrupted, secure, or error-free.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">6. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                VibeStatss shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">7. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these terms at any time. We will notify users of any changes by updating the "Last updated" date at the top of this page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">8. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms and Conditions, please contact us through our website.
              </p>
            </section>
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
          <div className="mb-4">
            <Link href="/contact" className="text-primary hover:underline">
              Contact Us
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} <span className="font-semibold">VibeStatss</span>. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
