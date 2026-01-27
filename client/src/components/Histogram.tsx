import { useEffect, useRef, useMemo } from "react";

interface HistogramProps {
  imageData: ImageData | null;
  width?: number;
  height?: number;
}

export function Histogram({ imageData, width = 256, height = 80 }: HistogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const histogramData = useMemo(() => {
    if (!imageData) return null;
    
    const r = new Array(256).fill(0);
    const g = new Array(256).fill(0);
    const b = new Array(256).fill(0);
    const lum = new Array(256).fill(0);
    
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      r[data[i]]++;
      g[data[i + 1]]++;
      b[data[i + 2]]++;
      const l = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      lum[l]++;
    }
    
    const maxR = Math.max(...r);
    const maxG = Math.max(...g);
    const maxB = Math.max(...b);
    const maxLum = Math.max(...lum);
    const maxVal = Math.max(maxR, maxG, maxB, maxLum);
    
    return { r, g, b, lum, maxVal };
  }, [imageData]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !histogramData) return;
    
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, width, height);
    
    const { r, g, b, lum, maxVal } = histogramData;
    const barWidth = width / 256;
    
    ctx.globalCompositeOperation = 'screen';
    
    // Luminance (white)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 256; i++) {
      const h = (lum[i] / maxVal) * height;
      ctx.fillRect(i * barWidth, height - h, barWidth, h);
    }
    
    // Red channel
    ctx.fillStyle = 'rgba(255, 80, 80, 0.5)';
    for (let i = 0; i < 256; i++) {
      const h = (r[i] / maxVal) * height;
      ctx.fillRect(i * barWidth, height - h, barWidth, h);
    }
    
    // Green channel
    ctx.fillStyle = 'rgba(80, 255, 80, 0.5)';
    for (let i = 0; i < 256; i++) {
      const h = (g[i] / maxVal) * height;
      ctx.fillRect(i * barWidth, height - h, barWidth, h);
    }
    
    // Blue channel
    ctx.fillStyle = 'rgba(80, 80, 255, 0.5)';
    for (let i = 0; i < 256; i++) {
      const h = (b[i] / maxVal) * height;
      ctx.fillRect(i * barWidth, height - h, barWidth, h);
    }
    
    ctx.globalCompositeOperation = 'source-over';
    
    // Border
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
    
  }, [histogramData, width, height]);
  
  if (!imageData) {
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground text-xs"
        style={{ width, height, background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}
      >
        Aucune image
      </div>
    );
  }
  
  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      className="rounded"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      data-testid="histogram-canvas"
    />
  );
}
