import { useState, useEffect } from "react";
import SourceControlPanel from "@/components/editor/SourceControlPanel";
import SettingsPanel from "@/components/editor/SettingsPanel";
import ExtensionManager from "@/components/editor/ExtensionManager";
import GlobalSearch from "@/components/editor/GlobalSearch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import FileExplorer from "@/components/editor/FileExplorer";
import MonacoEditor from "@/components/editor/MonacoEditor";
import { useEffect as useReactEffect } from "react";
// Extensions: built-in and remote registry auto-discovery
import { activateAll } from "@/extensions";
import { autoDiscoverAndInstall } from "@/extensions/autoDiscover";
import ProblemsPanel, { Problem } from "@/components/editor/ProblemsPanel";
import AIChat from "@/components/editor/AIChat";
import AICodeEditor from "@/components/editor/AICodeEditor";
import QuickActions from "@/components/editor/QuickActions";
import AICodeSuggestions from "@/components/editor/AICodeSuggestions";
import FileTemplates from "@/components/editor/FileTemplates";
import KeyboardShortcuts from "@/components/editor/KeyboardShortcuts";
import CommandPalette from "@/components/editor/CommandPalette";
import MiniMap from "@/components/editor/MiniMap";
import AIModelSelector from "@/components/editor/AIModelSelector";
import StatusBar from "@/components/editor/StatusBar";
import Terminal from "@/components/editor/Terminal";

import { File, Project } from "@shared/schema";

export default function Editor() {

  // On mount, activate all built-in extensions and auto-discover new ones from remote registry
  useReactEffect(() => {
    // Monaco is loaded globally as window.monaco after the editor is mounted
    const tryActivate = () => {
      const monaco = (window as any).monaco;
      if (monaco) {
        activateAll(monaco);
        autoDiscoverAndInstall(monaco); // Now fetches from remote registry if available
      } else {
        setTimeout(tryActivate, 500);
      }
    };
    tryActivate();
  }, []);


  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");
  const [showTerminal, setShowTerminal] = useState(true);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSourceControl, setShowSourceControl] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExtensionManager, setShowExtensionManager] = useState(false);
  const queryClient = useQueryClient();
  // Problems panel state
  const [problems, setProblems] = useState<Problem[]>([]);
  const [showProblems, setShowProblems] = useState(false);

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ["/api/projects", selectedProject?.id, "files"],
    enabled: !!selectedProject?.id,
  });

  // Select first project by default
  useEffect(() => {
    if (projects && Array.isArray(projects) && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  // Select first file by default
  useEffect(() => {
    if (files && Array.isArray(files) && files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }
  }, [files, selectedFile]);

  const handleCommand = (commandId: string) => {
    switch (commandId) {
      case "new-file":
        // Trigger file creation
        break;
      case "toggle-terminal":
        setShowTerminal(!showTerminal);
        break;
      case "format-code":
        // Trigger AI code formatting
        break;
      case "ai-optimize":
        // Trigger AI optimization
        break;
      case "ai-explain":
        // Trigger AI explanation
        break;
      case "ai-refactor":
        // Trigger AI refactoring
        break;
      default:
        break;
    }
  };

  if (projectsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading CodeAssist AI...</p>
        </div>
        <div className="ml-4">
          <button
            className="bg-slate-700 hover:bg-slate-600 text-xs text-white px-2 py-1 rounded"
            onClick={() => setShowSettings((v) => !v)}
          >
            {showSettings ? "Close Settings" : "Settings"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 text-slate-200 font-sans overflow-hidden flex flex-col">
      {/*
        Remote Extension Registry: Auto-discovery will fetch and install new extensions from the remote registry if available.
        See client/src/extensions/remoteRegistry.ts for details.
      */}
      {/* Top Menu Bar */}
      <div className="h-8 bg-slate-800 flex items-center px-4 text-sm border-b border-slate-700">
        <div className="flex space-x-6">
          <span className="hover:text-white cursor-pointer">File</span>
          <span className="hover:text-white cursor-pointer">Edit</span>
          <span className="hover:text-white cursor-pointer">View</span>
          <span className="hover:text-white cursor-pointer">Go</span>
          <span className="hover:text-white cursor-pointer">Run</span>
          <span className="hover:text-white cursor-pointer">Terminal</span>
          <span className="hover:text-white cursor-pointer">Help</span>
          <span className="hover:text-blue-400 cursor-pointer" onClick={() => setShowExtensionManager(v => !v)}>
            {showExtensionManager ? "Close Extensions" : "Extensions"}
          </span>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <button
            className="bg-slate-700 hover:bg-slate-600 text-xs text-white px-2 py-1 rounded"
            onClick={() => setShowSearch((v) => !v)}
          >
            {showSearch ? "Close Search" : "Search"}
          </button>
          <button
            className="bg-slate-700 hover:bg-slate-600 text-xs text-white px-2 py-1 rounded"
            onClick={() => setShowSourceControl((v) => !v)}
          >
            {showSourceControl ? "Close Source Control" : "Source Control"}
          </button>
          <div className="flex items-center space-x-2">
            <i className="fab fa-github text-slate-400"></i>
            <span className="text-xs text-slate-400">GitHub Ready</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
      </div>

      {/* Global Search Overlay */}
      {showSearch && (
        <div className="absolute z-50 left-0 top-8 w-full bg-slate-900/95 border-b border-slate-700 shadow-lg">
          <GlobalSearch />
        </div>
      )}

      {/* Main Application Area */}
      {showExtensionManager ? (
        <div className="flex-1 bg-slate-900">
          <ExtensionManager />
        </div>
      ) : (
        <div className="flex-1 flex">
          {/* ...existing code... */}
        </div>
      )}

      {/* Status Bar */}
      <StatusBar
        selectedFile={selectedFile}
        selectedModel={selectedModel}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
        terminalVisible={showTerminal}
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onNewFile={() => {}}
        onSaveFile={() => {}}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
        onQuickCommand={() => setShowCommandPalette(true)}
        onAIAssist={() => {}}
        onFormatCode={() => {}}
      />

      {/* Command Palette */}
      <CommandPalette
        open={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onExecuteCommand={handleCommand}
      />

      {/* Mini Map */}
      <MiniMap
        file={selectedFile}
        onLineClick={(lineNumber) => {
          // Navigate to line in editor
          console.log(`Navigate to line ${lineNumber}`);
        }}
      />
    </div>
  );
}
