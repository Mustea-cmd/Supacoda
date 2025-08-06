import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Map, X } from "lucide-react";
import type { File } from "@shared/schema";

interface MiniMapProps {
  file: File | null;
  onLineClick: (lineNumber: number) => void;
}

export default function MiniMap({ file, onLineClick }: MiniMapProps) {
  const [visible, setVisible] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (file?.content) {
      setLines(file.content.split('\n'));
    } else {
      setLines([]);
    }
  }, [file]);

  useEffect(() => {
    if (!visible || !canvasRef.current || lines.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 200;
    canvas.height = 400;

    // Clear canvas
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw code representation
    const lineHeight = Math.min(2, canvas.height / lines.length);
    
    lines.forEach((line, index) => {
      const y = index * lineHeight;
      const intensity = Math.min(line.length / 80, 1); // Max line length for intensity
      
      // Different colors for different code elements
      if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
        ctx.fillStyle = '#6b7280'; // gray for comments
      } else if (line.includes('function') || line.includes('const') || line.includes('let')) {
        ctx.fillStyle = '#3b82f6'; // blue for declarations
      } else if (line.includes('import') || line.includes('export')) {
        ctx.fillStyle = '#10b981'; // green for imports
      } else if (line.trim().length === 0) {
        ctx.fillStyle = '#374151'; // darker for empty lines
      } else {
        ctx.fillStyle = `rgba(148, 163, 184, ${0.3 + intensity * 0.7})`; // slate with intensity
      }
      
      ctx.fillRect(0, y, canvas.width * (0.1 + intensity * 0.9), Math.max(1, lineHeight));
    });
  }, [visible, lines]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || lines.length === 0) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const lineNumber = Math.floor((y / canvas.height) * lines.length) + 1;
    
    onLineClick(lineNumber);
  };

  if (!file) return null;

  return (
    <div className="fixed top-20 right-4 z-50">
      {!visible ? (
        <Button
          onClick={() => setVisible(true)}
          variant="outline"
          size="sm"
          className="bg-slate-800 border-slate-600 hover:bg-slate-700"
        >
          <Map className="w-4 h-4" />
        </Button>
      ) : (
        <Card className="bg-slate-800 border-slate-600 p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-300 font-medium">Code Map</span>
            <Button
              onClick={() => setVisible(false)}
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 hover:bg-slate-700"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="relative">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="border border-slate-600 cursor-pointer hover:border-slate-500 transition-colors"
              style={{ width: '150px', height: '300px' }}
            />
            
            <div className="mt-2 text-xs text-slate-400">
              {lines.length} lines • Click to navigate
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}