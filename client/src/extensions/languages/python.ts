// Python language extension for Supacoda
export function registerPython(monaco: any) {
  if (!monaco?.languages?.getLanguages().some((l: any) => l.id === "python")) {
    monaco.languages.register({ id: "python", extensions: [".py"], aliases: ["Python", "py"] });
    // Optionally: add tokens, completion, etc.
  }
  // Future: register LSP, linters, ML helpers, etc.
}
