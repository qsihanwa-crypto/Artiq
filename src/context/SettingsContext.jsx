import { createContext, useContext, useEffect, useState } from 'react';
import { apiGet } from '../api/client';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    apiGet('/settings').then(setSettings).catch(() => setSettings({}));
  }, []);

  if (!settings) return null; // or a loading skeleton
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);