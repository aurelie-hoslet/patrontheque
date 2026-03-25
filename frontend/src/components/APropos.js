import React from 'react';
import { Box, Typography } from '@mui/material';
import { useSettings } from '../context/SettingsContext';

export default function APropos() {
  const { settings } = useSettings();
  const isDark = settings.mode === 'dark';

  const linkSx = {
    background: 'none', border: 'none', padding: 0,
    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
    textDecoration: 'none', transition: 'opacity 0.15s',
    '&:hover': { opacity: 0.7, textDecoration: 'underline' },
  };

  return (
    <Box sx={{ maxWidth: 640 }}>

      {/* Titre */}
      <Typography variant="h4" sx={{ mb: 4 }}>
        À propos
      </Typography>

      {/* Bio */}
      <Typography
        variant="body1"
        sx={{
          lineHeight: 1.9,
          color: 'text.secondary',
          fontStyle: 'italic',
          borderLeft: `3px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(26,19,10,0.1)'}`,
          pl: 2.5,
          mb: 4,
        }}
      >
        "Bonjour, je suis BeeCkett — couturière passionnée et créatrice de Sewing Box.
        Un jour je me suis surprise à racheter un patron que j'avais déjà. Deux fois.
        C'est là que j'ai décidé de créer l'outil qui me manquait."
      </Typography>

      {/* Liens */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>

        {/* FAQ – inactif */}
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: 'text.disabled', cursor: 'default' }}>
          FAQ
        </Typography>

        {/* Discord */}
        <Box
          component="a"
          href="https://discord.gg/SRRwd8jX"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ ...linkSx, color: '#5865F2' }}
        >
          Discord
        </Box>

      </Box>

    </Box>
  );
}
