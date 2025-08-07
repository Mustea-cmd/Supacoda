// Shared types for user settings
export interface UserSettings {
  userId: string;
  editor: {
    theme: string;
    fontSize: number;
    tabSize: number;
  };
  ai: {
    defaultProvider: string;
    enabledProviders: string[];
    apiKeys: Record<string, string>;
  };
  ui: {
    sidebarPosition: string;
    compactMode: boolean;
  };
  advanced: {
    experimental: boolean;
  };
}
