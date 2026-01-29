import { Link } from "wouter";
import { Download, Upload, Share2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onExport: () => void;
  onImportClick: () => void;
  onImportPreset?: () => void;
}

export function Header({ onExport, onImportClick, onImportPreset }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {/* Logo Mark */}
          <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(255,190,0,0.3)]">
            <span className="font-display font-bold text-accent-foreground text-xl">F</span>
          </div>
          <h1 className="font-display text-xl font-semibold tracking-wide text-foreground">
            FINITION<span className="text-muted-foreground font-light">GENERATOR</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex border-dashed border-muted-foreground/40 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all"
            onClick={onImportClick}
        >
          <Upload className="w-4 h-4 mr-2" />
          Import Image
        </Button>
        
        <div className="h-6 w-px bg-border hidden sm:block mx-2" />

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Share2 className="w-4 h-4" />
        </Button>
        <Button 
            size="sm" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20"
            onClick={(e) => {
              e.preventDefault();
              onExport();
            }}
            data-testid="button-download"
        >
          <Download className="w-4 h-4 mr-2" />
          Télécharger
        </Button>
        {onImportPreset && (
          <Button 
              variant="outline"
              size="sm" 
              onClick={onImportPreset}
              data-testid="button-import-preset"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importer Paramètres
          </Button>
        )}
      </div>
    </header>
  );
}
