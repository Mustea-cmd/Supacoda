import { File } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Terminal, GitBranch, AlertTriangle, XCircle } from "lucide-react";

interface StatusBarProps {
  selectedFile: File | null;
  selectedModel: string;
  onToggleTerminal: () => void;
  terminalVisible: boolean;
}

export default function StatusBar({ selectedFile, selectedModel, onToggleTerminal, terminalVisible }: StatusBarProps) {
  const getLanguageDisplay = (language?: string | null) => {
    if (!language) return "Plain Text";
    return language.charAt(0).toUpperCase() + language.slice(1);
  };

  const getModelDisplayName = (model: string) => {
    const modelNames: Record<string, string> = {
      "gemini-2.5-flash": "Gemini 2.5 Flash",
      "gemini-2.5-pro": "Gemini 2.5 Pro",
      "supa-ai": "SupaAI",
      "amazon-q-developer": "Amazon Q Developer",
      "copilot-gpt-4": "Microsoft Copilot",
      "deepseek-coder": "DeepSeek Coder",
      "llama-3.3": "Llama 3.3",
    };
    return modelNames[model] || model;
  };

  return (
    <div className="h-6 bg-blue-600 flex items-center justify-between px-4 text-xs text-white">
      <div className="flex items-center space-x-4">
        <span className="flex items-center">
          <GitBranch className="h-3 w-3 mr-1" />
          main
        </span>
        <span className="flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1 text-yellow-300" />
          0 warnings
        </span>
        <span className="flex items-center">
          <XCircle className="h-3 w-3 mr-1 text-red-300" />
          0 errors
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleTerminal}
          className="h-5 px-2 text-xs hover:bg-blue-700"
        >
          <Terminal className="h-3 w-3 mr-1" />
          {terminalVisible ? "Hide Terminal" : "Show Terminal"}
        </Button>
      </div>
      <div className="flex items-center space-x-4">
        {selectedFile && (
          <>
            <span>{getLanguageDisplay(selectedFile.language)}</span>
            <span>UTF-8</span>
            <span>LF</span>
            <span>Ln 1, Col 1</span>
          </>
        )}
        <span>AI: {getModelDisplayName(selectedModel)}</span>
      </div>
    </div>
  );
}
