import { useState, useRef, useCallback, useEffect } from "react";

interface BeforeAfterSliderProps {
  beforeImage: string | null;
  afterCanvas: HTMLCanvasElement | null;
  width: number;
  height: number;
}

export function BeforeAfterSlider({ beforeImage, afterCanvas, width, height }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const beforeCanvasRef = useRef<HTMLCanvasElement>(null);
  const afterDisplayRef = useRef<HTMLCanvasElement>(null);
  
  // Load before image
  useEffect(() => {
    if (!beforeImage || !beforeCanvasRef.current) return;
    
    const canvas = beforeCanvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      
      // Calculate scaling to fit
      const scale = Math.min(width / img.width, height / img.height);
      const scaledW = img.width * scale;
      const scaledH = img.height * scale;
      const offsetX = (width - scaledW) / 2;
      const offsetY = (height - scaledH) / 2;
      
      ctx.fillStyle = '#0a0a12';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
    };
    img.src = beforeImage;
  }, [beforeImage, width, height]);
  
  // Copy after canvas
  useEffect(() => {
    if (!afterCanvas || !afterDisplayRef.current) return;
    
    const displayCanvas = afterDisplayRef.current;
    displayCanvas.width = width;
    displayCanvas.height = height;
    const ctx = displayCanvas.getContext('2d')!;
    
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, width, height);
    
    // Scale to fit
    const scale = Math.min(width / afterCanvas.width, height / afterCanvas.height);
    const scaledW = afterCanvas.width * scale;
    const scaledH = afterCanvas.height * scale;
    const offsetX = (width - scaledW) / 2;
    const offsetY = (height - scaledH) / 2;
    
    ctx.drawImage(afterCanvas, offsetX, offsetY, scaledW, scaledH);
  }, [afterCanvas, width, height]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, [isDragging]);
  
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  if (!beforeImage || !afterCanvas) {
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground"
        style={{ width, height, background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}
      >
        Chargez une image pour la comparaison
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-lg cursor-ew-resize select-none"
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      data-testid="before-after-slider"
    >
      {/* After image (full) */}
      <canvas
        ref={afterDisplayRef}
        className="absolute inset-0"
        style={{ width, height }}
      />
      
      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <canvas
          ref={beforeCanvasRef}
          style={{ width, height }}
        />
      </div>
      
      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-cyan-400 cursor-ew-resize z-10"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center shadow-lg">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-4 bg-black rounded-full" />
            <div className="w-0.5 h-4 bg-black rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Labels */}
      <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 rounded text-xs font-mono text-cyan-400">
        AVANT
      </div>
      <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-xs font-mono text-amber-400">
        APRÈS
      </div>
    </div>
  );
}
