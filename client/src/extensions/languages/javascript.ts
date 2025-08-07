// JavaScript language extension for Supacoda
export function registerJavaScript(monaco: any) {
  if (!monaco?.languages?.getLanguages().some((l: any) => l.id === "javascript")) {
    monaco.languages.register({ id: "javascript", extensions: [".js"], aliases: ["JavaScript", "js"] });
    // Optionally: add tokens, completion, etc.
  }
  // Future: register LSP, linters, ML helpers, etc.
}
