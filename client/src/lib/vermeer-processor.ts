
import { DnaConfiguration } from "@shared/schema";

export class MasterProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private originalImageData: ImageData | null = null;
  private width: number = 0;
  private height: number = 0;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
  }

  async loadImage(imageUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        this.width = img.width;
        this.height = img.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx.drawImage(img, 0, 0);
        this.originalImageData = this.ctx.getImageData(0, 0, this.width, this.height);
        resolve();
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  }

  process(config: DnaConfiguration): ImageData {
    if (!this.originalImageData) {
      throw new Error("No image loaded");
    }

    const imageData = new ImageData(
      new Uint8ClampedArray(this.originalImageData.data),
      this.width,
      this.height
    );

    const { dimensions } = config;

    // Phase 1: Temps-Espace (Foundation Layer)
    this.applyTemporalSpatial(imageData, dimensions.temporalSpatial);
    
    // Phase 2: Matière-Esprit (Texture & Surface)
    this.applyMaterialSpiritual(imageData, dimensions.materialSpiritual);
    
    // Phase 3: Lumière-Révélation (Light & Tone)
    this.applyLightRevelation(imageData, dimensions.lightRevelation);
    
    // Phase 4: Psychologie du Regard (Focus & Composition)
    this.applyGazePsychology(imageData, dimensions.gazePsychology);
    
    // Phase 5: Contrainte Historique (Color Grading)
    this.applyHistoricalConstraints(imageData, dimensions.historicalConstraints, config.meta.artist);
    
    // Phase 6: Finition Master (Final Polish)
    this.applyFinition(imageData, dimensions.finition);

    return imageData;
  }

  // ============ PHASE 1: TEMPS-ESPACE ============

  private applyTemporalSpatial(imageData: ImageData, params: DnaConfiguration['dimensions']['temporalSpatial']): void {
    const masterIntensity = params.master / 100;
    if (masterIntensity === 0) return;
    
    // Timeless Frozen - Temporal suspension with edge-preserving smoothing
    if (params.timelessFrozen > 0) {
      const intensity = (params.timelessFrozen / 100) * masterIntensity;
      this.applyBilateralFilter(imageData, intensity * 2.5, intensity * 25);
      this.applyToneCurve(imageData.data, 0.03 * intensity, 'highlights');
    }
    
    // Atmospheric Duration - Time passage with subtle atmosphere
    if (params.atmosphericDuration > 0) {
      const intensity = (params.atmosphericDuration / 100) * masterIntensity;
      this.applyAtmosphericPerspective(imageData, intensity * 0.15);
      this.applyFilmGrain(imageData.data, intensity * 6, 0.7);
    }
    
    // Dramatic Moment - High impact tension
    if (params.dramaticMoment > 0) {
      const intensity = (params.dramaticMoment / 100) * masterIntensity;
      this.applySCurveContrast(imageData.data, intensity * 0.4);
      this.applyLocalContrast(imageData, intensity * 0.3);
    }
    
    // Motion Blur - Directional blur for movement
    if (params.motionBlur > 0) {
      const intensity = (params.motionBlur / 100) * masterIntensity;
      this.applyDirectionalBlur(imageData, intensity * 3, 0);
    }
    
    // Time Indication - Subtle luminance shift
    if (params.timeIndication > 0) {
      const intensity = (params.timeIndication / 100) * masterIntensity;
      this.applyToneCurve(imageData.data, intensity * 0.05, 'midtones');
    }
    
    // Atmospheric Indication
    if (params.atmosphericIndication > 0) {
      const intensity = (params.atmosphericIndication / 100) * masterIntensity;
      this.applyAtmosphericPerspective(imageData, intensity * 0.08);
    }
    
    // Depth Precision - Enhanced depth sharpness
    if (params.depthPrecision > 0) {
      const intensity = (params.depthPrecision / 100) * masterIntensity;
      this.applyUnsharpMask(imageData, intensity * 0.8, 1.2);
    }
  }

  // ============ PHASE 2: MATIÈRE-ESPRIT ============

  private applyMaterialSpiritual(imageData: ImageData, params: DnaConfiguration['dimensions']['materialSpiritual']): void {
    const masterIntensity = params.master / 100;
    if (masterIntensity === 0) return;

    // Divine Through Material - Ethereal glow on surfaces
    if (params.divineThroughMaterial > 0) {
      const intensity = (params.divineThroughMaterial / 100) * masterIntensity;
      this.applyOrtonEffect(imageData, intensity * 0.25);
      this.applyHighlightBloom(imageData, intensity * 0.15);
    }
    
    // Material as Expansion - Tactile texture enhancement
    if (params.materialAsExpansion > 0) {
      const intensity = (params.materialAsExpansion / 100) * masterIntensity;
      this.applyTextureEnhancement(imageData, intensity * 0.3);
      this.applyFilmGrain(imageData.data, intensity * 12, 0.5);
    }
    
    // Material Precision - Fine detail extraction
    if (params.materialPrecision > 0) {
      const intensity = (params.materialPrecision / 100) * masterIntensity;
      this.applyHighPassSharpening(imageData, intensity * 0.4);
      this.applyLocalContrast(imageData, intensity * 0.2);
    }
    
    // Spiritual Symbolism - Luminous enhancement
    if (params.spiritualSymbolism > 0) {
      const intensity = (params.spiritualSymbolism / 100) * masterIntensity;
      this.applyToneCurve(imageData.data, intensity * 0.08, 'highlights');
    }
    
    // Surface Perfection - Skin/surface smoothing
    if (params.surfacePerfection > 0) {
      const intensity = (params.surfacePerfection / 100) * masterIntensity;
      this.applyBilateralFilter(imageData, intensity * 2, intensity * 20);
    }
    
    // Detail as Revelation - Micro-detail enhancement
    if (params.detailAsRevelation > 0) {
      const intensity = (params.detailAsRevelation / 100) * masterIntensity;
      this.applyFrequencySeparation(imageData, intensity * 0.3, 'high');
    }
  }

  // ============ PHASE 3: LUMIÈRE-RÉVÉLATION ============

  private applyLightRevelation(imageData: ImageData, params: DnaConfiguration['dimensions']['lightRevelation']): void {
    const masterIntensity = params.master / 100;
    if (masterIntensity === 0) return;

    // Light as Divine Proof - Radiant highlights
    if (params.lightAsDivineProof > 0) {
      const intensity = (params.lightAsDivineProof / 100) * masterIntensity;
      this.applyToneCurve(imageData.data, intensity * 0.2, 'highlights');
      this.applyHighlightBloom(imageData, intensity * 0.2);
      this.applyShadowRecovery(imageData.data, intensity * 0.15);
    }
    
    // Light as Dramatic Tools - Chiaroscuro effect
    if (params.lightAsDramaticTools > 0) {
      const intensity = (params.lightAsDramaticTools / 100) * masterIntensity;
      this.applySCurveContrast(imageData.data, intensity * 0.5);
      this.applyShadowCrush(imageData.data, intensity * 0.25);
      this.applyRadialVignette(imageData, intensity * 0.3, 0.7);
    }
    
    // Shadow Softness - Open shadows
    if (params.shadowSoftness > 0) {
      const intensity = (params.shadowSoftness / 100) * masterIntensity;
      this.applyShadowRecovery(imageData.data, intensity * 0.2);
    }
    
    // Reflection Subtlety - Specular enhancement
    if (params.reflectionSubtlety > 0) {
      const intensity = (params.reflectionSubtlety / 100) * masterIntensity;
      this.applySpecularEnhancement(imageData.data, intensity * 0.15);
    }
    
    // Light Symbolism - Global luminance
    if (params.lightSymbolism > 0) {
      const intensity = (params.lightSymbolism / 100) * masterIntensity;
      this.applyToneCurve(imageData.data, intensity * 0.1, 'midtones');
    }
  }

  // ============ PHASE 4: PSYCHOLOGIE DU REGARD ============

  private applyGazePsychology(imageData: ImageData, params: DnaConfiguration['dimensions']['gazePsychology']): void {
    const masterIntensity = params.master / 100;
    if (masterIntensity === 0) return;

    // Microscopic Scrutiny - Ultra-fine detail
    if (params.microscopicScrutiny > 0) {
      const intensity = (params.microscopicScrutiny / 100) * masterIntensity;
      this.applyUnsharpMask(imageData, intensity * 1.2, 0.8);
      this.applyLocalContrast(imageData, intensity * 0.35);
    }
    
    // Emotional Immersion - Soft dreamy quality
    if (params.emotionalImmersion > 0) {
      const intensity = (params.emotionalImmersion / 100) * masterIntensity;
      this.applyOrtonEffect(imageData, intensity * 0.2);
      this.applyFilmGrain(imageData.data, intensity * 8, 0.6);
    }
    
    // Dramatic Orchestration - Compositional emphasis
    if (params.dramaticOrchestration > 0) {
      const intensity = (params.dramaticOrchestration / 100) * masterIntensity;
      this.applySCurveContrast(imageData.data, intensity * 0.4);
      this.applyRadialVignette(imageData, intensity * 0.25, 0.6);
    }
    
    // Loop Completeness - Edge darkening
    if (params.loopCompleteness > 0) {
      const intensity = (params.loopCompleteness / 100) * masterIntensity;
      this.applyRadialVignette(imageData, intensity * 0.15, 0.8);
    }
    
    // Transition Smoothness - Gradient smoothing
    if (params.transitionSmoothness > 0) {
      const intensity = (params.transitionSmoothness / 100) * masterIntensity;
      this.applyBilateralFilter(imageData, intensity * 1.5, intensity * 15);
    }
    
    // Discovery Density - Textural richness
    if (params.discoveryDensity > 0) {
      const intensity = (params.discoveryDensity / 100) * masterIntensity;
      this.applyLocalContrast(imageData, intensity * 0.2);
    }
    
    // Hypnotic Quality - Mesmerizing softness
    if (params.hypnoticQuality > 0) {
      const intensity = (params.hypnoticQuality / 100) * masterIntensity;
      this.applyOrtonEffect(imageData, intensity * 0.15);
      this.applyToneCurve(imageData.data, intensity * 0.05, 'midtones');
    }
  }

  // ============ PHASE 5: CONTRAINTE HISTORIQUE ============

  private applyHistoricalConstraints(imageData: ImageData, params: DnaConfiguration['dimensions']['historicalConstraints'], artist?: string): void {
    const fidelity = (params.fidelity / 100) * (params.master / 100);
    if (fidelity === 0) return;
    
    const periodGrades: Record<string, { shadows: [number, number, number]; midtones: [number, number, number]; highlights: [number, number, number]; grain: number }> = {
      "GOLDEN_AGE": { 
        shadows: [5, 3, -5], 
        midtones: [8, 5, -3], 
        highlights: [3, 2, 0],
        grain: 4
      },
      "BAROQUE": { 
        shadows: [8, 2, -8], 
        midtones: [5, 2, -4], 
        highlights: [2, 1, -2],
        grain: 6
      },
      "HIGH_RENAISSANCE": { 
        shadows: [3, 2, -3], 
        midtones: [4, 3, -2], 
        highlights: [2, 2, 0],
        grain: 3
      },
      "EARLY_RENAISSANCE": { 
        shadows: [4, 3, -4], 
        midtones: [5, 4, -2], 
        highlights: [3, 2, 0],
        grain: 5
      },
      "EXPRESSIONISM_MID_20TH": { 
        shadows: [2, -1, -3], 
        midtones: [0, 0, -2], 
        highlights: [0, 0, 0],
        grain: 8
      },
      "MODERN": { 
        shadows: [0, 0, 0], 
        midtones: [0, 0, 0], 
        highlights: [0, 0, 0],
        grain: 0
      },
      "CONTEMPORARY": { 
        shadows: [0, 0, 0], 
        midtones: [0, 0, 0], 
        highlights: [0, 0, 0],
        grain: 0
      }
    };

    const grade = periodGrades[params.period] || periodGrades["CONTEMPORARY"];
    
    if (grade.shadows[0] !== 0 || grade.shadows[1] !== 0 || grade.shadows[2] !== 0) {
      this.applyThreeWayColorGrade(imageData.data, grade.shadows, grade.midtones, grade.highlights, fidelity);
    }
    
    if (grade.grain > 0) {
      this.applyFilmGrain(imageData.data, grade.grain * fidelity, 0.6);
    }
  }

  // ============ PHASE 6: FINITION MASTER ============

  private applyFinition(imageData: ImageData, params: DnaConfiguration['dimensions']['finition']): void {
    const masterIntensity = params.master / 100;
    if (masterIntensity === 0) return;
    
    // Master Lustre - Professional vibrancy
    if (params.masterLustre > 0) {
      const intensity = (params.masterLustre / 100) * masterIntensity;
      this.applyVibranceBoost(imageData.data, intensity * 0.25);
      this.applyMicroContrast(imageData.data, intensity * 0.15);
    }
    
    // Final Glow - Luminous finish
    if (params.finalGlow > 0) {
      const intensity = (params.finalGlow / 100) * masterIntensity;
      this.applyHighlightBloom(imageData, intensity * 0.12);
      this.applyToneCurve(imageData.data, intensity * 0.06, 'highlights');
    }
    
    // Final polish vignette
    this.applyRadialVignette(imageData, 0.06, 0.85);
  }

  // ============ ADVANCED PROCESSING ALGORITHMS ============

  private applyBilateralFilter(imageData: ImageData, spatialSigma: number, rangeSigma: number): void {
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    const radius = Math.ceil(spatialSigma * 2);
    const result = new Uint8ClampedArray(data.length);
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        let sumR = 0, sumG = 0, sumB = 0, sumW = 0;
        
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = Math.min(Math.max(x + dx, 0), w - 1);
            const ny = Math.min(Math.max(y + dy, 0), h - 1);
            const nIdx = (ny * w + nx) * 4;
            
            const spatialDist = Math.sqrt(dx * dx + dy * dy);
            const colorDist = Math.sqrt(
              Math.pow(data[idx] - data[nIdx], 2) +
              Math.pow(data[idx + 1] - data[nIdx + 1], 2) +
              Math.pow(data[idx + 2] - data[nIdx + 2], 2)
            );
            
            const weight = Math.exp(-spatialDist / (2 * spatialSigma * spatialSigma)) *
                          Math.exp(-colorDist / (2 * rangeSigma * rangeSigma));
            
            sumR += data[nIdx] * weight;
            sumG += data[nIdx + 1] * weight;
            sumB += data[nIdx + 2] * weight;
            sumW += weight;
          }
        }
        
        result[idx] = sumR / sumW;
        result[idx + 1] = sumG / sumW;
        result[idx + 2] = sumB / sumW;
        result[idx + 3] = data[idx + 3];
      }
    }
    
    data.set(result);
  }

  private applyUnsharpMask(imageData: ImageData, amount: number, radius: number): void {
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    const blurred = this.gaussianBlur(data, w, h, radius);
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] + (data[i] - blurred[i]) * amount));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + (data[i + 1] - blurred[i + 1]) * amount));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + (data[i + 2] - blurred[i + 2]) * amount));
    }
  }

  private gaussianBlur(data: Uint8ClampedArray, w: number, h: number, sigma: number): Uint8ClampedArray {
    const result = new Uint8ClampedArray(data.length);
    const radius = Math.ceil(sigma * 3);
    const kernel = this.createGaussianKernel(radius, sigma);
    
    // Horizontal pass
    const temp = new Uint8ClampedArray(data.length);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 0, g = 0, b = 0, sum = 0;
        for (let k = -radius; k <= radius; k++) {
          const nx = Math.min(Math.max(x + k, 0), w - 1);
          const idx = (y * w + nx) * 4;
          const weight = kernel[k + radius];
          r += data[idx] * weight;
          g += data[idx + 1] * weight;
          b += data[idx + 2] * weight;
          sum += weight;
        }
        const idx = (y * w + x) * 4;
        temp[idx] = r / sum;
        temp[idx + 1] = g / sum;
        temp[idx + 2] = b / sum;
        temp[idx + 3] = data[idx + 3];
      }
    }
    
    // Vertical pass
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 0, g = 0, b = 0, sum = 0;
        for (let k = -radius; k <= radius; k++) {
          const ny = Math.min(Math.max(y + k, 0), h - 1);
          const idx = (ny * w + x) * 4;
          const weight = kernel[k + radius];
          r += temp[idx] * weight;
          g += temp[idx + 1] * weight;
          b += temp[idx + 2] * weight;
          sum += weight;
        }
        const idx = (y * w + x) * 4;
        result[idx] = r / sum;
        result[idx + 1] = g / sum;
        result[idx + 2] = b / sum;
        result[idx + 3] = temp[idx + 3];
      }
    }
    
    return result;
  }

  private createGaussianKernel(radius: number, sigma: number): number[] {
    const kernel: number[] = [];
    for (let i = -radius; i <= radius; i++) {
      kernel.push(Math.exp(-(i * i) / (2 * sigma * sigma)));
    }
    return kernel;
  }

  private applySCurveContrast(data: Uint8ClampedArray, strength: number): void {
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const x = data[i + c] / 255;
        const curved = x < 0.5
          ? 0.5 * Math.pow(2 * x, 1 + strength)
          : 1 - 0.5 * Math.pow(2 * (1 - x), 1 + strength);
        data[i + c] = Math.min(255, Math.max(0, curved * 255));
      }
    }
  }

  private applyToneCurve(data: Uint8ClampedArray, amount: number, region: 'shadows' | 'midtones' | 'highlights'): void {
    for (let i = 0; i < data.length; i += 4) {
      const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      let factor = 0;
      
      if (region === 'shadows' && lum < 0.33) {
        factor = (0.33 - lum) / 0.33;
      } else if (region === 'midtones' && lum >= 0.25 && lum <= 0.75) {
        factor = 1 - Math.abs(lum - 0.5) * 4;
      } else if (region === 'highlights' && lum > 0.67) {
        factor = (lum - 0.67) / 0.33;
      }
      
      const boost = 1 + amount * factor;
      data[i] = Math.min(255, data[i] * boost);
      data[i + 1] = Math.min(255, data[i + 1] * boost);
      data[i + 2] = Math.min(255, data[i + 2] * boost);
    }
  }

  private applyLocalContrast(imageData: ImageData, strength: number): void {
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    const blurred = this.gaussianBlur(data, w, h, 15);
    
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const diff = data[i + c] - blurred[i + c];
        data[i + c] = Math.min(255, Math.max(0, data[i + c] + diff * strength));
      }
    }
  }

  private applyRadialVignette(imageData: ImageData, intensity: number, feather: number): void {
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    const cx = w / 2;
    const cy = h / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxDist;
        const vignetteStart = feather;
        
        if (dist > vignetteStart) {
          const factor = 1 - ((dist - vignetteStart) / (1 - vignetteStart)) * intensity;
          data[idx] *= factor;
          data[idx + 1] *= factor;
          data[idx + 2] *= factor;
        }
      }
    }
  }

  private applyOrtonEffect(imageData: ImageData, strength: number): void {
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    
    // Create bright layer
    const brightened = new Uint8ClampedArray(data.length);
    for (let i = 0; i < data.length; i += 4) {
      brightened[i] = Math.min(255, data[i] * 1.5);
      brightened[i + 1] = Math.min(255, data[i + 1] * 1.5);
      brightened[i + 2] = Math.min(255, data[i + 2] * 1.5);
      brightened[i + 3] = data[i + 3];
    }
    
    // Blur the bright layer
    const blurred = this.gaussianBlur(brightened, w, h, 8);
    
    // Blend with original using multiply mode
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * (1 - strength) + (data[i] * blurred[i] / 255) * strength);
      data[i + 1] = Math.min(255, data[i + 1] * (1 - strength) + (data[i + 1] * blurred[i + 1] / 255) * strength);
      data[i + 2] = Math.min(255, data[i + 2] * (1 - strength) + (data[i + 2] * blurred[i + 2] / 255) * strength);
    }
  }

  private applyHighlightBloom(imageData: ImageData, strength: number): void {
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    
    // Extract highlights
    const highlights = new Uint8ClampedArray(data.length);
    for (let i = 0; i < data.length; i += 4) {
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (lum > 200) {
        const factor = (lum - 200) / 55;
        highlights[i] = data[i] * factor;
        highlights[i + 1] = data[i + 1] * factor;
        highlights[i + 2] = data[i + 2] * factor;
      }
      highlights[i + 3] = 255;
    }
    
    // Blur highlights
    const blurred = this.gaussianBlur(highlights, w, h, 12);
    
    // Add back to original
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] + blurred[i] * strength);
      data[i + 1] = Math.min(255, data[i + 1] + blurred[i + 1] * strength);
      data[i + 2] = Math.min(255, data[i + 2] + blurred[i + 2] * strength);
    }
  }

  private applyFilmGrain(data: Uint8ClampedArray, intensity: number, saturation: number): void {
    for (let i = 0; i < data.length; i += 4) {
      const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      const grainIntensity = intensity * (0.3 + 0.7 * (1 - lum)); // More grain in shadows
      
      const noiseR = (Math.random() - 0.5) * grainIntensity;
      const noiseG = (Math.random() - 0.5) * grainIntensity;
      const noiseB = (Math.random() - 0.5) * grainIntensity;
      const noiseL = (noiseR + noiseG + noiseB) / 3;
      
      data[i] = Math.min(255, Math.max(0, data[i] + noiseL * (1 - saturation) + noiseR * saturation));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noiseL * (1 - saturation) + noiseG * saturation));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noiseL * (1 - saturation) + noiseB * saturation));
    }
  }

  private applyAtmosphericPerspective(imageData: ImageData, strength: number): void {
    const data = imageData.data;
    const hazeR = 200, hazeG = 205, hazeB = 215;
    
    for (let i = 0; i < data.length; i += 4) {
      const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      const hazeFactor = strength * (1 - lum * 0.6);
      
      data[i] = data[i] * (1 - hazeFactor) + hazeR * hazeFactor;
      data[i + 1] = data[i + 1] * (1 - hazeFactor) + hazeG * hazeFactor;
      data[i + 2] = data[i + 2] * (1 - hazeFactor) + hazeB * hazeFactor;
    }
  }

  private applyTextureEnhancement(imageData: ImageData, strength: number): void {
    this.applyHighPassSharpening(imageData, strength);
    this.applyMicroContrast(imageData.data, strength * 0.5);
  }

  private applyHighPassSharpening(imageData: ImageData, strength: number): void {
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    const blurred = this.gaussianBlur(data, w, h, 3);
    
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const highPass = data[i + c] - blurred[i + c] + 128;
        const overlayResult = highPass < 128
          ? (2 * data[i + c] * highPass) / 255
          : 255 - (2 * (255 - data[i + c]) * (255 - highPass)) / 255;
        data[i + c] = Math.min(255, Math.max(0, data[i + c] * (1 - strength) + overlayResult * strength));
      }
    }
  }

  private applyFrequencySeparation(imageData: ImageData, strength: number, layer: 'high' | 'low'): void {
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    const blurred = this.gaussianBlur(data, w, h, 5);
    
    if (layer === 'high') {
      for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
          const highFreq = (data[i + c] - blurred[i + c]) * (1 + strength);
          data[i + c] = Math.min(255, Math.max(0, blurred[i + c] + highFreq));
        }
      }
    }
  }

  private applyShadowRecovery(data: Uint8ClampedArray, strength: number): void {
    for (let i = 0; i < data.length; i += 4) {
      const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      if (lum < 0.4) {
        const factor = (0.4 - lum) / 0.4;
        const boost = 1 + strength * factor;
        data[i] = Math.min(255, data[i] * boost);
        data[i + 1] = Math.min(255, data[i + 1] * boost);
        data[i + 2] = Math.min(255, data[i + 2] * boost);
      }
    }
  }

  private applyShadowCrush(data: Uint8ClampedArray, strength: number): void {
    for (let i = 0; i < data.length; i += 4) {
      const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      if (lum < 0.3) {
        const factor = (0.3 - lum) / 0.3;
        const crush = 1 - strength * factor * 0.5;
        data[i] = Math.max(0, data[i] * crush);
        data[i + 1] = Math.max(0, data[i + 1] * crush);
        data[i + 2] = Math.max(0, data[i + 2] * crush);
      }
    }
  }

  private applySpecularEnhancement(data: Uint8ClampedArray, strength: number): void {
    for (let i = 0; i < data.length; i += 4) {
      const max = Math.max(data[i], data[i + 1], data[i + 2]);
      if (max > 220) {
        const factor = ((max - 220) / 35) * strength;
        data[i] = Math.min(255, data[i] + factor * 15);
        data[i + 1] = Math.min(255, data[i + 1] + factor * 15);
        data[i + 2] = Math.min(255, data[i + 2] + factor * 15);
      }
    }
  }

  private applyDirectionalBlur(imageData: ImageData, strength: number, angle: number): void {
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    const samples = Math.ceil(strength * 2);
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const result = new Uint8ClampedArray(data.length);
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let s = -samples; s <= samples; s++) {
          const nx = Math.round(x + s * dx * strength * 0.5);
          const ny = Math.round(y + s * dy * strength * 0.5);
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const nIdx = (ny * w + nx) * 4;
            r += data[nIdx];
            g += data[nIdx + 1];
            b += data[nIdx + 2];
            count++;
          }
        }
        
        result[idx] = r / count;
        result[idx + 1] = g / count;
        result[idx + 2] = b / count;
        result[idx + 3] = data[idx + 3];
      }
    }
    
    data.set(result);
  }

  private applyMicroContrast(data: Uint8ClampedArray, strength: number): void {
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const diff = avg - 128;
      const boost = 1 + strength * (Math.abs(diff) / 128);
      data[i] = Math.min(255, Math.max(0, 128 + (data[i] - 128) * boost));
      data[i + 1] = Math.min(255, Math.max(0, 128 + (data[i + 1] - 128) * boost));
      data[i + 2] = Math.min(255, Math.max(0, 128 + (data[i + 2] - 128) * boost));
    }
  }

  private applyVibranceBoost(data: Uint8ClampedArray, strength: number): void {
    for (let i = 0; i < data.length; i += 4) {
      const max = Math.max(data[i], data[i + 1], data[i + 2]);
      const min = Math.min(data[i], data[i + 1], data[i + 2]);
      const saturation = max > 0 ? (max - min) / max : 0;
      
      // Boost less saturated colors more
      const boost = 1 + strength * (1 - saturation);
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      
      data[i] = Math.min(255, Math.max(0, avg + (data[i] - avg) * boost));
      data[i + 1] = Math.min(255, Math.max(0, avg + (data[i + 1] - avg) * boost));
      data[i + 2] = Math.min(255, Math.max(0, avg + (data[i + 2] - avg) * boost));
    }
  }

  private applyThreeWayColorGrade(data: Uint8ClampedArray, shadows: [number, number, number], midtones: [number, number, number], highlights: [number, number, number], strength: number): void {
    for (let i = 0; i < data.length; i += 4) {
      const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      
      let shadowWeight = lum < 0.33 ? (0.33 - lum) / 0.33 : 0;
      let midtoneWeight = lum < 0.33 ? lum / 0.33 : lum > 0.67 ? (1 - lum) / 0.33 : 1;
      let highlightWeight = lum > 0.67 ? (lum - 0.67) / 0.33 : 0;
      
      const totalWeight = shadowWeight + midtoneWeight + highlightWeight;
      shadowWeight /= totalWeight;
      midtoneWeight /= totalWeight;
      highlightWeight /= totalWeight;
      
      data[i] = Math.min(255, Math.max(0, data[i] + 
        (shadows[0] * shadowWeight + midtones[0] * midtoneWeight + highlights[0] * highlightWeight) * strength));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + 
        (shadows[1] * shadowWeight + midtones[1] * midtoneWeight + highlights[1] * highlightWeight) * strength));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + 
        (shadows[2] * shadowWeight + midtones[2] * midtoneWeight + highlights[2] * highlightWeight) * strength));
    }
  }

  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }
}
