import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal as TerminalIcon, Play, Bug, X, Maximize2 } from "lucide-react";

interface TerminalProps {
  onClose: () => void;
}

export default function Terminal({ onClose }: TerminalProps) {
  const [activeTab, setActiveTab] = useState("terminal");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "Welcome to CodeAssist AI Terminal",
    "Type 'help' for available commands",
    "",
  ]);
  const [currentCommand, setCurrentCommand] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const handleCommand = (command: string) => {
    const newOutput = [...terminalOutput, `$ ${command}`];
    
    switch (command.toLowerCase().trim()) {
      case "help":
        newOutput.push("Available commands:");
        newOutput.push("  help     - Show this help message");
        newOutput.push("  clear    - Clear terminal output");
        newOutput.push("  ls       - List files");
        newOutput.push("  pwd      - Show current directory");
        newOutput.push("  whoami   - Show current user");
        break;
      case "clear":
        setTerminalOutput(["Welcome to CodeAssist AI Terminal", "Type 'help' for available commands", ""]);
        setCurrentCommand("");
        return;
      case "ls":
        newOutput.push("app.py  requirements.txt  README.md  src/");
        break;
      case "pwd":
        newOutput.push("/workspace/my-ai-project");
        break;
      case "whoami":
        newOutput.push("codeassist-user");
        break;
      case "":
        break;
      default:
        newOutput.push(`Command not found: ${command}`);
        newOutput.push("Type 'help' for available commands");
    }
    
    newOutput.push("");
    setTerminalOutput(newOutput);
    setCurrentCommand("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand(currentCommand);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "terminal":
        return (
          <div className="h-full flex flex-col font-mono text-sm">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-1">
                {terminalOutput.map((line, index) => (
                  <div key={index} className={line.startsWith("$") ? "text-green-400" : "text-slate-300"}>
                    {line}
                  </div>
                ))}
                <div className="flex items-center text-green-400">
                  <span>$ </span>
                  <input
                    type="text"
                    value={currentCommand}
                    onChange={(e) => setCurrentCommand(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 bg-transparent outline-none text-slate-300 ml-1"
                    placeholder="Enter command..."
                    autoFocus
                  />
                  <span className="animate-pulse">|</span>
                </div>
              </div>
            </ScrollArea>
          </div>
        );
      case "output":
        return (
          <div className="h-full flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Play className="h-8 w-8 mx-auto mb-2" />
              <p>No output available</p>
              <p className="text-xs mt-1">Run your code to see output here</p>
            </div>
          </div>
        );
      case "debug":
        return (
          <div className="h-full flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Bug className="h-8 w-8 mx-auto mb-2" />
              <p>Debug console ready</p>
              <p className="text-xs mt-1">Debug information will appear here</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-slate-800 border-t border-slate-700 flex flex-col">
      {/* Panel Tabs */}
      <div className="flex bg-slate-700 border-b border-slate-600">
        <button
          onClick={() => setActiveTab("terminal")}
          className={`flex items-center px-4 py-2 text-sm border-r border-slate-600 ${
            activeTab === "terminal" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <TerminalIcon className="h-4 w-4 mr-2" />
          Terminal
        </button>
        <button
          onClick={() => setActiveTab("output")}
          className={`flex items-center px-4 py-2 text-sm border-r border-slate-600 ${
            activeTab === "output" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <Play className="h-4 w-4 mr-2" />
          Output
        </button>
        <button
          onClick={() => setActiveTab("debug")}
          className={`flex items-center px-4 py-2 text-sm border-r border-slate-600 ${
            activeTab === "debug" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <Bug className="h-4 w-4 mr-2" />
          Debug Console
        </button>
        <div className="ml-auto flex items-center px-4 py-2">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-white mr-2">
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-white" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1">
        {renderTabContent()}
      </div>
    </div>
  );
}
