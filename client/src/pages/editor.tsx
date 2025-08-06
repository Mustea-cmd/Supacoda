import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import FileExplorer from "@/components/editor/FileExplorer";
import MonacoEditor from "@/components/editor/MonacoEditor";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");
  const [showTerminal, setShowTerminal] = useState(true);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const queryClient = useQueryClient();

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ["/api/projects", selectedProject?.id, "files"],
    enabled: !!selectedProject?.id,
  });

  // Select first project by default
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  // Select first file by default
  useEffect(() => {
    if (files && files.length > 0 && !selectedFile) {
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
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 text-slate-200 font-sans overflow-hidden flex flex-col">
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
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <i className="fab fa-github text-slate-400"></i>
            <span className="text-xs text-slate-400">GitHub Ready</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
      </div>

      {/* Main Application Area */}
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15}>
            <div className="h-full bg-slate-800 border-r border-slate-700 flex flex-col">
              {/* AI Model Selection */}
              <div className="p-3 border-b border-slate-700">
                <AIModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              </div>

              {/* File Explorer */}
              <div className="flex-1 overflow-auto">
                <FileExplorer
                  project={selectedProject}
                  files={files || []}
                  selectedFile={selectedFile}
                  onFileSelect={setSelectedFile}
                  loading={filesLoading}
                />
              </div>

              {/* File Templates */}
              <div className="border-t border-slate-700">
                <FileTemplates
                  project={selectedProject}
                  selectedModel={selectedModel}
                  onFileCreated={() => {
                    // Refresh files list
                    queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProject?.id}/files`] });
                  }}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Main Editor Area */}
          <ResizablePanel defaultSize={60}>
            <div className="h-full flex flex-col">
              <ResizablePanelGroup direction="vertical">
                {/* Editor */}
                <ResizablePanel defaultSize={showTerminal ? 70 : 100}>
                  <MonacoEditor
                    file={selectedFile}
                    onFileChange={(updatedFile) => setSelectedFile(updatedFile)}
                  />
                </ResizablePanel>

                {showTerminal && <ResizableHandle />}

                {/* Terminal */}
                {showTerminal && (
                  <ResizablePanel defaultSize={30} minSize={20}>
                    <Terminal onClose={() => setShowTerminal(false)} />
                  </ResizablePanel>
                )}
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* AI Panel */}
          <ResizablePanel defaultSize={20} minSize={15}>
            <div className="h-full bg-slate-800 border-l border-slate-700 flex flex-col">
              {/* AI Code Editor */}
              <AICodeEditor
                file={selectedFile}
                selectedModel={selectedModel}
                projectId={selectedProject?.id || ""}
                onCodeUpdate={(newContent) => {
                  if (selectedFile) {
                    setSelectedFile({ ...selectedFile, content: newContent });
                  }
                }}
              />

              {/* Quick Actions */}
              <div className="border-t border-slate-700">
                <QuickActions
                  file={selectedFile}
                  selectedModel={selectedModel}
                  projectId={selectedProject?.id || ""}
                  onCodeUpdate={(newContent) => {
                    if (selectedFile) {
                      setSelectedFile({ ...selectedFile, content: newContent });
                    }
                  }}
                />
              </div>

              {/* AI Code Suggestions */}
              <div className="border-t border-slate-700">
                <AICodeSuggestions
                  file={selectedFile}
                  selectedModel={selectedModel}
                  projectId={selectedProject?.id || ""}
                  onCodeUpdate={(newContent) => {
                    if (selectedFile) {
                      setSelectedFile({ ...selectedFile, content: newContent });
                    }
                  }}
                />
              </div>
              
              {/* AI Chat */}
              <div className="flex-1 min-h-0 border-t border-slate-700">
                <AIChat
                  selectedModel={selectedModel}
                  selectedFile={selectedFile}
                  projectId={selectedProject?.id}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

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
