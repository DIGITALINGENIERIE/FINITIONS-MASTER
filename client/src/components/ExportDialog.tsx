import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Loader2 } from "lucide-react";
import { DnaConfiguration } from "@shared/schema";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  processedCanvas: HTMLCanvasElement | null;
  config: DnaConfiguration;
  masterName: string;
}

type Resolution = "original" | "2k" | "4k" | "8k";
type Format = "png" | "jpeg" | "webp";

const RESOLUTIONS: Record<Resolution, { label: string; scale: number }> = {
  original: { label: "Original", scale: 1 },
  "2k": { label: "2K (2560px)", scale: 2 },
  "4k": { label: "4K (3840px)", scale: 3 },
  "8k": { label: "8K (7680px)", scale: 6 }
};

const FORMATS: Record<Format, { label: string; mime: string; quality?: number }> = {
  png: { label: "PNG (Sans perte)", mime: "image/png" },
  jpeg: { label: "JPEG (Haute qualité)", mime: "image/jpeg", quality: 0.95 },
  webp: { label: "WebP (Optimisé)", mime: "image/webp", quality: 0.95 }
};

export function ExportDialog({ isOpen, onClose, processedCanvas, config, masterName }: ExportDialogProps) {
  const [resolution, setResolution] = useState<Resolution>("original");
  const [format, setFormat] = useState<Format>("png");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    if (!processedCanvas) return;
    
    setIsExporting(true);
    
    try {
      const { scale } = RESOLUTIONS[resolution];
      const { mime, quality } = FORMATS[format];
      
      // Create high-resolution canvas
      const exportCanvas = document.createElement('canvas');
      const originalWidth = processedCanvas.width;
      const originalHeight = processedCanvas.height;
      
      let targetWidth = originalWidth * scale;
      let targetHeight = originalHeight * scale;
      
      // Cap at 8K
      const maxDimension = 7680;
      if (targetWidth > maxDimension || targetHeight > maxDimension) {
        const ratio = Math.min(maxDimension / targetWidth, maxDimension / targetHeight);
        targetWidth *= ratio;
        targetHeight *= ratio;
      }
      
      exportCanvas.width = targetWidth;
      exportCanvas.height = targetHeight;
      
      const ctx = exportCanvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(processedCanvas, 0, 0, targetWidth, targetHeight);
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const resLabel = resolution === 'original' ? '' : `-${resolution.toUpperCase()}`;
      const filename = `ADN-V7-${masterName.replace(/\s+/g, '-')}${resLabel}-${timestamp}.${format}`;
      
      // Export with metadata embedded in filename if PNG
      let dataUrl: string;
      if (format === 'png' && includeMetadata) {
        // For PNG, we'll add metadata to the image
        const metadataCanvas = await addMetadataToPNG(exportCanvas, config, masterName);
        dataUrl = metadataCanvas.toDataURL(mime);
      } else {
        dataUrl = quality ? exportCanvas.toDataURL(mime, quality) : exportCanvas.toDataURL(mime);
      }
      
      // Download
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Also create metadata JSON if requested
      if (includeMetadata) {
        const metadata = createMetadataJSON(config, masterName, {
          width: Math.round(targetWidth),
          height: Math.round(targetHeight),
          format,
          resolution,
          exportDate: new Date().toISOString()
        });
        
        const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
        const metadataUrl = URL.createObjectURL(metadataBlob);
        const metadataLink = document.createElement('a');
        metadataLink.download = filename.replace(`.${format}`, '-metadata.json');
        metadataLink.href = metadataUrl;
        document.body.appendChild(metadataLink);
        metadataLink.click();
        document.body.removeChild(metadataLink);
        URL.revokeObjectURL(metadataUrl);
      }
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const estimatedSize = processedCanvas ? 
    Math.round((processedCanvas.width * RESOLUTIONS[resolution].scale * processedCanvas.height * RESOLUTIONS[resolution].scale * 4) / 1024 / 1024 * (format === 'png' ? 0.3 : 0.1)) 
    : 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Export Haute Résolution</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-5">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Résolution</Label>
            <Select value={resolution} onValueChange={(v) => setResolution(v as Resolution)}>
              <SelectTrigger className="bg-black/30 border-cyan-500/30" data-testid="select-resolution">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RESOLUTIONS).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
              <SelectTrigger className="bg-black/30 border-cyan-500/30" data-testid="select-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FORMATS).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <Checkbox 
              id="include-metadata" 
              checked={includeMetadata}
              onCheckedChange={(checked) => setIncludeMetadata(!!checked)}
              data-testid="checkbox-metadata"
            />
            <Label htmlFor="include-metadata" className="text-sm cursor-pointer">
              Inclure métadonnées ADN (fichier JSON)
            </Label>
          </div>
          
          <div className="p-3 bg-black/30 rounded-lg border border-cyan-500/20">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Dimensions estimées:</span>
              <span className="font-mono text-cyan-400">
                {processedCanvas ? Math.round(processedCanvas.width * RESOLUTIONS[resolution].scale) : 0} x {processedCanvas ? Math.round(processedCanvas.height * RESOLUTIONS[resolution].scale) : 0}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Taille estimée:</span>
              <span className="font-mono text-cyan-400">~{estimatedSize} MB</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || !processedCanvas}
            className="btn-export gap-2"
            data-testid="button-confirm-export"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Exporter
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

