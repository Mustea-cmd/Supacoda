  // Python LSP client (scaffold)
  const lspClientRef = useRef<PythonLSPClient | null>(null);
  useEffect(() => {
    if (file?.language === "python") {
      lspClientRef.current = new PythonLSPClient();
      lspClientRef.current.connect();
      // Example: send initialize message (LSP spec)
      lspClientRef.current.send({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          processId: null,
          rootUri: null,
          capabilities: {},
        },
      });
      // Listen for messages (future: diagnostics, hover, etc.)
      lspClientRef.current.onMessage = (msg) => {
        // TODO: handle LSP messages and update Monaco as needed
        // console.log("LSP message", msg);
      };
      return () => lspClientRef.current?.close();
    }
  }, [file?.language]);
import { PythonLSPClient } from "@/lib/lspClient";
  // Python LSP client (scaffold)
  const lspClientRef = useRef<PythonLSPClient | null>(null);
  useEffect(() => {
    if (file?.language === "python") {
      lspClientRef.current = new PythonLSPClient();
      lspClientRef.current.connect();
      // Example: send initialize message (LSP spec)
      lspClientRef.current.send({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          processId: null,
          rootUri: null,
          capabilities: {},
        },
      });
      // Listen for messages (future: diagnostics, hover, etc.)
      lspClientRef.current.onMessage = (msg) => {
        // TODO: handle LSP messages and update Monaco as needed
        // console.log("LSP message", msg);
      };
      return () => lspClientRef.current?.close();
    }
  }, [file?.language]);
import { useEffect, useRef, useState } from "react";
import { defaultLintConfig } from "@/lib/lintConfig";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { File } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface MonacoEditorProps {
  file: File | null;
  onFileChange?: (file: File) => void;
  onLintMarkers?: (markers: any[]) => void;
}

export default function MonacoEditor({ file, onFileChange, onLintMarkers }: MonacoEditorProps) {
  // Linting and formatting state
  const [lintMarkers, setLintMarkers] = useState<any[]>([]);
  const [lintEnabled, setLintEnabled] = useState(() => {
    const v = localStorage.getItem("supacoda_linting");
    return v === null ? true : v === "true";
  });
  const [formatEnabled, setFormatEnabled] = useState(() => {
    const v = localStorage.getItem("supacoda_formatting");
    return v === null ? true : v === "true";
  });

  // Lint worker
  const lintWorkerRef = useRef<Worker | null>(null);
  useEffect(() => {
    if (lintEnabled && typeof window !== "undefined") {
      lintWorkerRef.current = new Worker(new URL("@/lib/lintWorker.ts", import.meta.url), { type: "module" });
      return () => lintWorkerRef.current?.terminate();
    }
  }, [lintEnabled]);

  // Prettier worker
  const prettierWorkerRef = useRef<Worker | null>(null);
  useEffect(() => {
    if (formatEnabled && typeof window !== "undefined") {
      prettierWorkerRef.current = new Worker(new URL("@/lib/prettierWorker.ts", import.meta.url), { type: "module" });
      return () => prettierWorkerRef.current?.terminate();
    }
  }, [formatEnabled]);
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
      (window as any).require([
        "vs/editor/editor.main",
        "vs/language/json/monaco.contribution",
        "vs/language/yaml/monaco.contribution",
        "vs/basic-languages/python/python.contribution",
        "vs/basic-languages/markdown/markdown.contribution"
      ], (monacoInstance: any) => {
        // Register additional languages if needed
        if (monacoInstance.languages && monacoInstance.languages.register) {
          // Python
          monacoInstance.languages.register({ id: "python", extensions: [".py"], aliases: ["Python", "py"] });
          // Markdown
          monacoInstance.languages.register({ id: "markdown", extensions: [".md"], aliases: ["Markdown", "md"] });
          // YAML
          monacoInstance.languages.register({ id: "yaml", extensions: [".yaml", ".yml"], aliases: ["YAML", "yaml"] });
        }
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

      // Auto-save and lint on content change
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
        // Linting
        if (lintEnabled && lintWorkerRef.current && file?.language === "javascript") {
          lintWorkerRef.current.onmessage = (e) => {
            const messages = e.data;
            setLintMarkers(messages);
            if (onLintMarkers) onLintMarkers(messages.map((msg: any) => ({
              message: msg.message,
              line: msg.line || 1,
              column: msg.column || 1,
              severity: msg.severity === 2 || msg.fatal ? "error" : "warning",
              source: "ESLint",
            })));
            if (monaco && editorInstance) {
              monaco.editor.setModelMarkers(
                editorInstance.getModel(),
                "eslint",
                messages.map((msg: any) => ({
                  startLineNumber: msg.line || 1,
                  endLineNumber: msg.line || 1,
                  startColumn: msg.column || 1,
                  endColumn: (msg.column || 1) + 1,
                  message: msg.message,
                  severity: msg.severity === 2 || msg.fatal ? 8 : 4, // 8=Error, 4=Warning
                  source: "ESLint",
                }))
              );
            }
          };
          lintWorkerRef.current.postMessage({ code: content, config: defaultLintConfig });
        }
      });

  // Format code with Prettier
  const handleFormat = () => {
    if (!editor || !prettierWorkerRef.current) return;
    const code = editor.getValue();
    prettierWorkerRef.current.onmessage = (e) => {
      const { formatted, error } = e.data;
      if (!error && formatted && formatted !== code) {
        editor.setValue(formatted);
      }
    };
    prettierWorkerRef.current.postMessage({ code, options: { parser: "babel", semi: true, singleQuote: false } });
  };

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
      <div className="flex bg-slate-800 border-b border-slate-700 items-center">
        <div className="flex items-center px-4 py-2 bg-slate-900 border-r border-slate-700 text-sm">
          <i className="fas fa-file-code text-blue-400 mr-2"></i>
          <span>{file.name}</span>
          {saveFileMutation.isPending && (
            <i className="fas fa-spinner fa-spin ml-2 text-yellow-500"></i>
          )}
        </div>
        {/* Lint/Format toggles and Format button */}
        <div className="ml-4 flex items-center space-x-2">
          <label className="flex items-center text-xs">
            <input type="checkbox" checked={lintEnabled} onChange={e => setLintEnabled(e.target.checked)} className="mr-1" />
            Lint
          </label>
          <label className="flex items-center text-xs">
            <input type="checkbox" checked={formatEnabled} onChange={e => setFormatEnabled(e.target.checked)} className="mr-1" />
            Format
          </label>
          <button onClick={handleFormat} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Format</button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <div ref={editorRef} className="h-full w-full" />
      </div>
    </div>
  );
}
