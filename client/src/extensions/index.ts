// Central extension registry for Supacoda IDE
// Add language, ML, NLP, and smart extensions here

// Example extension interface
export type ExtensionDefinition = {
  id: string;
  name: string;
  description: string;
  activate: (monaco: any) => void;
  // Optionally: deactivate, update, healthCheck, etc.
};

// Built-in language extensions
import { registerPython } from "./languages/python";
import { registerJavaScript } from "./languages/javascript";
// ...import more as you add them

// ML/NLP helpers (future)
// import { registerML } from "./ml/ml";
// import { registerNLP } from "./ml/nlp";

export const extensions: ExtensionDefinition[] = [
  {
    id: "python",
    name: "Python Language Support",
    description: "Syntax, LSP, linting, and tools for Python.",
    activate: registerPython,
  },
  {
    id: "javascript",
    name: "JavaScript Language Support",
    description: "Syntax, LSP, linting, and tools for JavaScript.",
    activate: registerJavaScript,
  },
  // Add more extensions here
];

// Extension manager API
export function activateAll(monaco: any) {
  extensions.forEach(ext => {
    try {
      ext.activate(monaco);
    } catch (e) {
      // Optionally: log, self-debug, or mark as unhealthy
      console.error(`Extension ${ext.id} failed to activate:`, e);
    }
  });
}

// Future: add deactivateAll, updateAll, healthCheckAll, etc.
