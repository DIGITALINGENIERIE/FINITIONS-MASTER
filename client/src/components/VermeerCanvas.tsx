
import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Group } from "react-konva";
import useImage from "use-image";
import { DnaConfiguration } from "@shared/schema";
import { MasterProcessor } from "@/lib/vermeer-processor";
import { Loader2, AlertCircle } from "lucide-react";

interface VermeerCanvasProps {
  imageUrl: string;
  config: DnaConfiguration;
  width: number;
  height: number;
}

export function VermeerCanvas({ imageUrl, config, width, height, onRef }: VermeerCanvasProps & { onRef?: (ref: any) => void }) {
  const [image, status] = useImage(imageUrl, "anonymous");
  const stageRef = useRef<any>(null);
  const processedImageRef = useRef<HTMLCanvasElement | null>(null);
  const processedImageDataRef = useRef<ImageData | null>(null);

  useEffect(() => {
    if (onRef) {
      onRef({
        current: stageRef.current,
        getProcessedImage: () => processedImageRef.current,
        getProcessedImageData: () => processedImageDataRef.current
      });
    }
  }, [onRef, stageRef.current, processedImageRef.current]);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0, scale: 1 });
  const [processedImage, setProcessedImage] = useState<HTMLCanvasElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processorRef = useRef<MasterProcessor | null>(null);

  useEffect(() => {
    if (image && width > 0 && height > 0) {
      const scale = Math.min(width / image.width, height / image.height);
      setImageSize({
        w: image.width * scale,
        h: image.height * scale,
        scale,
      });
    }
  }, [image, width, height]);

  const processImage = useCallback(async () => {
    if (!imageUrl || !image) return;
    
    setIsProcessing(true);
    
    try {
      if (!processorRef.current) {
        processorRef.current = new MasterProcessor();
      }
      
      await processorRef.current.loadImage(imageUrl);
      const processedData = processorRef.current.process(config);
      
      const canvas = document.createElement('canvas');
      canvas.width = processedData.width;
      canvas.height = processedData.height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(processedData, 0, 0);
      
      setProcessedImage(canvas);
      processedImageRef.current = canvas;
      processedImageDataRef.current = processedData;
    } catch (error) {
      console.error("Processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [imageUrl, image, config]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      processImage();
    }, 250);
    
    return () => clearTimeout(debounceTimeout);
  }, [processImage]);

  if (status === "loading") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/20 text-muted-foreground animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-xs uppercase tracking-widest font-medium">Loading Canvas...</span>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-destructive/10 text-destructive">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="w-8 h-8" />
          <span className="text-xs uppercase tracking-widest font-medium">Failed to load image</span>
        </div>
      </div>
    );
  }

  const x = (width - imageSize.w) / 2;
  const y = (height - imageSize.h) / 2;

  return (
    <div className="relative">
      {isProcessing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 text-white">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs uppercase tracking-widest">Processing DNA...</span>
          </div>
        </div>
      )}
      
      <Stage 
        width={width} 
        height={height} 
        ref={stageRef} 
        className="bg-[#0c0d12]"
      >
        <Layer>
          <Group>
            {processedImage ? (
              <KonvaImage
                image={processedImage}
                x={x}
                y={y}
                width={imageSize.w}
                height={imageSize.h}
                listening={false}
                perfectDrawEnabled={false}
              />
            ) : (
              <KonvaImage
                image={image}
                x={x}
                y={y}
                width={imageSize.w}
                height={imageSize.h}
              />
            )}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
}
