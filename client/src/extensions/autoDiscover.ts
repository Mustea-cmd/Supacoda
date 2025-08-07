// Auto-discovery and self-updating logic for Supacoda extensions
// This can fetch new language/ML/NLP extensions from a remote registry or local config

import { extensions, activateAll, ExtensionDefinition } from "./index";
import { fetchRemoteExtensions } from "./remoteRegistry";

// Fallback: Simulated remote registry (for offline/dev)
const fallbackRegistry: ExtensionDefinition[] = [
  {
    id: "go",
    name: "Go Language Support",
    description: "Syntax and tools for Go.",
    activate: (monaco: any) => {
      if (!monaco.languages.getLanguages().some((l: any) => l.id === "go")) {
        monaco.languages.register({ id: "go", extensions: [".go"], aliases: ["Go", "golang"] });
      }
    },
  },
  // Add more fallback extensions here
];

export async function autoDiscoverAndInstall(monaco: any) {
  let remoteExtensions: ExtensionDefinition[] = [];
  try {
    remoteExtensions = await fetchRemoteExtensions();
  } catch (e) {
    console.warn('Remote registry unavailable, using fallback.');
    remoteExtensions = fallbackRegistry;
  }
  const newExtensions = remoteExtensions.filter(
    ext => !extensions.some(e => e.id === ext.id)
  );
  newExtensions.forEach(ext => {
    try {
      ext.activate(monaco);
      extensions.push(ext); // Add to local registry
      // Optionally: persist to localStorage or backend
    } catch (e) {
      console.error(`Failed to auto-install extension ${ext.id}:`, e);
    }
  });
  // Activate all (including new ones)
  activateAll(monaco);
}

// Future: poll for updates, self-debug, auto-update, etc.
