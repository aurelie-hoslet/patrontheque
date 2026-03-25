import React from 'react';
import {
  Box, Typography, Switch, FormControlLabel,
  Radio, RadioGroup, Paper
} from '@mui/material';
import { Settings, Moon, Palette, Type } from 'lucide-react';
import { useSettings, getFontFamily } from '../context/SettingsContext';

const PRESET_COLORS = [
  { color: '#e36397', label: 'Rose (défaut)' },
  { color: '#0cbaba', label: 'Menthe' },
  { color: '#7b5ea7', label: 'Lavande' },
  { color: '#ff8b60', label: 'Pêche' },
  { color: '#33658a', label: 'Bleu' },
  { color: '#4caf50', label: 'Vert' },
  { color: '#e67e22', label: 'Ocre' },
  { color: '#e74c3c', label: 'Rouge' },
];

export default function Parametres() {
  const { settings, update } = useSettings();

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography variant="h4" sx={{ fontFamily: getFontFamily(settings.font), mb: 1 }}>
        Paramètres
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Personnalisez l'apparence de Sewing Box selon vos préférences.
      </Typography>

      {/* Thème clair / sombre */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Moon size={18} strokeWidth={2} />
          <Typography variant="h6" sx={{ fontFamily: getFontFamily(settings.font) }}>
            Thème
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={settings.mode === 'dark'}
              onChange={(e) => update('mode', e.target.checked ? 'dark' : 'light')}
              color="secondary"
            />
          }
          label={
            <Typography sx={{ fontFamily: getFontFamily(settings.font) }}>
              {settings.mode === 'dark' ? 'Mode sombre activé' : 'Mode clair activé'}
            </Typography>
          }
        />
      </Paper>

      {/* Couleur d'accentuation */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Palette size={18} strokeWidth={2} />
          <Typography variant="h6" sx={{ fontFamily: getFontFamily(settings.font) }}>
            Couleur principale
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Appliquée aux boutons, tags et éléments interactifs.
        </Typography>

        {/* Palettes prédéfinies */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
          {PRESET_COLORS.map(({ color, label }) => (
            <Box
              key={color}
              onClick={() => update('accentColor', color)}
              title={label}
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                bgcolor: color,
                cursor: 'pointer',
                border: settings.accentColor === color
                  ? '3px solid white'
                  : '3px solid transparent',
                boxShadow: settings.accentColor === color
                  ? `0 0 0 2px ${color}, 0 2px 8px ${color}88`
                  : '0 2px 6px rgba(0,0,0,0.15)',
                transition: 'all 0.15s',
                '&:hover': { transform: 'scale(1.15)' },
              }}
            />
          ))}
        </Box>

        {/* Sélecteur libre */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ position: 'relative', width: 38, height: 38 }}>
            <input
              type="color"
              value={settings.accentColor}
              onChange={(e) => update('accentColor', e.target.value)}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                background: 'none',
              }}
            />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontFamily: getFontFamily(settings.font) }}>
              Couleur libre
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {settings.accentColor}
            </Typography>
          </Box>
          <Box sx={{
            width: 24, height: 24, borderRadius: 1,
            bgcolor: settings.accentColor,
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }} />
        </Box>
      </Paper>

      {/* Police */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Type size={18} strokeWidth={2} />
          <Typography variant="h6" sx={{ fontFamily: getFontFamily(settings.font) }}>
            Police d'écriture
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          OpenDyslexic améliore la lisibilité pour les personnes dyslexiques.
        </Typography>
        <RadioGroup
          value={settings.font}
          onChange={(e) => update('font', e.target.value)}
          sx={{ gap: 1 }}
        >
          {[
            { value: 'architects', label: 'Architects Daughter', preview: "'Architects Daughter', cursive" },
            { value: 'simple',     label: 'Nunito — simple et lisible', preview: "'Nunito', sans-serif" },
            { value: 'dyslexic',   label: 'OpenDyslexic — accessibilité', preview: 'OpenDyslexic, sans-serif' },
          ].map(({ value, label, preview }) => (
            <FormControlLabel
              key={value}
              value={value}
              control={<Radio color="secondary" />}
              label={
                <Box>
                  <Typography sx={{ fontFamily: preview, fontSize: '1rem' }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontFamily: preview, fontSize: '0.8rem', color: 'text.secondary' }}>
                    Le renard brun saute par-dessus le chien paresseux
                  </Typography>
                </Box>
              }
            />
          ))}
        </RadioGroup>
      </Paper>
    </Box>
  );
}
