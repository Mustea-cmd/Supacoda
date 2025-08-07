// remoteRegistry.ts
// Handles fetching and updating extensions from a remote registry

import { ExtensionDefinition } from './index';

const REMOTE_REGISTRY_URL = 'https://supacoda-registry.example.com/extensions.json';

export async function fetchRemoteExtensions(): Promise<ExtensionDefinition[]> {
  try {
    const res = await fetch(REMOTE_REGISTRY_URL);
    if (!res.ok) throw new Error('Failed to fetch remote extensions');
    return await res.json();
  } catch (e) {
    console.error('Remote registry fetch failed:', e);
    return [];
  }
}

export async function updateLocalExtensions(
  localExtensions: ExtensionDefinition[],
  onNewExtension: (ext: ExtensionDefinition) => void
) {
  const remote = await fetchRemoteExtensions();
  for (const ext of remote) {
    if (!localExtensions.some(e => e.id === ext.id)) {
      onNewExtension(ext);
    }
  }
}
