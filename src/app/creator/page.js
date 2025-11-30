'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to default template (ID: 1 - Follower Count)
    router.replace('/creator/1');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}
