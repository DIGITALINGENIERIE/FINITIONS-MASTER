import mastersPresets from './masters-presets.json';
import type { DnaConfiguration } from '@shared/schema';

export interface DetectionResult {
  suggestedMaster: string;
  confidence: number;
  reasoning: string;
  alternatives: Array<{ master: string; confidence: number }>;
}

export interface MasterPreset {
  name: string;
  displayName: string;
  period: string;
  periodCode: string;
  characteristics: string[];
  configuration: DnaConfiguration;
  notes: string;
}

interface ImageAnalysis {
  brightness: number;
  contrast: number;
  warmth: number;
  saturation: number;
  dominantColors: { r: number; g: number; b: number }[];
}

function analyzeImage(imageData: ImageData): ImageAnalysis {
  const data = imageData.data;
  let totalR = 0, totalG = 0, totalB = 0;
  let minLum = 255, maxLum = 0;
  let warmCount = 0, coolCount = 0;
  let saturationSum = 0;
  const colorBuckets: Map<string, { r: number; g: number; b: number; count: number }> = new Map();

  const sampleSize = Math.floor(data.length / 4 / 100) || 1;
  let samples = 0;

  for (let i = 0; i < data.length; i += 4 * sampleSize) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    totalR += r;
    totalG += g;
    totalB += b;
    
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    minLum = Math.min(minLum, luminance);
    maxLum = Math.max(maxLum, luminance);
    
    if (r > b + 20) warmCount++;
    else if (b > r + 20) coolCount++;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    saturationSum += sat;
    
    const bucketKey = `${Math.floor(r / 32)}-${Math.floor(g / 32)}-${Math.floor(b / 32)}`;
    const existing = colorBuckets.get(bucketKey);
    if (existing) {
      existing.count++;
    } else {
      colorBuckets.set(bucketKey, { r, g, b, count: 1 });
    }
    
    samples++;
  }

  const avgR = totalR / samples;
  const avgG = totalG / samples;
  const avgB = totalB / samples;
  
  const brightness = (avgR + avgG + avgB) / 3 / 255;
  const contrast = (maxLum - minLum) / 255;
  const warmth = warmCount / (warmCount + coolCount + 1);
  const saturation = saturationSum / samples;

  const sortedColors = Array.from(colorBuckets.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(c => ({ r: c.r, g: c.g, b: c.b }));

  return {
    brightness,
    contrast,
    warmth,
    saturation,
    dominantColors: sortedColors
  };
}

export function detectOptimalMaster(imageData: ImageData): DetectionResult {
  const analysis = analyzeImage(imageData);
  const scores: Map<string, { score: number; reasons: string[] }> = new Map();

  const masters = mastersPresets.masters as Record<string, MasterPreset>;

  for (const [key, master] of Object.entries(masters)) {
    let score = 0;
    const reasons: string[] = [];

    if (analysis.contrast > 0.7) {
      if (['caravaggio', 'bacon', 'rembrandt'].includes(key)) {
        score += 25;
        reasons.push('High contrast matches dramatic style');
      }
    } else if (analysis.contrast > 0.4) {
      if (['vermeer', 'friedrich'].includes(key)) {
        score += 20;
        reasons.push('Moderate contrast suitable for contemplative style');
      }
    } else {
      if (['turner', 'monet'].includes(key)) {
        score += 25;
        reasons.push('Soft contrast ideal for atmospheric effects');
      }
    }

    if (analysis.warmth > 0.6) {
      if (['caravaggio', 'rembrandt', 'klimt'].includes(key)) {
        score += 20;
        reasons.push('Warm palette detected');
      }
    } else if (analysis.warmth < 0.4) {
      if (['vermeer', 'turner', 'monet', 'friedrich'].includes(key)) {
        score += 20;
        reasons.push('Cool palette detected');
      }
    }

    if (analysis.brightness > 0.6) {
      if (['turner', 'monet', 'vermeer'].includes(key)) {
        score += 15;
        reasons.push('High luminosity matches style');
      }
    } else if (analysis.brightness < 0.35) {
      if (['caravaggio', 'rembrandt', 'beksinski'].includes(key)) {
        score += 20;
        reasons.push('Dark tones suit dramatic/dystopian style');
      }
    }

    if (analysis.saturation > 0.5) {
      if (['chagall', 'klimt', 'bacon'].includes(key)) {
        score += 15;
        reasons.push('Vibrant colors detected');
      }
    } else if (analysis.saturation < 0.25) {
      if (['beksinski', 'friedrich'].includes(key)) {
        score += 15;
        reasons.push('Muted tones detected');
      }
    }

    const hasGolden = analysis.dominantColors.some(c => 
      c.r > 180 && c.g > 140 && c.g < 200 && c.b < 100
    );
    if (hasGolden && key === 'klimt') {
      score += 20;
      reasons.push('Golden tones detected');
    }

    const hasSepiaish = analysis.dominantColors.some(c => 
      c.r > c.b + 30 && c.g > c.b && c.r < 180
    );
    if (hasSepiaish && key === 'beksinski') {
      score += 15;
      reasons.push('Sepia/decay tones detected');
    }

    scores.set(key, { score, reasons });
  }

  const sortedScores = Array.from(scores.entries())
    .sort((a, b) => b[1].score - a[1].score);

  const topScore = sortedScores[0];
  const maxPossible = 85;
  const confidence = Math.min(95, Math.round((topScore[1].score / maxPossible) * 100));

  const alternatives = sortedScores.slice(1, 4).map(([master, data]) => ({
    master,
    confidence: Math.min(90, Math.round((data.score / maxPossible) * 100))
  }));

  const masterInfo = masters[topScore[0]];
  const reasoning = topScore[1].reasons.length > 0 
    ? topScore[1].reasons.slice(0, 2).join('. ') 
    : `Style characteristics match ${masterInfo?.displayName || topScore[0]}`;

  return {
    suggestedMaster: topScore[0],
    confidence,
    reasoning,
    alternatives
  };
}

export function getMasterPreset(masterId: string): MasterPreset | null {
  const masters = mastersPresets.masters as Record<string, MasterPreset>;
  return masters[masterId] || null;
}

export function getAllMasters(): Array<{ id: string; preset: MasterPreset }> {
  const masters = mastersPresets.masters as Record<string, MasterPreset>;
  return Object.entries(masters).map(([id, preset]) => ({ id, preset }));
}

export function getMasterConfiguration(masterId: string): DnaConfiguration | null {
  const preset = getMasterPreset(masterId);
  return preset?.configuration || null;
}
