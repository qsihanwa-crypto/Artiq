import { createContext, useContext } from 'react';
import { site } from '../data/site';

const SettingsContext = createContext(site);

export function SettingsProvider({ children }) {
  const settings = {
    ...site,
    artist_name: site.artist_name || site.artistName,
    home_content: site.home_content || {},
  };

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
