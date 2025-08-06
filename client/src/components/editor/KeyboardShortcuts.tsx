import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface KeyboardShortcutsProps {
  onNewFile: () => void;
  onSaveFile: () => void;
  onToggleTerminal: () => void;
  onQuickCommand: () => void;
  onAIAssist: () => void;
  onFormatCode: () => void;
}

export default function KeyboardShortcuts({
  onNewFile,
  onSaveFile,
  onToggleTerminal,
  onQuickCommand,
  onAIAssist,
  onFormatCode,
}: KeyboardShortcutsProps) {
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey, metaKey, shiftKey, altKey, key } = event;
      const isCtrlOrCmd = ctrlKey || metaKey;

      // Prevent default browser behavior for custom shortcuts
      const shortcuts = [
        { keys: [isCtrlOrCmd && key === "n"], action: onNewFile, label: "New File" },
        { keys: [isCtrlOrCmd && key === "s"], action: onSaveFile, label: "Save File" },
        { keys: [isCtrlOrCmd && key === "`"], action: onToggleTerminal, label: "Toggle Terminal" },
        { keys: [isCtrlOrCmd && shiftKey && key === "P"], action: onQuickCommand, label: "Command Palette" },
        { keys: [isCtrlOrCmd && key === " "], action: onAIAssist, label: "AI Assistant" },
        { keys: [isCtrlOrCmd && shiftKey && key === "I"], action: onFormatCode, label: "Format Code" },
      ];

      for (const shortcut of shortcuts) {
        if (shortcut.keys.every(Boolean)) {
          event.preventDefault();
          shortcut.action();
          toast({
            title: shortcut.label,
            description: "Keyboard shortcut triggered",
            duration: 1500,
          });
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onNewFile, onSaveFile, onToggleTerminal, onQuickCommand, onAIAssist, onFormatCode, toast]);

  return null; // This component doesn't render anything
}