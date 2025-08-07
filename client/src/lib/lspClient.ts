// Minimal LSP client for Monaco + Python (pyright) via WebSocket
// This is a scaffold for future full Monaco language client integration

export class PythonLSPClient {
  ws: WebSocket | null = null;
  onMessage: ((msg: any) => void) | null = null;

  connect() {
    this.ws = new WebSocket(`ws://${window.location.host}/lsp/python`);
    this.ws.onmessage = (event) => {
      if (this.onMessage) this.onMessage(event.data);
    };
    this.ws.onclose = () => {
      this.ws = null;
    };
  }

  send(msg: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  }

  close() {
    if (this.ws) this.ws.close();
  }
}
