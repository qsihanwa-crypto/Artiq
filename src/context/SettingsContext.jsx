import { createContext, useContext } from 'react';
import { site } from '../data/site';

const SettingsContext = createContext(site);

export function SettingsProvider({ children }) {
  return <SettingsContext.Provider value={site}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
