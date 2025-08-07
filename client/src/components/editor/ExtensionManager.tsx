import { useState } from "react";
import { extensions, ExtensionDefinition } from "@/extensions";

export default function ExtensionManager() {
  // In a real app, fetch remote extensions and health info here
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    extensions.forEach(ext => { state[ext.id] = true; });
    return state;
  });

  const handleToggle = (id: string) => {
    setEnabled(e => ({ ...e, [id]: !e[id] }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Extension Manager</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="border-b p-2">Name</th>
            <th className="border-b p-2">Description</th>
            <th className="border-b p-2">Status</th>
            <th className="border-b p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {extensions.map(ext => (
            <tr key={ext.id}>
              <td className="border-b p-2 font-medium">{ext.name}</td>
              <td className="border-b p-2">{ext.description}</td>
              <td className="border-b p-2">
                {enabled[ext.id] ? (
                  <span className="text-green-600">Enabled</span>
                ) : (
                  <span className="text-gray-400">Disabled</span>
                )}
              </td>
              <td className="border-b p-2">
                <button
                  className={`px-2 py-1 rounded text-xs ${enabled[ext.id] ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}
                  onClick={() => handleToggle(ext.id)}
                >
                  {enabled[ext.id] ? "Disable" : "Enable"}
                </button>
                {/* Future: Update, Uninstall, Details, Health */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6 text-sm text-gray-500">
        <p>Remote registry, update, uninstall, and health checks coming soon.</p>
      </div>
    </div>
  );
}
