'use client';

import { use } from 'react';
import { redirect } from 'next/navigation';
import Followers from '../templates/followers';

// Template registry - maps template IDs to their components
const TEMPLATES = {
  '1': {
    id: 1,
    slug: 'follower-count',
    name: 'Number Milestone',
    component: Followers,
  },
  // Future templates will be added here
  // '2': {
  //   id: 2,
  //   slug: 'daily-update',
  //   name: 'Daily Update',
  //   component: DailyUpdate,
  // },
};

export default function TemplatePage({ params }) {
  const { templateId } = use(params);

  // Get the template configuration
  const template = TEMPLATES[templateId];

  // If template doesn't exist, redirect to default template (1)
  if (!template) {
    redirect('/creator/1');
  }

  const TemplateComponent = template.component;

  return <TemplateComponent templateId={template.id} templateName={template.name} />;
}
