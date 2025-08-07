// LSP Proxy Service for Python (pyright or pylsp)
import { spawn } from "child_process";
import WebSocket from "ws";

// This is a minimal LSP proxy for demo purposes
// In production, use a robust LSP proxy or language server manager

export function startPythonLSP(ws: WebSocket) {
  // Start the language server process (pyright-langserver or pylsp)
  const lsp = spawn("pyright-langserver", ["--stdio"]);

  ws.on("message", (msg) => {
    lsp.stdin.write(msg);
  });

  lsp.stdout.on("data", (data) => {
    ws.send(data);
  });

  lsp.stderr.on("data", (data) => {
    ws.send(JSON.stringify({ type: "lsp-error", data: data.toString() }));
  });

  lsp.on("exit", (code) => {
    ws.close();
  });

  ws.on("close", () => {
    lsp.kill();
  });
}
