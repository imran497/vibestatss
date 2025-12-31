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

// Template-specific metadata for SEO
const TEMPLATE_METADATA = {
  '1': {
    title: 'Number Milestone Video Creator | Follower Count Animations - VibeStatss',
    description: 'Create stunning animated videos celebrating your follower milestones. Perfect for showcasing subscriber counts, follower achievements, and social media growth.',
  },
  '2': {
    title: 'X Verified Followers Video | Twitter Blue Checkmark Stats - VibeStatss',
    description: 'Showcase your verified followers on X (Twitter) with animated videos. Highlight your blue checkmark audience and verified follower statistics.',
  },
  '3': {
    title: 'X Analytics Video Creator | Twitter Stats Visualization - VibeStatss',
    description: 'Turn your X (Twitter) analytics into stunning videos. Visualize impressions, engagements, likes, and replies with beautiful animated cards.',
  },
  '4': {
    title: 'Text Video Creator | Animated Text Videos for Social Media - VibeStatss',
    description: 'Create animated text videos with custom styling and effects. Perfect for daily updates, announcements, and social media content.',
  },
  '5': {
    title: 'GitHub Heatmap Video | Contribution Graph Animation - VibeStatss',
    description: 'Animate your GitHub contribution heatmap with bubble pop effects. Perfect for showcasing your coding activity and open source contributions.',
  },
  '6': {
    title: 'Product Launch Video Creator | Announcement Videos - VibeStatss',
    description: 'Create stunning product launch announcement videos. Perfect for Product Hunt launches, app releases, and feature announcements on any platform.',
  },
};

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

  // Update document title and meta description for SEO
  useEffect(() => {
    const metadata = TEMPLATE_METADATA[templateId];
    if (metadata) {
      document.title = metadata.title;

      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = metadata.description;

      // Update OG tags with cache busting
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.content = metadata.title;

      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.content = metadata.description;

      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.content = `/VibeStatss.png?v=${Date.now()}`;
    }
  }, [templateId]);

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
