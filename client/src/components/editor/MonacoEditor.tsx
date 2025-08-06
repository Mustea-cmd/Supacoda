import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { File } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface MonacoEditorProps {
  file: File | null;
  onFileChange?: (file: File) => void;
}

export default function MonacoEditor({ file, onFileChange }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);
  const [monaco, setMonaco] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveFileMutation = useMutation({
    mutationFn: async (updatedFile: Partial<File>) => {
      if (!file?.id) throw new Error("No file selected");
      await apiRequest("PUT", `/api/files/${file.id}`, updatedFile);
    },
    onSuccess: () => {
      toast({
        title: "File saved",
        description: "Your changes have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", file?.projectId, "files"] });
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Initialize Monaco Editor
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js";
    script.onload = () => {
      (window as any).require.config({
        paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs" },
      });
      (window as any).require(["vs/editor/editor.main"], (monacoInstance: any) => {
        setMonaco(monacoInstance);
      });
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Create editor instance
  useEffect(() => {
    if (monaco && editorRef.current && !editor) {
      const editorInstance = monaco.editor.create(editorRef.current, {
        value: file?.content || "",
        language: getMonacoLanguage(file?.language),
        theme: "vs-dark",
        fontSize: 14,
        fontFamily: "JetBrains Mono, Fira Code, monospace",
        lineNumbers: "on",
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        wordWrap: "on",
      });

      // Auto-save on content change
      editorInstance.onDidChangeModelContent(() => {
        const content = editorInstance.getValue();
        if (file && content !== file.content) {
          const updatedFile = { ...file, content };
          onFileChange?.(updatedFile);
          
          // Debounced save
          clearTimeout((window as any).autoSaveTimeout);
          (window as any).autoSaveTimeout = setTimeout(() => {
            saveFileMutation.mutate({ content });
          }, 2000);
        }
      });

      setEditor(editorInstance);
    }
  }, [monaco, file, editor, onFileChange, saveFileMutation]);

  // Update editor content when file changes
  useEffect(() => {
    if (editor && file) {
      const currentValue = editor.getValue();
      if (currentValue !== file.content) {
        editor.setValue(file.content || "");
        const language = getMonacoLanguage(file.language);
        const model = editor.getModel();
        if (model && monaco) {
          monaco.editor.setModelLanguage(model, language);
        }
      }
    }
  }, [editor, file, monaco]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (editor) {
        editor.dispose();
      }
    };
  }, [editor]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (file) {
          const content = editor?.getValue();
          saveFileMutation.mutate({ content });
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor, file, saveFileMutation]);

  function getMonacoLanguage(language?: string | null): string {
    if (!language) return "plaintext";
    
    const languageMap: Record<string, string> = {
      javascript: "javascript",
      typescript: "typescript",
      python: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      csharp: "csharp",
      php: "php",
      ruby: "ruby",
      go: "go",
      rust: "rust",
      html: "html",
      css: "css",
      scss: "scss",
      json: "json",
      xml: "xml",
      yaml: "yaml",
      markdown: "markdown",
      sql: "sql",
      shell: "shell",
      bash: "shell",
      powershell: "powershell",
      dockerfile: "dockerfile",
      text: "plaintext",
    };

    return languageMap[language.toLowerCase()] || "plaintext";
  }

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900 text-slate-400">
        <div className="text-center">
          <i className="fas fa-file-code text-4xl mb-4"></i>
          <p className="text-lg">Select a file to start editing</p>
          <p className="text-sm mt-2">Choose a file from the explorer or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Editor Tabs */}
      <div className="flex bg-slate-800 border-b border-slate-700">
        <div className="flex items-center px-4 py-2 bg-slate-900 border-r border-slate-700 text-sm">
          <i className="fas fa-file-code text-blue-400 mr-2"></i>
          <span>{file.name}</span>
          {saveFileMutation.isPending && (
            <i className="fas fa-spinner fa-spin ml-2 text-yellow-500"></i>
          )}
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <div ref={editorRef} className="h-full w-full" />
      </div>
    </div>
  );
}
