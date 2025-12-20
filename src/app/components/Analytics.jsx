'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function Analytics() {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Only load analytics on production domain
    setIsProduction(window.location.hostname === 'vibestatss.com');
  }, []);

  if (!isProduction) {
    return null;
  }

  return (
    <>
      {/* DataFast Analytics */}
      <Script
        defer
        data-website-id="dfid_p36MUe7umZldomrEKtBko"
        data-domain="vibestatss.com"
        src="https://datafa.st/js/script.js"
        strategy="afterInteractive"
      />

      {/* Simple Analytics */}
      <Script
        src="https://scripts.simpleanalyticscdn.com/latest.js"
        strategy="afterInteractive"
      />
    </>
  );
}
