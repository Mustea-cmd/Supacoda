import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Command, FileText, Terminal, Code, Zap, Search, Settings } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onExecuteCommand: (command: string) => void;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  shortcut?: string;
}

export default function CommandPalette({ open, onClose, onExecuteCommand }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    {
      id: "new-file",
      title: "New File",
      description: "Create a new file in the current project",
      icon: <FileText className="w-4 h-4" />,
      category: "File",
      shortcut: "Ctrl+N"
    },
    {
      id: "toggle-terminal",
      title: "Toggle Terminal",
      description: "Show or hide the terminal panel",
      icon: <Terminal className="w-4 h-4" />,
      category: "View",
      shortcut: "Ctrl+`"
    },
    {
      id: "format-code",
      title: "Format Code",
      description: "Format the current file with AI",
      icon: <Code className="w-4 h-4" />,
      category: "Edit",
      shortcut: "Ctrl+Shift+I"
    },
    {
      id: "ai-optimize",
      title: "AI Optimize",
      description: "Optimize current code with AI",
      icon: <Zap className="w-4 h-4" />,
      category: "AI",
      shortcut: "Ctrl+Alt+O"
    },
    {
      id: "ai-explain",
      title: "AI Explain",
      description: "Get AI explanation of selected code",
      icon: <Search className="w-4 h-4" />,
      category: "AI",
      shortcut: "Ctrl+Alt+E"
    },
    {
      id: "ai-refactor",
      title: "AI Refactor",
      description: "Refactor code with AI suggestions",
      icon: <Code className="w-4 h-4" />,
      category: "AI",
      shortcut: "Ctrl+Alt+R"
    },
    {
      id: "settings",
      title: "Settings",
      description: "Open application settings",
      icon: <Settings className="w-4 h-4" />,
      category: "Settings"
    }
  ];

  const filteredCommands = commands.filter(
    (command) =>
      command.title.toLowerCase().includes(query.toLowerCase()) ||
      command.description.toLowerCase().includes(query.toLowerCase()) ||
      command.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          break;
        case "Enter":
          event.preventDefault();
          if (filteredCommands[selectedIndex]) {
            onExecuteCommand(filteredCommands[selectedIndex].id);
            onClose();
          }
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, selectedIndex, filteredCommands, onExecuteCommand, onClose]);

  const categoryColors: Record<string, string> = {
    "File": "bg-blue-600",
    "Edit": "bg-green-600",
    "View": "bg-purple-600",
    "AI": "bg-orange-600",
    "Settings": "bg-gray-600"
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-200">
            <Command className="w-5 h-5" />
            Command Palette
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-slate-700 border-slate-600 text-slate-200"
            autoFocus
          />

          <div className="max-h-80 overflow-auto space-y-1">
            {filteredCommands.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No commands found for "{query}"
              </div>
            ) : (
              filteredCommands.map((command, index) => (
                <Button
                  key={command.id}
                  variant={index === selectedIndex ? "secondary" : "ghost"}
                  className={`w-full justify-start h-auto p-3 ${
                    index === selectedIndex
                      ? "bg-slate-700 text-slate-200"
                      : "text-slate-300 hover:bg-slate-700 hover:text-slate-200"
                  }`}
                  onClick={() => {
                    onExecuteCommand(command.id);
                    onClose();
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      {command.icon}
                      <div className="text-left">
                        <div className="font-medium">{command.title}</div>
                        <div className="text-xs text-slate-400">{command.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${categoryColors[command.category]} text-white border-none`}
                      >
                        {command.category}
                      </Badge>
                      {command.shortcut && (
                        <Badge variant="outline" className="text-xs">
                          {command.shortcut}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}