  // Python LSP integration (diagnostics, completion, hover, signature help)
  const lspClientRef = useRef<any>(null);
  useEffect(() => {
    if (!file || file.language !== "python" || !monaco || !editor) return;
    // Connect to LSP
    lspClientRef.current = (window as any).PythonLSPClient ? new (window as any).PythonLSPClient() : null;
    if (!lspClientRef.current) return;
    lspClientRef.current.connect?.();
    lspClientRef.current.send?.({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        processId: null,
        rootUri: null,
        capabilities: {},
      },
    });
    lspClientRef.current.send?.({
      jsonrpc: "2.0",
      method: "textDocument/didOpen",
      params: {
        textDocument: {
          uri: `file:///${file.name}`,
          languageId: "python",
          version: 1,
          text: file.content || "",
        },
      },
    });

    // Register completion provider
    const completionProvider = monaco.languages.registerCompletionItemProvider("python", {
      triggerCharacters: [".", "(", "[", ",", " ", "=", ":"],
      provideCompletionItems: async (model: any, position: any) => {
        lspClientRef.current.send?.({
          jsonrpc: "2.0",
          id: 2,
          method: "textDocument/completion",
          params: {
            textDocument: { uri: `file:///${file.name}` },
            position: { line: position.lineNumber - 1, character: position.column - 1 },
            context: { triggerKind: 1 },
          },
        });
        return { suggestions: [] };
      },
    });

    // Register hover provider
    const hoverProvider = monaco.languages.registerHoverProvider("python", {
      provideHover: async (model: any, position: any) => {
        lspClientRef.current.send?.({
          jsonrpc: "2.0",
          id: 3,
          method: "textDocument/hover",
          params: {
            textDocument: { uri: `file:///${file.name}` },
            position: { line: position.lineNumber - 1, character: position.column - 1 },
          },
        });
        return null;
      },
    });

    // Register signature help provider
    const signatureProvider = monaco.languages.registerSignatureHelpProvider("python", {
      signatureHelpTriggerCharacters: ["(", ","],
      provideSignatureHelp: async (model: any, position: any) => {
        lspClientRef.current.send?.({
          jsonrpc: "2.0",
          id: 4,
          method: "textDocument/signatureHelp",
          params: {
            textDocument: { uri: `file:///${file.name}` },
            position: { line: position.lineNumber - 1, character: position.column - 1 },
          },
        });
        return null;
      },
    });

    lspClientRef.current.onMessage = (msg: any) => {
      let data = msg;
      if (typeof msg === "string") {
        try { data = JSON.parse(msg); } catch { return; }
      }
      // Diagnostics
      if (data.method === "textDocument/publishDiagnostics" && data.params) {
        const diagnostics = data.params.diagnostics || [];
        if (monaco && editor) {
          monaco.editor.setModelMarkers(
            editor.getModel(),
            "python-lsp",
            diagnostics.map((d: any) => ({
              startLineNumber: d.range.start.line + 1,
              endLineNumber: d.range.end.line + 1,
              startColumn: d.range.start.character + 1,
              endColumn: d.range.end.character + 1,
              message: d.message,
              severity: d.severity === 1 ? 8 : 4,
              source: d.source || "pyright",
            }))
          );
        }
        if (onLintMarkers) {
          onLintMarkers(
            diagnostics.map((d: any) => ({
              message: d.message,
              line: d.range.start.line + 1,
              column: d.range.start.character + 1,
              severity: d.severity === 1 ? "error" : "warning",
              source: d.source || "pyright",
            }))
          );
        }
      }
      // Completion response
      if (data.id === 2 && data.result) {
        const items = Array.isArray(data.result) ? data.result : data.result.items;
        if (items && monaco && editor) {
          const suggestions = items.map((item: any) => ({
            label: item.label,
            kind: monaco.languages.CompletionItemKind[item.kind] || monaco.languages.CompletionItemKind.Text,
            insertText: item.insertText || item.label,
            detail: item.detail,
            documentation: item.documentation?.value || item.documentation,
            range: editor.getModel().getWordUntilPosition(editor.getPosition()),
          }));
          // @ts-ignore
          monaco.languages.registerCompletionItemProvider("python", {
            provideCompletionItems: () => ({ suggestions }),
          });
        }
      }
      // Hover response
      if (data.id === 3 && data.result) {
        if (data.result.contents && monaco && editor) {
          // @ts-ignore
          monaco.languages.registerHoverProvider("python", {
            provideHover: () => ({
              contents: Array.isArray(data.result.contents)
                ? data.result.contents.map((c: any) => ({ value: c.value || c }))
                : [{ value: data.result.contents.value || data.result.contents }],
              range: editor.getModel().getWordAtPosition(editor.getPosition()),
            }),
          });
        }
      }
      // Signature help response
      if (data.id === 4 && data.result) {
        if (data.result.signatures && monaco && editor) {
          // @ts-ignore
          monaco.languages.registerSignatureHelpProvider("python", {
            provideSignatureHelp: () => ({
              signatures: data.result.signatures,
              activeSignature: data.result.activeSignature,
              activeParameter: data.result.activeParameter,
            }),
          });
        }
      }
    };
    return () => {
      lspClientRef.current?.close?.();
      completionProvider.dispose();
      hoverProvider.dispose();
      signatureProvider.dispose();
    };
  }, [file, monaco, editor, onLintMarkers]);
  // Python LSP client (scaffold)
  // Only declare lspClientRef once at the top of the component
  // ...existing code...
  useEffect(() => {
    // All variables are in component scope
    // file, monaco, editor, onLintMarkers are props or from hooks
    if (!file || file.language !== "python" || !monaco || !editor) return;

    lspClientRef.current = new PythonLSPClient();
    lspClientRef.current.connect();
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
    lspClientRef.current.send({
  // LSP logic will be handled inside the MonacoEditor function
        textDocument: {
          uri: `file:///${file.name}`,
          languageId: "python",
          version: 1,
          text: file.content || "",
        },
      },
    });

    const completionProvider = monaco.languages.registerCompletionItemProvider("python", {
      triggerCharacters: [".", "(", "[", ",", " ", "=", ":"],
      provideCompletionItems: async (model: any, position: any) => {
        const params = {
          textDocument: { uri: `file:///${file.name}` },
          position: { line: position.lineNumber - 1, character: position.column - 1 },
          context: { triggerKind: 1 },
        };
        lspClientRef.current?.send({
          jsonrpc: "2.0",
          id: 2,
          method: "textDocument/completion",
          params,
        });
        return { suggestions: [] };
      },
    });

    const hoverProvider = monaco.languages.registerHoverProvider("python", {
      provideHover: async (model: any, position: any) => {
        lspClientRef.current?.send({
          jsonrpc: "2.0",
          id: 3,
          method: "textDocument/hover",
          params: {
            textDocument: { uri: `file:///${file.name}` },
            position: { line: position.lineNumber - 1, character: position.column - 1 },
          },
        });
        return null;
      },
    });

    const signatureProvider = monaco.languages.registerSignatureHelpProvider("python", {
      signatureHelpTriggerCharacters: ["(", ","],
      provideSignatureHelp: async (model: any, position: any) => {
        lspClientRef.current?.send({
          jsonrpc: "2.0",
          id: 4,
          method: "textDocument/signatureHelp",
          params: {
            textDocument: { uri: `file:///${file.name}` },
            position: { line: position.lineNumber - 1, character: position.column - 1 },
          },
        });
        return null;
      },
    });

    lspClientRef.current.onMessage = (msg) => {
      let data = msg;
      if (typeof msg === "string") {
        try { data = JSON.parse(msg); } catch { return; }
      }
      // Diagnostics
      if (data.method === "textDocument/publishDiagnostics" && data.params) {
        const diagnostics = data.params.diagnostics || [];
        if (monaco && editor) {
          monaco.editor.setModelMarkers(
            editor.getModel(),
            "python-lsp",
            diagnostics.map((d: any) => ({
              startLineNumber: d.range.start.line + 1,
              endLineNumber: d.range.end.line + 1,
              startColumn: d.range.start.character + 1,
              endColumn: d.range.end.character + 1,
              message: d.message,
              severity: d.severity === 1 ? 8 : 4,
              source: d.source || "pyright",
            }))
          );
        }
        if (onLintMarkers) {
          onLintMarkers(
            diagnostics.map((d: any) => ({
              message: d.message,
              line: d.range.start.line + 1,
              column: d.range.start.character + 1,
              severity: d.severity === 1 ? "error" : "warning",
              source: d.source || "pyright",
            }))
          );
        }
      }
      // Completion response
      if (data.id === 2 && data.result) {
        const items = Array.isArray(data.result) ? data.result : data.result.items;
        if (items && monaco && editor) {
          const suggestions = items.map((item: any) => ({
            label: item.label,
            kind: monaco.languages.CompletionItemKind[item.kind] || monaco.languages.CompletionItemKind.Text,
            insertText: item.insertText || item.label,
            detail: item.detail,
            documentation: item.documentation?.value || item.documentation,
            range: editor.getModel().getWordUntilPosition(editor.getPosition()),
          }));
          // @ts-ignore
          monaco.languages.registerCompletionItemProvider("python", {
            provideCompletionItems: () => ({ suggestions }),
          });
        }
      }
      // Hover response
      if (data.id === 3 && data.result) {
        if (data.result.contents && monaco && editor) {
          // @ts-ignore
          monaco.languages.registerHoverProvider("python", {
            provideHover: () => ({
              contents: Array.isArray(data.result.contents)
                ? data.result.contents.map((c: any) => ({ value: c.value || c }))
                : [{ value: data.result.contents.value || data.result.contents }],
              range: editor.getModel().getWordAtPosition(editor.getPosition()),
            }),
          });
        }
      }
      // Signature help response
      if (data.id === 4 && data.result) {
        if (data.result.signatures && monaco && editor) {
          // @ts-ignore
          monaco.languages.registerSignatureHelpProvider("python", {
            provideSignatureHelp: () => ({
              signatures: data.result.signatures,
              activeSignature: data.result.activeSignature,
              activeParameter: data.result.activeParameter,
            }),
          });
        }
      }
    };
    return () => {
      lspClientRef.current?.close();
      completionProvider.dispose();
      hoverProvider.dispose();
      signatureProvider.dispose();
    };
  }, [file, monaco, editor, onLintMarkers]);
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
  // ...existing hooks and state...
  const lspClientRef = useRef<any>(null);

  // Place LSP useEffect after monaco/editor are defined
  useEffect(() => {
    if (!file || file.language !== "python" || !monaco || !editor) return;
    lspClientRef.current = (window as any).PythonLSPClient ? new (window as any).PythonLSPClient() : null;
    if (!lspClientRef.current) return;
    lspClientRef.current.connect?.();
    lspClientRef.current.send?.({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        processId: null,
        rootUri: null,
        capabilities: {},
      },
    });
    lspClientRef.current.send?.({
      jsonrpc: "2.0",
      method: "textDocument/didOpen",
      params: {
        textDocument: {
          uri: `file:///${file.name}`,
          languageId: "python",
          version: 1,
          text: file.content || "",
        },
      },
    });

    const completionProvider = monaco.languages.registerCompletionItemProvider("python", {
      triggerCharacters: [".", "(", "[", ",", " ", "=", ":"],
      provideCompletionItems: async (model: any, position: any) => {
        lspClientRef.current.send?.({
          jsonrpc: "2.0",
          id: 2,
          method: "textDocument/completion",
          params: {
            textDocument: { uri: `file:///${file.name}` },
            position: { line: position.lineNumber - 1, character: position.column - 1 },
            context: { triggerKind: 1 },
          },
        });
        return { suggestions: [] };
      },
    });

    const hoverProvider = monaco.languages.registerHoverProvider("python", {
      provideHover: async (model: any, position: any) => {
        lspClientRef.current.send?.({
          jsonrpc: "2.0",
          id: 3,
          method: "textDocument/hover",
          params: {
            textDocument: { uri: `file:///${file.name}` },
            position: { line: position.lineNumber - 1, character: position.column - 1 },
          },
        });
        return null;
      },
    });

    const signatureProvider = monaco.languages.registerSignatureHelpProvider("python", {
      signatureHelpTriggerCharacters: ["(", ","],
      provideSignatureHelp: async (model: any, position: any) => {
        lspClientRef.current.send?.({
          jsonrpc: "2.0",
          id: 4,
          method: "textDocument/signatureHelp",
          params: {
            textDocument: { uri: `file:///${file.name}` },
            position: { line: position.lineNumber - 1, character: position.column - 1 },
          },
        });
        return null;
      },
    });

    lspClientRef.current.onMessage = (msg: any) => {
      let data = msg;
      if (typeof msg === "string") {
        try { data = JSON.parse(msg); } catch { return; }
      }
      // Diagnostics
      if (data.method === "textDocument/publishDiagnostics" && data.params) {
        const diagnostics = data.params.diagnostics || [];
        if (monaco && editor) {
          monaco.editor.setModelMarkers(
            editor.getModel(),
            "python-lsp",
            diagnostics.map((d: any) => ({
              startLineNumber: d.range.start.line + 1,
              endLineNumber: d.range.end.line + 1,
              startColumn: d.range.start.character + 1,
              endColumn: d.range.end.character + 1,
              message: d.message,
              severity: d.severity === 1 ? 8 : 4,
              source: d.source || "pyright",
            }))
          );
        }
        if (onLintMarkers) {
          onLintMarkers(
            diagnostics.map((d: any) => ({
              message: d.message,
              line: d.range.start.line + 1,
              column: d.range.start.character + 1,
              severity: d.severity === 1 ? "error" : "warning",
              source: d.source || "pyright",
            }))
          );
        }
      }
      // Completion response
      if (data.id === 2 && data.result) {
        const items = Array.isArray(data.result) ? data.result : data.result.items;
        if (items && monaco && editor) {
          const suggestions = items.map((item: any) => ({
            label: item.label,
            kind: monaco.languages.CompletionItemKind[item.kind] || monaco.languages.CompletionItemKind.Text,
            insertText: item.insertText || item.label,
            detail: item.detail,
            documentation: item.documentation?.value || item.documentation,
            range: editor.getModel().getWordUntilPosition(editor.getPosition()),
          }));
          // @ts-ignore
          monaco.languages.registerCompletionItemProvider("python", {
            provideCompletionItems: () => ({ suggestions }),
          });
        }
      }
      // Hover response
      if (data.id === 3 && data.result) {
        if (data.result.contents && monaco && editor) {
          // @ts-ignore
          monaco.languages.registerHoverProvider("python", {
            provideHover: () => ({
              contents: Array.isArray(data.result.contents)
                ? data.result.contents.map((c: any) => ({ value: c.value || c }))
                : [{ value: data.result.contents.value || data.result.contents }],
              range: editor.getModel().getWordAtPosition(editor.getPosition()),
            }),
          });
        }
      }
      // Signature help response
      if (data.id === 4 && data.result) {
        if (data.result.signatures && monaco && editor) {
          // @ts-ignore
          monaco.languages.registerSignatureHelpProvider("python", {
            provideSignatureHelp: () => ({
              signatures: data.result.signatures,
              activeSignature: data.result.activeSignature,
              activeParameter: data.result.activeParameter,
            }),
          });
        }
      }
    };
    return () => {
      lspClientRef.current?.close?.();
      completionProvider.dispose();
      hoverProvider.dispose();
      signatureProvider.dispose();
    };
  }, [file, monaco, editor, onLintMarkers]);
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
