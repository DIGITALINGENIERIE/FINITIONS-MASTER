import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Wand2, Settings2, Check, ChevronRight } from 'lucide-react';
import { DetectionResult, getMasterPreset } from '@/lib/master-detector';
import type { DnaConfiguration } from '@shared/schema';

interface MasterDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectionResult: DetectionResult | null;
  onApplyPreset: (config: DnaConfiguration, masterName: string) => void;
  onManualSelect: () => void;
}

export function MasterDetectionModal({
  isOpen,
  onClose,
  detectionResult,
  onApplyPreset,
  onManualSelect
}: MasterDetectionModalProps) {
  const [isApplying, setIsApplying] = useState(false);

  if (!detectionResult) return null;

  const masterPreset = getMasterPreset(detectionResult.suggestedMaster);
  if (!masterPreset) return null;

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      onApplyPreset(masterPreset.configuration, masterPreset.displayName);
      setIsApplying(false);
      onClose();
    }, 300);
  };

  const handleSelectAlternative = (masterId: string) => {
    const altPreset = getMasterPreset(masterId);
    if (altPreset) {
      onApplyPreset(altPreset.configuration, altPreset.displayName);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-master-detection">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Style Detection - Step 0
          </DialogTitle>
          <DialogDescription>
            Analysis complete. Optimal finishing parameters detected.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Suggested Master</span>
              <Badge variant="secondary" className="text-xs">
                {detectionResult.confidence}% match
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-primary">
              {masterPreset.displayName}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {masterPreset.period}
            </p>
            <div className="mt-3">
              <Progress value={detectionResult.confidence} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {detectionResult.reasoning}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Characteristics
            </span>
            <div className="flex flex-wrap gap-1">
              {masterPreset.characteristics.slice(0, 4).map((char, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {char}
                </Badge>
              ))}
            </div>
          </div>

          {detectionResult.alternatives.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Alternatives
              </span>
              <div className="space-y-1">
                {detectionResult.alternatives.map((alt) => {
                  const altPreset = getMasterPreset(alt.master);
                  return (
                    <button
                      key={alt.master}
                      onClick={() => handleSelectAlternative(alt.master)}
                      className="w-full flex items-center justify-between p-2 rounded-md hover-elevate text-left text-sm"
                      data-testid={`button-alt-${alt.master}`}
                    >
                      <span>{altPreset?.displayName || alt.master}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {alt.confidence}%
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onManualSelect}
            className="flex-1"
            data-testid="button-manual-select"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Manual
          </Button>
          <Button
            onClick={handleApply}
            disabled={isApplying}
            className="flex-1"
            data-testid="button-apply-preset"
          >
            {isApplying ? (
              <span className="animate-pulse">Applying...</span>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Apply {masterPreset.displayName}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
