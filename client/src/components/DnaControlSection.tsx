import { ReactNode } from "react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DnaControlSectionProps {
  id: string;
  title: string;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  children: ReactNode;
}

export function DnaControlSection({ id, title, isEnabled, onToggle, children }: DnaControlSectionProps) {
  return (
    <AccordionItem value={id} className="border-border/50">
      <div className="flex items-center px-4 py-1 hover:bg-muted/30 transition-colors">
        <Switch 
          checked={isEnabled} 
          onCheckedChange={onToggle}
          className="mr-3 scale-75 data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
          onClick={(e) => e.stopPropagation()}
        />
        <AccordionTrigger className={cn("text-base font-medium py-3 hover:no-underline", !isEnabled && "opacity-50")}>
          <span className="font-display tracking-wide">{title}</span>
        </AccordionTrigger>
      </div>
      <AccordionContent className="px-6 py-4 space-y-6 bg-black/10">
        <div className={cn("space-y-6 transition-opacity duration-200", !isEnabled && "opacity-40 pointer-events-none grayscale")}>
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

interface ControlSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  suffix?: string;
}

export function ControlSlider({ label, value, min = 0, max = 100, step = 1, onChange, suffix = "%" }: ControlSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs text-muted-foreground uppercase tracking-wider font-semibold">
        <Label className="text-xs font-medium cursor-pointer">{label}</Label>
        <span className="font-mono text-[10px] bg-background/50 px-1.5 py-0.5 rounded border border-border/50">
          {value}{suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(vals) => onChange(vals[0])}
        className="py-1.5"
      />
    </div>
  );
}
