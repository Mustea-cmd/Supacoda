
import { WebSocketServer, WebSocket } from 'ws';
import fs from 'fs';
import path from 'path';


// Helper: Recursively search files for a query string
type SearchResult = { file: string; line: number; preview: string };
function searchFiles(
  dir: string,
  query: string,
  results: SearchResult[],
  root: string
) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchFiles(fullPath, query, results, root);
    } else if (stat.isFile()) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            file: path.relative(root, fullPath),
            line: idx + 1,
            preview: line.trim(),
          });
        }
      });
    }
  }
}


export function setupSearchWebSocket(server: any) {
  const wss = new WebSocketServer({ server });
  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: Buffer | ArrayBuffer | Buffer[] | string) => {
      let data: any;
      let msgStr: string;
      if (typeof message === 'string') {
        msgStr = message;
      } else if (message instanceof Buffer) {
        msgStr = message.toString('utf8');
      } else if (message instanceof ArrayBuffer) {
        msgStr = Buffer.from(message).toString('utf8');
      } else if (Array.isArray(message)) {
        msgStr = Buffer.concat(message as Buffer[]).toString('utf8');
      } else {
        ws.send(JSON.stringify({ error: 'Invalid message type' }));
        return;
      }
      try {
        data = JSON.parse(msgStr);
      } catch {
        ws.send(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }
      if (data.type === 'search' && typeof data.query === 'string') {
        const results: SearchResult[] = [];
        // You may want to restrict the root for security
        const root = path.resolve(process.cwd(), 'client/src');
        searchFiles(root, data.query, results, root);
        ws.send(JSON.stringify({ type: 'results', results }));
      }
    });
  });
}
