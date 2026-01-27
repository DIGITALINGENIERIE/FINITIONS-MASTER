import { useState, useCallback, useRef, useEffect } from "react";
import { DnaConfiguration } from "@shared/schema";
import { usePresets, useCreatePreset, DEFAULT_CONFIGURATION } from "@/hooks/use-presets";
import { Header } from "@/components/Header";
import { VermeerCanvas } from "@/components/VermeerCanvas";
import { MasterDetectionModal } from "@/components/MasterDetectionModal";
import { Histogram } from "@/components/Histogram";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { ExportDialog } from "@/components/ExportDialog";
import { detectOptimalMaster, getAllMasters, type DetectionResult } from "@/lib/master-detector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, RotateCcw, Save, Clock, Palette, Sun, Eye, ShieldCheck, Sparkles, ChevronDown, ChevronUp, Dna, BarChart3, SplitSquareHorizontal, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SAMPLE_IMAGE_URL = "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1920&auto=format&fit=crop"; 

interface DimensionSectionProps {
  icon: React.ReactNode;
  title: string;
  masterValue: number;
  onMasterChange: (v: number) => void;
  children: React.ReactNode;
  color?: string;
}

function DimensionSection({ icon, title, masterValue, onMasterChange, children, color = "text-cyan-400" }: DimensionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="dimension-section">
      <div 
        className="flex items-center justify-between cursor-pointer mb-3"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center gap-3">
          <span className={color}>{icon}</span>
          <h3 className="font-display text-lg tracking-wider">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-cyan-400 text-lg">{masterValue}%</span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>
      
      {isExpanded && (
        <>
          <div className="mb-4 pb-4 border-b border-cyan-500/20">
            <div className="flex justify-between mb-2 text-xs text-muted-foreground">
              <span>Intensité globale</span>
              <span className="font-mono">Master</span>
            </div>
            <input 
              type="range" 
              className="master-slider w-full" 
              min="0" 
              max="100" 
              value={masterValue}
              onChange={(e) => onMasterChange(Number(e.target.value))}
              data-testid={`slider-master-${title.toLowerCase().replace(/\s+/g, '-')}`}
            />
          </div>
          <div className="space-y-4">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

interface ParamSliderProps {
  label: string;
  labelEn: string;
  value: number;
  onChange: (v: number) => void;
}

function ParamSlider({ label, labelEn, value, onChange }: ParamSliderProps) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm text-foreground">{label} <span className="text-muted-foreground text-xs">({labelEn})</span></span>
        <span className="font-mono text-cyan-400 text-sm">{value}%</span>
      </div>
      <input 
        type="range" 
        className="param-slider w-full" 
        min="0" 
        max="100" 
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        data-testid={`slider-${labelEn.toLowerCase().replace(/\s+/g, '-')}`}
      />
    </div>
  );
}

export default function Home() {
  const [config, setConfig] = useState<DnaConfiguration>(DEFAULT_CONFIGURATION);
  const [imageUrl, setImageUrl] = useState<string>(SAMPLE_IMAGE_URL);
  const [canvasDimensions, setCanvasDimensions] = useState({ w: 800, h: 600 });
  const [newPresetName, setNewPresetName] = useState("");
  const [selectedMaster, setSelectedMaster] = useState<string>("Vermeer");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isDetectionModalOpen, setIsDetectionModalOpen] = useState(false);
  const [isImportPresetDialogOpen, setIsImportPresetDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [autoDetectEnabled] = useState(true);
  const [showHistogram, setShowHistogram] = useState(true);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [processedImageData, setProcessedImageData] = useState<ImageData | null>(null);
  const [processedCanvas, setProcessedCanvas] = useState<HTMLCanvasElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<any>(null);
  
  const { data: presets } = usePresets();
  const createPreset = useCreatePreset();
  const { toast } = useToast();

  const masters = Array.from(new Set(presets?.map(p => p.master) || ["Vermeer"]));

  const measureContainer = useCallback(() => {
    if (containerRef.current) {
      setCanvasDimensions({
        w: containerRef.current.clientWidth,
        h: containerRef.current.clientHeight,
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", measureContainer);
    setTimeout(measureContainer, 100);
    return () => window.removeEventListener("resize", measureContainer);
  }, [measureContainer]);

  const updateDimension = <K extends keyof DnaConfiguration['dimensions']>(
    dimension: K,
    key: keyof DnaConfiguration['dimensions'][K],
    value: any
  ) => {
    setConfig(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: {
          ...prev.dimensions[dimension],
          [key]: value
        }
      }
    }));
  };

  const runDetection = useCallback((imgUrl: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const result = detectOptimalMaster(imageData);
      setDetectionResult(result);
      setIsDetectionModalOpen(true);
    };
    img.src = imgUrl;
  }, []);

  const handleApplyDetectedPreset = (newConfig: DnaConfiguration, masterName: string) => {
    setConfig(newConfig);
    setSelectedMaster(masterName);
    toast({ title: "Style Détecté", description: `Paramètres ${masterName} appliqués.` });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      if (autoDetectEnabled) {
        runDetection(url);
      }
    }
  };

  const handleMasterChange = (master: string) => {
    setSelectedMaster(master);
    toast({ title: "Maître sélectionné", description: `Mode ${master} activé` });
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast({ title: "Nom requis", description: "Veuillez entrer un nom.", variant: "destructive" });
      return;
    }
    createPreset.mutate({
      name: newPresetName,
      master: selectedMaster,
      configuration: config,
      isDefault: false
    }, {
      onSuccess: () => setIsSaveDialogOpen(false)
    });
  };

  const loadPreset = (value: string) => {
    const [presetId] = value.split("|");
    const preset = presets?.find(p => p.id.toString() === presetId);
    if (preset) {
      setConfig(preset.configuration as DnaConfiguration);
      setSelectedMaster(preset.master);
      toast({ title: "ADN V7.0 Chargé", description: `${preset.master}: ${preset.name}` });
    }
  };

  const handleDownload = useCallback(() => {
    if (canvasRef.current) {
      const processedImage = canvasRef.current.getProcessedImage?.();
      if (processedImage) {
        const uri = processedImage.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `adn-v7-${selectedMaster.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Téléchargement réussi", description: `Image ${selectedMaster} enregistrée.` });
      }
    }
  }, [selectedMaster, toast]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: 'hsl(240 33% 2%)' }}>
      <div className="fixed inset-0 grid-overlay pointer-events-none z-0" />
      
      <Header 
        onExport={handleDownload}
        onImportClick={() => fileInputRef.current?.click()}
        onImportPreset={() => setIsImportPresetDialogOpen(true)}
      />
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/png, image/jpeg, image/webp"
        onChange={handleImageUpload}
        data-testid="input-file-upload"
      />

      <main className="flex-1 flex overflow-hidden relative z-10">
        <div className="flex-1 flex flex-col gap-4 p-4">
          <div 
            className="flex-1 glass-panel relative overflow-hidden flex items-center justify-center" 
            ref={containerRef}
            data-testid="canvas-container"
          >
                        
            <VermeerCanvas 
              imageUrl={imageUrl} 
              config={config} 
              width={canvasDimensions.w - 48}
              height={canvasDimensions.h - 48} 
              onRef={(ref) => {
                canvasRef.current = ref.current;
                const canvas = ref.getProcessedImage?.();
                const imageData = ref.getProcessedImageData?.();
                if (canvas) setProcessedCanvas(canvas);
                if (imageData) setProcessedImageData(imageData);
              }}
            />
            
            {!imageUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <UploadCloud className="w-16 h-16 text-cyan-400 mb-4" />
                <h3 className="font-display text-2xl text-cyan-400 mb-2">CANVAS READY</h3>
                <p className="text-muted-foreground">Importez votre image pour commencer</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 flex-wrap items-center">
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="secondary"
              className="gap-2"
              data-testid="button-upload"
            >
              <UploadCloud className="w-4 h-4" />
              Upload
            </Button>
            <Button onClick={() => setIsExportDialogOpen(true)} className="btn-export gap-2" data-testid="button-export">
              <Download className="w-4 h-4" />
              Export HD
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setConfig(DEFAULT_CONFIGURATION)}
              className="gap-2"
              data-testid="button-reset"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            
            <div className="h-6 w-px bg-cyan-500/30 mx-1" />
            
            <Button 
              variant={showHistogram ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHistogram(!showHistogram)}
              className={`gap-1 ${showHistogram ? 'bg-cyan-600' : 'border-cyan-500/30'}`}
              data-testid="button-toggle-histogram"
            >
              <BarChart3 className="w-3 h-3" />
              Histo
            </Button>
            <Button 
              variant={showBeforeAfter ? "default" : "outline"}
              size="sm"
              onClick={() => setShowBeforeAfter(!showBeforeAfter)}
              className={`gap-1 ${showBeforeAfter ? 'bg-cyan-600' : 'border-cyan-500/30'}`}
              data-testid="button-toggle-compare"
            >
              <SplitSquareHorizontal className="w-3 h-3" />
              A/B
            </Button>
            
            {showHistogram && (
              <div className="ml-auto">
                <Histogram imageData={processedImageData} width={180} height={50} />
              </div>
            )}
          </div>
        </div>

        <aside className="w-[420px] glass-panel flex flex-col m-4 ml-0">
          <div className="p-4 border-b border-cyan-500/20">
            <h2 className="font-display text-xl tracking-wider mb-1">ADN PARAMETERS</h2>
            <p className="text-muted-foreground text-sm">Granular Mix 0-100% • Master Slider Control</p>
          </div>
          
          <div className="p-4 border-b border-cyan-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <Select value={selectedMaster} onValueChange={handleMasterChange}>
                <SelectTrigger className="flex-1 bg-black/30 border-cyan-500/30 h-10" data-testid="select-master">
                  <SelectValue placeholder="Choisir un Maître" />
                </SelectTrigger>
                <SelectContent>
                  {masters.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setConfig(DEFAULT_CONFIGURATION)}
                className="border-cyan-500/30"
                data-testid="button-reset-config"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="shrink-0 gap-1 border-cyan-500/30"
                onClick={() => runDetection(imageUrl)}
                data-testid="button-auto-detect"
              >
                <Dna className="w-3 h-3" />
                Auto
              </Button>
              <Select onValueChange={loadPreset}>
                <SelectTrigger className="flex-1 bg-black/30 border-cyan-500/30 h-9 text-xs" data-testid="select-preset">
                  <SelectValue placeholder="Presets ADN V7.0..." />
                </SelectTrigger>
                <SelectContent>
                  {presets?.filter(p => p.master === selectedMaster).map(p => (
                    <SelectItem key={p.id} value={`${p.id}|all`}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 border-cyan-500/30" data-testid="button-save-preset">
                    <Save className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Sauvegarder Configuration V7.0</DialogTitle></DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Maître</Label>
                      <Input value={selectedMaster} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Nom du Preset</Label>
                      <Input 
                        placeholder="Nom (ex: 'Essence')" 
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        data-testid="input-preset-name"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSavePreset} disabled={createPreset.isPending} data-testid="button-confirm-save">
                      Sauvegarder
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <ScrollArea className="flex-1 scrollbar-thin">
            <div className="p-4 space-y-0">
              <div className="px-3 py-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-[10px] font-display text-cyan-400 uppercase tracking-widest text-center mb-4">
                ADN V7.0 - MOTEUR UNIVERSEL
              </div>

              <DimensionSection 
                icon={<Clock className="w-5 h-5" />} 
                title="TEMPS-ESPACE"
                masterValue={config.dimensions.temporalSpatial.master}
                onMasterChange={(v) => updateDimension("temporalSpatial", "master", v)}
                color="text-cyan-400"
              >
                <ParamSlider label="Éternité Figée" labelEn="Timeless Frozen" value={config.dimensions.temporalSpatial.timelessFrozen} onChange={(v) => updateDimension("temporalSpatial", "timelessFrozen", v)} />
                <ParamSlider label="Durée Atmosphérique" labelEn="Atmospheric Duration" value={config.dimensions.temporalSpatial.atmosphericDuration} onChange={(v) => updateDimension("temporalSpatial", "atmosphericDuration", v)} />
                <ParamSlider label="Moment Dramatique" labelEn="Dramatic Moment" value={config.dimensions.temporalSpatial.dramaticMoment} onChange={(v) => updateDimension("temporalSpatial", "dramaticMoment", v)} />
                <ParamSlider label="Flou de Mouvement" labelEn="Motion Blur" value={config.dimensions.temporalSpatial.motionBlur} onChange={(v) => updateDimension("temporalSpatial", "motionBlur", v)} />
                <ParamSlider label="Indication Temporelle" labelEn="Time Indication" value={config.dimensions.temporalSpatial.timeIndication} onChange={(v) => updateDimension("temporalSpatial", "timeIndication", v)} />
                <ParamSlider label="Indication Atmosphérique" labelEn="Atmospheric Indication" value={config.dimensions.temporalSpatial.atmosphericIndication} onChange={(v) => updateDimension("temporalSpatial", "atmosphericIndication", v)} />
                <ParamSlider label="Précision de Profondeur" labelEn="Depth Precision" value={config.dimensions.temporalSpatial.depthPrecision} onChange={(v) => updateDimension("temporalSpatial", "depthPrecision", v)} />
              </DimensionSection>

              <DimensionSection 
                icon={<Palette className="w-5 h-5" />} 
                title="MATIÈRE-ESPRIT"
                masterValue={config.dimensions.materialSpiritual.master}
                onMasterChange={(v) => updateDimension("materialSpiritual", "master", v)}
                color="text-amber-400"
              >
                <ParamSlider label="Divin à travers la Matière" labelEn="Divine Through Material" value={config.dimensions.materialSpiritual.divineThroughMaterial} onChange={(v) => updateDimension("materialSpiritual", "divineThroughMaterial", v)} />
                <ParamSlider label="Matière comme Expansion" labelEn="Material as Expansion" value={config.dimensions.materialSpiritual.materialAsExpansion} onChange={(v) => updateDimension("materialSpiritual", "materialAsExpansion", v)} />
                <ParamSlider label="Précision Matérielle" labelEn="Material Precision" value={config.dimensions.materialSpiritual.materialPrecision} onChange={(v) => updateDimension("materialSpiritual", "materialPrecision", v)} />
                <ParamSlider label="Symbolisme Spirituel" labelEn="Spiritual Symbolism" value={config.dimensions.materialSpiritual.spiritualSymbolism} onChange={(v) => updateDimension("materialSpiritual", "spiritualSymbolism", v)} />
                <ParamSlider label="Perfection de Surface" labelEn="Surface Perfection" value={config.dimensions.materialSpiritual.surfacePerfection} onChange={(v) => updateDimension("materialSpiritual", "surfacePerfection", v)} />
                <ParamSlider label="Détail comme Révélation" labelEn="Detail as Revelation" value={config.dimensions.materialSpiritual.detailAsRevelation} onChange={(v) => updateDimension("materialSpiritual", "detailAsRevelation", v)} />
              </DimensionSection>

              <DimensionSection 
                icon={<Sun className="w-5 h-5" />} 
                title="LUMIÈRE-RÉVÉLATION"
                masterValue={config.dimensions.lightRevelation.master}
                onMasterChange={(v) => updateDimension("lightRevelation", "master", v)}
                color="text-yellow-400"
              >
                <ParamSlider label="Lumière comme Preuve Divine" labelEn="Light as Divine Proof" value={config.dimensions.lightRevelation.lightAsDivineProof} onChange={(v) => updateDimension("lightRevelation", "lightAsDivineProof", v)} />
                <ParamSlider label="Lumière comme Outil Dramatique" labelEn="Light as Dramatic Tools" value={config.dimensions.lightRevelation.lightAsDramaticTools} onChange={(v) => updateDimension("lightRevelation", "lightAsDramaticTools", v)} />
                <ParamSlider label="Douceur des Ombres" labelEn="Shadow Softness" value={config.dimensions.lightRevelation.shadowSoftness} onChange={(v) => updateDimension("lightRevelation", "shadowSoftness", v)} />
                <ParamSlider label="Subtilité des Réflexions" labelEn="Reflection Subtlety" value={config.dimensions.lightRevelation.reflectionSubtlety} onChange={(v) => updateDimension("lightRevelation", "reflectionSubtlety", v)} />
                <ParamSlider label="Symbolisme Lumineux" labelEn="Light Symbolism" value={config.dimensions.lightRevelation.lightSymbolism} onChange={(v) => updateDimension("lightRevelation", "lightSymbolism", v)} />
              </DimensionSection>

              <DimensionSection 
                icon={<Eye className="w-5 h-5" />} 
                title="PSYCHOLOGIE DU REGARD"
                masterValue={config.dimensions.gazePsychology.master}
                onMasterChange={(v) => updateDimension("gazePsychology", "master", v)}
                color="text-blue-400"
              >
                <ParamSlider label="Examen Microscopique" labelEn="Microscopic Scrutiny" value={config.dimensions.gazePsychology.microscopicScrutiny} onChange={(v) => updateDimension("gazePsychology", "microscopicScrutiny", v)} />
                <ParamSlider label="Immersion Émotionnelle" labelEn="Emotional Immersion" value={config.dimensions.gazePsychology.emotionalImmersion} onChange={(v) => updateDimension("gazePsychology", "emotionalImmersion", v)} />
                <ParamSlider label="Orchestration Dramatique" labelEn="Dramatic Orchestration" value={config.dimensions.gazePsychology.dramaticOrchestration} onChange={(v) => updateDimension("gazePsychology", "dramaticOrchestration", v)} />
                <ParamSlider label="Complétude de Boucle" labelEn="Loop Completeness" value={config.dimensions.gazePsychology.loopCompleteness} onChange={(v) => updateDimension("gazePsychology", "loopCompleteness", v)} />
                <ParamSlider label="Fluidité des Transitions" labelEn="Transition Smoothness" value={config.dimensions.gazePsychology.transitionSmoothness} onChange={(v) => updateDimension("gazePsychology", "transitionSmoothness", v)} />
                <ParamSlider label="Densité de Découverte" labelEn="Discovery Density" value={config.dimensions.gazePsychology.discoveryDensity} onChange={(v) => updateDimension("gazePsychology", "discoveryDensity", v)} />
                <ParamSlider label="Qualité Hypnotique" labelEn="Hypnotic Quality" value={config.dimensions.gazePsychology.hypnoticQuality} onChange={(v) => updateDimension("gazePsychology", "hypnoticQuality", v)} />
              </DimensionSection>

              <DimensionSection 
                icon={<ShieldCheck className="w-5 h-5" />} 
                title="CONTRAINTE HISTORIQUE"
                masterValue={config.dimensions.historicalConstraints.master}
                onMasterChange={(v) => updateDimension("historicalConstraints", "master", v)}
                color="text-emerald-400"
              >
                <div className="space-y-2 mb-4">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Période</Label>
                  <Select 
                    value={config.dimensions.historicalConstraints.period} 
                    onValueChange={(v) => updateDimension("historicalConstraints", "period", v)}
                  >
                    <SelectTrigger className="h-9 text-sm bg-black/30 border-cyan-500/30" data-testid="select-period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GOLDEN_AGE">Âge d'Or (Golden Age)</SelectItem>
                      <SelectItem value="CONTEMPORARY">Contemporain (Contemporary)</SelectItem>
                      <SelectItem value="MODERN">Moderne (20ème siècle)</SelectItem>
                      <SelectItem value="EXPRESSIONISM_MID_20TH">Expressionnisme (Mi-20ème)</SelectItem>
                      <SelectItem value="BAROQUE">Baroque</SelectItem>
                      <SelectItem value="HIGH_RENAISSANCE">Haute Renaissance</SelectItem>
                      <SelectItem value="EARLY_RENAISSANCE">Début Renaissance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ParamSlider label="Fidélité Historique" labelEn="Historical Fidelity" value={config.dimensions.historicalConstraints.fidelity} onChange={(v) => updateDimension("historicalConstraints", "fidelity", v)} />
              </DimensionSection>

              <DimensionSection 
                icon={<Sparkles className="w-5 h-5" />} 
                title="FINITION MASTER"
                masterValue={config.dimensions.finition.master}
                onMasterChange={(v) => updateDimension("finition", "master", v)}
                color="text-pink-400"
              >
                <ParamSlider label="Lustre du Maître" labelEn="Master Lustre" value={config.dimensions.finition.masterLustre} onChange={(v) => updateDimension("finition", "masterLustre", v)} />
                <ParamSlider label="Éclat Final" labelEn="Final Glow" value={config.dimensions.finition.finalGlow} onChange={(v) => updateDimension("finition", "finalGlow", v)} />
              </DimensionSection>
            </div>
          </ScrollArea>
        </aside>
      </main>

      <MasterDetectionModal
        isOpen={isDetectionModalOpen}
        onClose={() => setIsDetectionModalOpen(false)}
        detectionResult={detectionResult}
        onApplyPreset={handleApplyDetectedPreset}
        onManualSelect={() => setIsDetectionModalOpen(false)}
      />

      <Dialog open={isImportPresetDialogOpen} onOpenChange={setIsImportPresetDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Importer Paramètres d'un Maître</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Sélectionnez un maître pour charger ses paramètres optimaux :
            </p>
            <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
              {getAllMasters().map(master => (
                <Button
                  key={master.id}
                  variant="outline"
                  className="justify-start h-auto py-3 px-4 border-cyan-500/30"
                  onClick={() => {
                    handleMasterChange(master.preset.name);
                    setIsImportPresetDialogOpen(false);
                  }}
                  data-testid={`button-import-master-${master.preset.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{master.preset.displayName || master.preset.name}</span>
                    <span className="text-xs text-muted-foreground">{master.preset.period}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsImportPresetDialogOpen(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        processedCanvas={processedCanvas}
        config={config}
        masterName={selectedMaster}
      />

      <Dialog open={showBeforeAfter} onOpenChange={setShowBeforeAfter}>
        <DialogContent className="max-w-4xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display">Comparaison Avant / Après</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <BeforeAfterSlider
              beforeImage={imageUrl}
              afterCanvas={processedCanvas}
              width={800}
              height={500}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowBeforeAfter(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
