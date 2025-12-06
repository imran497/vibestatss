'use client';

import { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import TemplateSelectorModal from './TemplateSelectorModal';

export default function TemplateSelector({ currentTemplateId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => setIsModalOpen(true)}
      >
        <LayoutGrid size={16} />
        Change Template
      </Button>

      <TemplateSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentTemplate={currentTemplateId}
      />
    </>
  );
}
