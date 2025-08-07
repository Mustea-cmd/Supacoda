import React, { useEffect, useState, useRef } from "react";

interface GitStatusEntry {
  path: string;
  status: string;
}

const parseStatus = (status: string): GitStatusEntry[] => {
  return status
    .split("\n")
    .filter(Boolean)
    .map((line) => ({
      status: line.slice(0, 2).trim(),
      path: line.slice(3).trim(),
    }));
};

const SourceControlPanel: React.FC = () => {
  const [status, setStatus] = useState<GitStatusEntry[]>([]);
  const [history, setHistory] = useState<string>("");
  const [commitMsg, setCommitMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch status and history via REST
  const fetchStatus = async () => {
    const res = await fetch("/api/git/status");
    const data = await res.json();
    setStatus(parseStatus(data.status || ""));
  };
  const fetchHistory = async () => {
    const res = await fetch("/api/git/history");
    const data = await res.json();
    setHistory(data.log || "");
  };

  // WebSocket for real-time updates
  useEffect(() => {
    fetchStatus();
    fetchHistory();
    const ws = new window.WebSocket(`ws://${window.location.host}`);
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "git-status" }));
      ws.send(JSON.stringify({ type: "git-history" }));
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "git-status" && typeof data.status === "string") {
          setStatus(parseStatus(data.status));
        }
        if (data.type === "git-history" && typeof data.log === "string") {
          setHistory(data.log);
        }
      } catch {}
    };
    return () => ws.close();
  }, []);

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/git/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: commitMsg }),
    });
    setCommitMsg("");
    fetchStatus();
    fetchHistory();
    setLoading(false);
  };

  const handlePush = async () => {
    setLoading(true);
    await fetch("/api/git/push", { method: "POST" });
    setLoading(false);
  };

  const handlePull = async () => {
    setLoading(true);
    await fetch("/api/git/pull", { method: "POST" });
    setLoading(false);
  };

  const handleAdd = async (file: string) => {
    setLoading(true);
    await fetch("/api/git/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file }),
    });
    fetchStatus();
    setLoading(false);
  };

  const handleReset = async (file: string) => {
    setLoading(true);
    await fetch("/api/git/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file }),
    });
    fetchStatus();
    setLoading(false);
  };

  return (
    <div className="p-4 bg-slate-800 text-slate-100 h-full flex flex-col">
      <h2 className="text-lg font-bold mb-2">Source Control</h2>
      <div className="mb-4">
        <button onClick={fetchStatus} className="mr-2 px-2 py-1 bg-slate-700 rounded">Refresh</button>
        <button onClick={handlePush} className="mr-2 px-2 py-1 bg-blue-700 rounded">Push</button>
        <button onClick={handlePull} className="px-2 py-1 bg-green-700 rounded">Pull</button>
      </div>
      <form onSubmit={handleCommit} className="mb-4 flex gap-2">
        <input
          className="flex-1 px-2 py-1 rounded text-black"
          type="text"
          placeholder="Commit message"
          value={commitMsg}
          onChange={e => setCommitMsg(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="bg-purple-700 px-4 py-1 rounded text-white" disabled={loading || !commitMsg.trim()}>
          Commit
        </button>
      </form>
      <div className="mb-4">
        <h3 className="font-semibold mb-1">Changes</h3>
        {status.length === 0 && <div className="text-gray-400">No changes</div>}
        {status.map((entry, i) => (
          <div key={i} className="flex items-center justify-between border-b border-slate-700 py-1">
            <span className="font-mono text-xs">[{entry.status}] {entry.path}</span>
            <span>
              <button onClick={() => handleAdd(entry.path)} className="text-green-400 mr-2">Stage</button>
              <button onClick={() => handleReset(entry.path)} className="text-red-400">Unstage</button>
            </span>
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        <h3 className="font-semibold mb-1">History</h3>
        <pre className="text-xs bg-slate-900 p-2 rounded overflow-x-auto whitespace-pre-wrap">{history}</pre>
      </div>
    </div>
  );
};

export default SourceControlPanel;
