import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULTS = {
  mode: 'light',
  accentColor: '#e36397',
  font: 'outfit',
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('sewing-box-settings');
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('sewing-box-settings', JSON.stringify(settings));
  }, [settings]);

  const update = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  return (
    <SettingsContext.Provider value={{ settings, update }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);

export const getFontFamily = (font) => {
  switch (font) {
    case 'simple':    return "'Nunito', 'Segoe UI', Arial, sans-serif";
    case 'dyslexic':  return "OpenDyslexic, sans-serif";
    default:          return "'Outfit', sans-serif";
  }
};

export const TITLE_FONT = "'Permanent Marker', cursive";
