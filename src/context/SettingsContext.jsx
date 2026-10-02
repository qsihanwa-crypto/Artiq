import { createContext, useContext, useEffect, useState } from 'react';
import { apiGet } from '../api/client';
import { site } from '../data/site';

const SettingsContext = createContext(site);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    ...site,
    artist_name: site.artist_name || site.artistName,
    home_content: site.home_content || {},
  });

  useEffect(() => {
    let active = true;
    apiGet('/settings')
      .then((remote) => {
        if (!active) return;
        setSettings((current) => ({
          ...current,
          ...remote,
          artistName: remote.artist_name || current.artistName,
          shortName: remote.short_name || current.shortName,
          home_content: remote.home_content || current.home_content,
        }));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