async function addMetadataToPNG(canvas: HTMLCanvasElement, config: DnaConfiguration, masterName: string): Promise<HTMLCanvasElement> {
  // For now, just return the canvas as-is
  // True PNG metadata injection requires a PNG encoder library
  return canvas;
}

function createMetadataJSON(config: DnaConfiguration, masterName: string, exportInfo: {
  width: number;
  height: number;
  format: string;
  resolution: string;
  exportDate: string;
}) {
  return {
    generator: "ADN CONVERTER V7.0.2",
    version: config.meta.version,
    codename: config.meta.codename,
    master: masterName,
    export: exportInfo,
    dimensions: {
      temporalSpatial: {
        master: config.dimensions.temporalSpatial.master,
        timelessFrozen: config.dimensions.temporalSpatial.timelessFrozen,
        atmosphericDuration: config.dimensions.temporalSpatial.atmosphericDuration,
        dramaticMoment: config.dimensions.temporalSpatial.dramaticMoment,
        motionBlur: config.dimensions.temporalSpatial.motionBlur,
        timeIndication: config.dimensions.temporalSpatial.timeIndication,
        atmosphericIndication: config.dimensions.temporalSpatial.atmosphericIndication,
        depthPrecision: config.dimensions.temporalSpatial.depthPrecision
      },
      materialSpiritual: {
        master: config.dimensions.materialSpiritual.master,
        divineThroughMaterial: config.dimensions.materialSpiritual.divineThroughMaterial,
        materialAsExpansion: config.dimensions.materialSpiritual.materialAsExpansion,
        materialPrecision: config.dimensions.materialSpiritual.materialPrecision,
        spiritualSymbolism: config.dimensions.materialSpiritual.spiritualSymbolism,
        surfacePerfection: config.dimensions.materialSpiritual.surfacePerfection,
        detailAsRevelation: config.dimensions.materialSpiritual.detailAsRevelation
      },
      lightRevelation: {
        master: config.dimensions.lightRevelation.master,
        lightAsDivineProof: config.dimensions.lightRevelation.lightAsDivineProof,
        lightAsDramaticTools: config.dimensions.lightRevelation.lightAsDramaticTools,
        shadowSoftness: config.dimensions.lightRevelation.shadowSoftness,
        reflectionSubtlety: config.dimensions.lightRevelation.reflectionSubtlety,
        lightSymbolism: config.dimensions.lightRevelation.lightSymbolism
      },
      gazePsychology: {
        master: config.dimensions.gazePsychology.master,
        microscopicScrutiny: config.dimensions.gazePsychology.microscopicScrutiny,
        emotionalImmersion: config.dimensions.gazePsychology.emotionalImmersion,
        dramaticOrchestration: config.dimensions.gazePsychology.dramaticOrchestration,
        loopCompleteness: config.dimensions.gazePsychology.loopCompleteness,
        transitionSmoothness: config.dimensions.gazePsychology.transitionSmoothness,
        discoveryDensity: config.dimensions.gazePsychology.discoveryDensity,
        hypnoticQuality: config.dimensions.gazePsychology.hypnoticQuality
      },
      historicalConstraints: {
        master: config.dimensions.historicalConstraints.master,
        period: config.dimensions.historicalConstraints.period,
        fidelity: config.dimensions.historicalConstraints.fidelity
      },
      finition: {
        master: config.dimensions.finition.master,
        masterLustre: config.dimensions.finition.masterLustre,
        finalGlow: config.dimensions.finition.finalGlow
      }
    },
    nft: {
      compatible: true,
      blockchain: ["Ethereum", "Polygon", "Solana", "Tezos"],
      standards: ["ERC-721", "ERC-1155"]
    }
  };
}
