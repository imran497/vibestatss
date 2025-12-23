'use client';

import { use, Suspense, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import Followers from '../templates/followers';
import XVerifiedFollowers from '../templates/verified-followers';
import XAnalytics from '../templates/x-analytics';
import DailyUpdate from '../templates/daily-update';
import GitHubHeatmap from '../templates/github-heatmap';
import LaunchAnnouncement from '../templates/launch-announcement';

// Template registry - maps template IDs to their components
const TEMPLATES = {
  '1': {
    id: 1,
    slug: 'follower-count',
    name: 'Number Milestone',
    component: Followers,
    isPremium: false,
  },
  '2': {
    id: 2,
    slug: 'verified-followers',
    name: 'X Verified Followers',
    component: XVerifiedFollowers,
    isPremium: true,
  },
  '3': {
    id: 3,
    slug: 'x-analytics',
    name: 'X Analytics',
    component: XAnalytics,
    isPremium: true,
  },
  '4': {
    id: 4,
    slug: 'daily-update',
    name: 'Text Videos',
    component: DailyUpdate,
    isPremium: false,
  },
  '5': {
    id: 5,
    slug: 'github-heatmap',
    name: 'GitHub Heatmap',
    component: GitHubHeatmap,
    isPremium: true,
  },
  '6': {
    id: 6,
    slug: 'launch-announcement',
    name: 'Launch Announcement',
    component: LaunchAnnouncement,
    isPremium: true,
  },
};

function TemplateRenderer({ params }) {
  const { templateId } = use(params);
  const { isAuthenticated, loading } = useAuth();

  // Get the template configuration
  const template = TEMPLATES[templateId];

  // If template doesn't exist, redirect to default template (1)
  if (!template) {
    redirect('/creator/1');
  }

  // Check if template is premium and user is not authenticated
  useEffect(() => {
    if (!loading && template.isPremium && !isAuthenticated) {
      // Store the template ID to redirect after login
      localStorage.setItem('pendingTemplateId', templateId);
      localStorage.setItem('returnUrl', `/creator/${templateId}`);
      // Redirect to login
      window.location.href = '/login';
    }
  }, [loading, template.isPremium, isAuthenticated, templateId]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If premium template and not authenticated, don't render (will redirect)
  if (template.isPremium && !isAuthenticated) {
    return null;
  }

  const TemplateComponent = template.component;

  return <TemplateComponent templateId={template.id} templateName={template.name} />;
}

export default function TemplatePage({ params }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <TemplateRenderer params={params} />
    </Suspense>
  );
}
