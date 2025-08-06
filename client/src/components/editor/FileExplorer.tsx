import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { File, Project } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { FileIcon, FolderIcon, Plus, RefreshCw } from "lucide-react";

interface FileExplorerProps {
  project: Project | null;
  files: File[];
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  loading: boolean;
}

export default function FileExplorer({ project, files, selectedFile, onFileSelect, loading }: FileExplorerProps) {
  const [newFileName, setNewFileName] = useState("");
  const [newFileLanguage, setNewFileLanguage] = useState("javascript");
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createFileMutation = useMutation({
    mutationFn: async (fileData: { name: string; language: string; path: string; content: string; projectId: string }) => {
      const response = await apiRequest("POST", "/api/files", fileData);
      return response.json();
    },
    onSuccess: (newFile) => {
      toast({
        title: "File created",
        description: `${newFile.name} has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project?.id, "files"] });
      setShowNewFileDialog(false);
      setNewFileName("");
      onFileSelect(newFile);
    },
    onError: (error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await apiRequest("DELETE", `/api/files/${fileId}`);
    },
    onSuccess: () => {
      toast({
        title: "File deleted",
        description: "File has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project?.id, "files"] });
    },
    onError: (error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateFile = () => {
    if (!project || !newFileName.trim()) return;

    const path = `/${newFileName}`;
    const content = getDefaultContent(newFileLanguage);

    createFileMutation.mutate({
      name: newFileName,
      language: newFileLanguage,
      path,
      content,
      projectId: project.id,
    });
  };

  const handleDeleteFile = (file: File, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${file.name}?`)) {
      deleteFileMutation.mutate(file.id);
    }
  };

  const getFileIcon = (language?: string | null) => {
    if (!language) return "text-slate-400";
    
    const iconMap: Record<string, string> = {
      javascript: "text-yellow-500",
      typescript: "text-blue-500",
      python: "text-green-500",
      java: "text-red-500",
      html: "text-orange-500",
      css: "text-purple-500",
      json: "text-yellow-600",
      markdown: "text-blue-400",
      text: "text-slate-400",
    };

    return iconMap[language.toLowerCase()] || "text-slate-400";
  };

  const getDefaultContent = (language: string): string => {
    const templates: Record<string, string> = {
      javascript: "// Welcome to your new JavaScript file\nconsole.log('Hello, World!');\n",
      typescript: "// Welcome to your new TypeScript file\nconsole.log('Hello, World!');\n",
      python: "# Welcome to your new Python file\nprint('Hello, World!')\n",
      java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}\n",
      html: "<!DOCTYPE html>\n<html>\n<head>\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>\n",
      css: "/* Your CSS styles here */\nbody {\n    font-family: Arial, sans-serif;\n}\n",
      markdown: "# Hello, World!\n\nWelcome to your new markdown file.\n",
    };

    return templates[language] || "";
  };

  if (loading) {
    return (
      <div className="p-3">
        <div className="flex items-center mb-4">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm">Loading files...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Explorer</h3>
        <div className="flex space-x-1">
          <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-white">
                <Plus className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create New File</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300">File Name</label>
                  <Input
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="app.js"
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300">Language</label>
                  <Select value={newFileLanguage} onValueChange={setNewFileLanguage}>
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="css">CSS</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="text">Plain Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCreateFile}
                    disabled={!newFileName.trim() || createFileMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createFileMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewFileDialog(false)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/projects", project?.id, "files"] })}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {project && (
        <div className="text-sm space-y-1">
          <div className="flex items-center p-1 rounded cursor-pointer">
            <FolderIcon className="h-4 w-4 text-yellow-500 mr-2" />
            <span>{project.name}</span>
          </div>
          
          <div className="ml-4 space-y-1">
            {files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center justify-between p-1 rounded cursor-pointer group ${
                  selectedFile?.id === file.id ? "bg-blue-600 text-white" : "hover:bg-slate-700"
                }`}
                onClick={() => onFileSelect(file)}
              >
                <div className="flex items-center">
                  <FileIcon className={`h-4 w-4 mr-2 ${getFileIcon(file.language)}`} />
                  <span>{file.name}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteFile(file, e)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs p-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!project && (
        <div className="text-center text-slate-400 py-8">
          <FolderIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">No project selected</p>
        </div>
      )}
    </div>
  );
}
