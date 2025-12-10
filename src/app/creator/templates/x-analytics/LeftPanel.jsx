'use client';

import { useState } from 'react';
import { Layers, ChevronRight, Upload, Edit } from 'lucide-react';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import TemplateSelectorModal from '@/app/creator/common/TemplateSelectorModal';

export default function LeftPanel({ config, setConfig, templateId, templateName }) {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [manualValues, setManualValues] = useState({
    impressions: config.impressions,
    engagements: config.engagements,
    likes: config.likes,
    replies: config.replies,
    profileVisits: config.profileVisits,
    newFollowers: config.newFollowers,
    unfollows: config.unfollows,
  });

  const updateConfig = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const updateManualValue = (field, value) => {
    setManualValues(prev => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  const handleManualSave = () => {
    setConfig(prev => ({
      ...prev,
      ...manualValues,
    }));
    setIsManualEntryOpen(false);
  };

  const handleCSVUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);

    try {
      const text = await file.text();
      const lines = text.trim().split('\n');

      if (lines.length < 2) {
        alert('CSV file is empty or invalid');
        return;
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
      console.log('CSV Headers found:', headers);

      // Find column indices (flexible matching)
      const impressionsIdx = headers.findIndex(h => h.includes('impressions'));
      const engagementsIdx = headers.findIndex(h => h.includes('engagements'));
      const likesIdx = headers.findIndex(h => h.includes('likes'));
      const repliesIdx = headers.findIndex(h => h.includes('replies'));
      const profileVisitsIdx = headers.findIndex(h => h.includes('profile visits'));
      const newFollowsIdx = headers.findIndex(h => h.includes('new follows'));
      const unfollowsIdx = headers.findIndex(h => h.includes('unfollows'));

      console.log('Column indices:', {
        impressionsIdx,
        engagementsIdx,
        likesIdx,
        repliesIdx,
        profileVisitsIdx,
        newFollowsIdx,
        unfollowsIdx
      });

      // Sum up values from all rows
      let totalImpressions = 0;
      let totalEngagements = 0;
      let totalLikes = 0;
      let totalReplies = 0;
      let totalProfileVisits = 0;
      let totalNewFollows = 0;
      let totalUnfollows = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));

        if (i === 1) {
          console.log('First data row:', values);
        }

        if (impressionsIdx !== -1) totalImpressions += parseInt(values[impressionsIdx + 2]) || 0;
        if (engagementsIdx !== -1) totalEngagements += parseInt(values[engagementsIdx + 2]) || 0;
        if (likesIdx !== -1) totalLikes += parseInt(values[likesIdx + 2]) || 0;
        if (repliesIdx !== -1) totalReplies += parseInt(values[repliesIdx + 2]) || 0;
        if (profileVisitsIdx !== -1) totalProfileVisits += parseInt(values[profileVisitsIdx + 2]) || 0;
        if (newFollowsIdx !== -1) totalNewFollows += parseInt(values[newFollowsIdx + 2]) || 0;
        if (unfollowsIdx !== -1) totalUnfollows += parseInt(values[unfollowsIdx + 2]) || 0;
      }

      console.log('Total rows processed:', lines.length - 1);

      console.log('CSV parsed successfully:', {
        impressions: totalImpressions,
        engagements: totalEngagements,
        likes: totalLikes,
        replies: totalReplies,
        profileVisits: totalProfileVisits,
        newFollowers: totalNewFollows,
        unfollows: totalUnfollows,
      });

      // Update config with totals
      setConfig(prev => ({
        ...prev,
        impressions: totalImpressions,
        engagements: totalEngagements,
        likes: totalLikes,
        replies: totalReplies,
        profileVisits: totalProfileVisits,
        newFollowers: totalNewFollows,
        unfollows: totalUnfollows,
      }));

      // Update manual values state to sync with CSV data
      setManualValues({
        impressions: totalImpressions,
        engagements: totalEngagements,
        likes: totalLikes,
        replies: totalReplies,
        profileVisits: totalProfileVisits,
        newFollowers: totalNewFollows,
        unfollows: totalUnfollows,
      });

      alert(`CSV uploaded successfully!\nImpressions: ${totalImpressions.toLocaleString()}\nEngagements: ${totalEngagements.toLocaleString()}\nLikes: ${totalLikes.toLocaleString()}`);

    } catch (err) {
      console.error('CSV parsing error:', err);
      alert('Failed to parse CSV file. Please check the format.');
    }
  };

  return (
    <>
      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        currentTemplate={templateId}
      />

      <div className="space-y-6">
        {/* Template Type Selection */}
        <div className="space-y-2">
          <Label className="font-medium flex items-center gap-2">
            <Layers size={16} className="text-primary" /> Template Type
          </Label>
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="w-full bg-muted hover:bg-muted/80 p-3 rounded-lg flex items-center justify-between transition-colors group"
          >
            <span className="font-medium">{templateName}</span>
            <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Template Info */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{templateName}</h2>
          <p className="text-sm text-muted-foreground">
            Showcase your X (Twitter) analytics with stunning cards
          </p>
        </div>

        {/* Manual Input for Verified Followers */}
        <div className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
          <h3 className="font-semibold text-sm">Verified Followers</h3>

          <div className="space-y-2">
            <Label htmlFor="verifiedFollowers">Verified Count</Label>
            <Input
              id="verifiedFollowers"
              type="number"
              value={config.verifiedFollowers}
              onChange={(e) => updateConfig('verifiedFollowers', parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalFollowers">Total Count</Label>
            <Input
              id="totalFollowers"
              type="number"
              value={config.totalFollowers}
              onChange={(e) => updateConfig('totalFollowers', parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
        </div>

        {/* CSV Upload */}
        <div className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
          <h3 className="font-semibold text-sm">Analytics Data</h3>

          <div className="space-y-2">
            <Label htmlFor="csvUpload">Upload CSV File</Label>
            <div className="relative">
              <input
                id="csvUpload"
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
              <button
                onClick={() => document.getElementById('csvUpload').click()}
                className="w-full p-3 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={18} />
                <span className="text-sm">
                  {csvFileName || 'Choose CSV file'}
                </span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload your X Analytics CSV export
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <button
            onClick={() => setIsManualEntryOpen(true)}
            className="w-full p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Edit size={18} />
            <span className="text-sm font-medium">Enter Manually</span>
          </button>
        </div>

        {/* Animation Settings */}
        <div className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
          <h3 className="font-semibold text-sm">Animation Settings</h3>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showConfetti"
              checked={config.showConfetti}
              onChange={(e) => updateConfig('showConfetti', e.target.checked)}
              className="w-4 h-4 rounded border-input"
            />
            <Label htmlFor="showConfetti" className="cursor-pointer">Show Confetti</Label>
          </div>

          {config.showConfetti && (
            <div className="space-y-3 pl-6 border-l-2 border-border">
              <Label className="text-xs">Confetti Colors</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="confettiColor1" className="text-xs text-muted-foreground">Color 1</Label>
                  <input
                    type="color"
                    id="confettiColor1"
                    value={config.confettiColors[0]}
                    onChange={(e) => {
                      const newColors = [...config.confettiColors];
                      newColors[0] = e.target.value;
                      updateConfig('confettiColors', newColors);
                    }}
                    className="w-full h-10 rounded border border-border cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confettiColor2" className="text-xs text-muted-foreground">Color 2</Label>
                  <input
                    type="color"
                    id="confettiColor2"
                    value={config.confettiColors[1]}
                    onChange={(e) => {
                      const newColors = [...config.confettiColors];
                      newColors[1] = e.target.value;
                      updateConfig('confettiColors', newColors);
                    }}
                    className="w-full h-10 rounded border border-border cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry Modal */}
      {isManualEntryOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsManualEntryOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg shadow-2xl border border-border w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Enter Analytics Manually</h3>
                <button
                  onClick={() => setIsManualEntryOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-impressions">Impressions</Label>
                  <Input
                    id="manual-impressions"
                    type="number"
                    value={manualValues.impressions}
                    onChange={(e) => updateManualValue('impressions', e.target.value)}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-engagements">Engagements</Label>
                  <Input
                    id="manual-engagements"
                    type="number"
                    value={manualValues.engagements}
                    onChange={(e) => updateManualValue('engagements', e.target.value)}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-likes">Likes</Label>
                  <Input
                    id="manual-likes"
                    type="number"
                    value={manualValues.likes}
                    onChange={(e) => updateManualValue('likes', e.target.value)}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-replies">Replies</Label>
                  <Input
                    id="manual-replies"
                    type="number"
                    value={manualValues.replies}
                    onChange={(e) => updateManualValue('replies', e.target.value)}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-profileVisits">Profile Visits</Label>
                  <Input
                    id="manual-profileVisits"
                    type="number"
                    value={manualValues.profileVisits}
                    onChange={(e) => updateManualValue('profileVisits', e.target.value)}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-newFollowers">New Followers</Label>
                  <Input
                    id="manual-newFollowers"
                    type="number"
                    value={manualValues.newFollowers}
                    onChange={(e) => updateManualValue('newFollowers', e.target.value)}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-unfollows">Unfollows</Label>
                  <Input
                    id="manual-unfollows"
                    type="number"
                    value={manualValues.unfollows}
                    onChange={(e) => updateManualValue('unfollows', e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-3">
                <button
                  onClick={() => setIsManualEntryOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualSave}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
