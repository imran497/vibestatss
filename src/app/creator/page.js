'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to default template (ID: 2 - X Verified Followers)
    router.replace('/creator/2');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}
