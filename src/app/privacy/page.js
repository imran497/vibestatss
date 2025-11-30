'use client';

import { Outfit } from 'next/font/google';
import Header from '../components/Header';
import Link from 'next/link';

const outfit = Outfit({ subsets: ['latin'] });

export default function PrivacyPage() {
  return (
    <main className={`min-h-screen bg-background ${outfit.className}`}>
      <Header />

      <div className="pt-32 pb-20 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                VibeStatss is designed with privacy in mind. We collect minimal information necessary to provide our service:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Usage Data:</strong> We may collect information about how you use our service, such as features used and videos created.</li>
                <li><strong>Device Information:</strong> We may collect information about your device, including browser type and operating system.</li>
                <li><strong>Content You Create:</strong> Videos and images you create are processed locally in your browser and are not stored on our servers unless you explicitly choose to save them.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide and maintain our service</li>
                <li>Improve and optimize the user experience</li>
                <li>Analyze usage patterns to enhance our features</li>
                <li>Communicate with you about updates and new features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">3. Data Storage and Security</h2>
              <p className="text-muted-foreground mb-4">
                Your privacy is important to us. We implement appropriate security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Videos are processed locally in your browser</li>
                <li>We do not permanently store your created content</li>
                <li>We use industry-standard encryption for data transmission</li>
                <li>Access to any collected data is restricted to authorized personnel only</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">4. Cookies and Tracking</h2>
              <p className="text-muted-foreground mb-4">
                We may use cookies and similar tracking technologies to improve your experience on our website. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">5. Third-Party Services</h2>
              <p className="text-muted-foreground mb-4">
                We may use third-party services for analytics and performance monitoring. These services have their own privacy policies and we encourage you to review them.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of any inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Object to processing of your personal information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">7. Children's Privacy</h2>
              <p className="text-muted-foreground mb-4">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">8. Changes to This Policy</h2>
              <p className="text-muted-foreground mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">9. Cancellation & Refund Policy</h2>
              <p className="text-muted-foreground mb-4">
                We want you to be satisfied with our service. Here's our policy regarding cancellations and refunds:
              </p>

              <h3 className="text-2xl font-semibold mb-3 mt-6">Subscription Cancellation</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>You can cancel your subscription at any time from your account settings</li>
                <li>Upon cancellation, you will retain access to premium features until the end of your current billing period</li>
                <li>No partial refunds will be issued for unused time in the current billing cycle</li>
                <li>Cancelled subscriptions will not auto-renew</li>
              </ul>

              <h3 className="text-2xl font-semibold mb-3 mt-6">Refund Policy</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>14-Day Money-Back Guarantee:</strong> If you're not satisfied with our service, you can request a full refund within 14 days of your initial purchase</li>
                <li><strong>Refund Processing:</strong> Approved refunds will be processed within 5-10 business days to your original payment method</li>
                <li><strong>Eligibility:</strong> To be eligible for a refund, you must contact us within the 14-day window with a valid reason</li>
                <li><strong>Recurring Charges:</strong> Subsequent billing cycles are non-refundable. Please cancel before the renewal date to avoid charges</li>
              </ul>

              <h3 className="text-2xl font-semibold mb-3 mt-6">How to Request a Refund</h3>
              <p className="text-muted-foreground mb-4">
                To request a refund or cancel your subscription, please contact our support team at{' '}
                <a href="mailto:support@vibestatss.com" className="text-primary hover:underline">
                  support@vibestatss.com
                </a>{' '}
                with your account details and reason for cancellation.
              </p>

              <h3 className="text-2xl font-semibold mb-3 mt-6">Exceptions</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Violation of our Terms of Service may result in immediate cancellation without refund</li>
                <li>Fraudulent purchases or chargebacks will result in permanent account suspension</li>
                <li>Promotional or discounted subscriptions may have different refund terms as specified at the time of purchase</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-semibold mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy or how we handle your data, please contact us at{' '}
                <a href="/contact" className="text-primary hover:underline">
                  our contact page
                </a>{' '}
                or email us at{' '}
                <a href="mailto:support@vibestatss.com" className="text-primary hover:underline">
                  support@vibestatss.com
                </a>.
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
