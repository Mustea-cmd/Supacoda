import { WebSocketServer, WebSocket } from 'ws';
import { exec } from 'child_process';

export function setupGitWebSocket(server: any) {
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
      if (data.type === 'git-status') {
        exec('git status --porcelain', { cwd: process.cwd() }, (err, stdout, stderr) => {
          if (err) {
            ws.send(JSON.stringify({ type: 'git-status', error: stderr || err.message }));
          } else {
            ws.send(JSON.stringify({ type: 'git-status', status: stdout }));
          }
        });
      }
      if (data.type === 'git-history') {
        exec('git log --oneline --decorate --graph -n 50', { cwd: process.cwd() }, (err, stdout, stderr) => {
          if (err) {
            ws.send(JSON.stringify({ type: 'git-history', error: stderr || err.message }));
          } else {
            ws.send(JSON.stringify({ type: 'git-history', log: stdout }));
          }
        });
      }
    });
  });
}
