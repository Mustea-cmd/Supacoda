import React, { useState, useEffect } from "react";
import axios from "axios";

const defaultSettings = {
  editor: {
    theme: "light",
    fontSize: 14,
    tabSize: 2,
    linting: true,
    formatting: true,
  },
  ai: {
    defaultProvider: "gemini",
    enabledProviders: ["gemini", "supaai", "amazonq", "copilot", "deepseek", "llama"],
    apiKeys: {
      gemini: "",
      supaai: "",
      amazonq: "",
      copilot: "",
      deepseek: "",
      llama: "",
    },
  },
  ui: {
    sidebarPosition: "left",
    compactMode: false,
  },
  advanced: {
    experimental: false,
  },
};

const SETTINGS_KEY = "supacoda_settings";
const API_URL = "/api/settings";

async function loadSettingsFromAPI() {
  try {
    const res = await axios.get(API_URL);
    if (res.data) return res.data;
    return null;
  } catch {
    return null;
  }
}

function loadSettingsFromLocal() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

async function saveSettingsToAPI(settings: any) {
  try {
    await axios.post(API_URL, settings);
  } catch {
    // ignore
  }
}

function saveSettingsToLocal(settings: any) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}


export default function SettingsPanel() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from API, fallback to localStorage
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      let loaded = await loadSettingsFromAPI();
      if (!loaded) loaded = loadSettingsFromLocal();
      if (mounted) {
        setSettings(loaded || defaultSettings);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Save settings to API and localStorage on change
  useEffect(() => {
    if (!loading) {
      saveSettingsToAPI(settings);
      saveSettingsToLocal(settings);
    }
  }, [settings, loading]);

  // Handlers for each section
  const handleEditorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" && "checked" in e.target ? (e.target as HTMLInputElement).checked : undefined;
    setSettings((prev: any) => ({
      ...prev,
      editor: {
        ...prev.editor,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
    // Sync lint/format toggles to localStorage for MonacoEditor
    if (name === "linting") localStorage.setItem("supacoda_linting", String(checked));
    if (name === "formatting") localStorage.setItem("supacoda_formatting", String(checked));
  };

  const handleAIChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings((prev: any) => ({
      ...prev,
      ai: {
        ...prev.ai,
        [name]: value,
      },
    }));
  };

  const handleUIChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" && "checked" in e.target ? (e.target as HTMLInputElement).checked : undefined;
    setSettings((prev: any) => ({
      ...prev,
      ui: {
        ...prev.ui,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleAdvancedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings((prev: any) => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        [name]: checked,
      },
    }));
  };

  const handleReset = () => {
    setSettings(defaultSettings);
  };

  if (loading) {
    return <div className="p-4">Loading settings...</div>;
  }
  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold mb-2">Settings</h2>
      {/* Editor Settings */}
      <section>
        <h3 className="font-semibold mb-1">Editor</h3>
        <label className="block mb-1">
          Theme:
          <select name="theme" value={settings.editor.theme} onChange={handleEditorChange} className="ml-2">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className="block mb-1">
          Font Size:
          <input type="number" name="fontSize" value={settings.editor.fontSize} min={10} max={32} onChange={handleEditorChange} className="ml-2 w-16" />
        </label>
        <label className="block mb-1">
          Tab Size:
          <input type="number" name="tabSize" value={settings.editor.tabSize} min={2} max={8} onChange={handleEditorChange} className="ml-2 w-16" />
        </label>
        <label className="block mb-1">
          <input type="checkbox" name="linting" checked={settings.editor.linting} onChange={handleEditorChange} className="mr-2" />
          Enable Linting
        </label>
        <label className="block mb-1">
          <input type="checkbox" name="formatting" checked={settings.editor.formatting} onChange={handleEditorChange} className="mr-2" />
          Enable Formatting
        </label>
      </section>
      {/* AI Settings */}
      <section>
        <h3 className="font-semibold mb-1">AI</h3>
        <label className="block mb-1">
          Default Provider:
          <select name="defaultProvider" value={settings.ai.defaultProvider} onChange={handleAIChange} className="ml-2">
            <option value="gemini">Gemini</option>
            <option value="supaai">SupaAI</option>
            <option value="amazonq">Amazon Q</option>
            <option value="copilot">Copilot</option>
            <option value="deepseek">DeepSeek</option>
            <option value="llama">Llama 3.3</option>
          </select>
        </label>
        {/* API Keys (hidden by default, can be expanded in future) */}
      </section>
      {/* UI Settings */}
      <section>
        <h3 className="font-semibold mb-1">UI</h3>
        <label className="block mb-1">
          Sidebar Position:
          <select name="sidebarPosition" value={settings.ui.sidebarPosition} onChange={handleUIChange} className="ml-2">
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </label>
        <label className="block mb-1">
          <input type="checkbox" name="compactMode" checked={settings.ui.compactMode} onChange={handleUIChange} className="mr-2" />
          Compact Mode
        </label>
      </section>
      {/* Advanced Settings */}
      <section>
        <h3 className="font-semibold mb-1">Advanced</h3>
        <label className="block mb-1">
          <input type="checkbox" name="experimental" checked={settings.advanced.experimental} onChange={handleAdvancedChange} className="mr-2" />
          Enable Experimental Features
        </label>
        <button onClick={handleReset} className="mt-2 px-3 py-1 bg-red-500 text-white rounded">Reset to Defaults</button>
      </section>
    </div>
  );
}
