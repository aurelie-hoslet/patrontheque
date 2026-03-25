import React, { useState } from 'react';
import {
  Box, Typography, TextField, MenuItem, Button,
  CircularProgress, FormControl, InputLabel, Select, OutlinedInput
} from '@mui/material';
import { Send, CheckCircle, MessageCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../config/emailjs';
import { useSettings, TITLE_FONT } from '../context/SettingsContext';

const OBJETS = [
  'Je signale un problème',
  'Je suggère une fonctionnalité',
  'Je laisse un mot doux à la créatrice',
];

const fieldSx = {
  '& .MuiOutlinedInput-notchedOutline': { borderWidth: 1.5, borderColor: 'rgba(26,19,10,0.15)', transition: 'border-color 0.2s' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(26,19,10,0.35)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 1.5 },
};

function ContactForm() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ prenom: '', email: '', objet: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.prenom || !form.email || !form.objet || !form.message) return;
    setSending(true);
    setError('');
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { prenom: form.prenom, email: form.email, objet: form.objet, message: form.message },
        EMAILJS_PUBLIC_KEY
      );
      setSent(true);
    } catch {
      setError('Une erreur est survenue. Vérifiez votre connexion et réessayez.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1.5, color: '#2e7d32' }}>
        <CheckCircle size={20} strokeWidth={2} />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Message envoyé ! Merci, je vous réponds dès que possible.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSend}
      sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 520 }}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <TextField
          required size="small"
          label="Prénom ou pseudo"
          value={form.prenom}
          onChange={set('prenom')}
          sx={fieldSx}
        />
        <TextField
          required size="small" type="email"
          label="Email"
          value={form.email}
          onChange={set('email')}
          sx={fieldSx}
        />
      </Box>

      <FormControl size="small" required>
        <InputLabel>Objet</InputLabel>
        <Select
          value={form.objet}
          onChange={set('objet')}
          input={<OutlinedInput label="Objet" />}
          sx={fieldSx}
        >
          {OBJETS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </Select>
      </FormControl>

      <TextField
        required multiline rows={4}
        label="Message"
        value={form.message}
        onChange={set('message')}
        sx={fieldSx}
      />

      {error && <Typography variant="caption" color="error">{error}</Typography>}

      <Box>
        <Button
          type="submit"
          variant="contained"
          disabled={sending}
          startIcon={sending ? <CircularProgress size={14} color="inherit" /> : <Send size={14} strokeWidth={2} />}
          sx={{
            bgcolor: settings.accentColor,
            '&:hover': { bgcolor: settings.accentColor, filter: 'brightness(0.9)' },
            fontWeight: 700, px: 3,
          }}
        >
          {sending ? 'Envoi…' : 'Envoyer'}
        </Button>
      </Box>
    </Box>
  );
}

export default function APropos() {
  const { settings } = useSettings();
  const isDark = settings.mode === 'dark';
  const [showContact, setShowContact] = useState(false);

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

        {/* Contact */}
        <Box
          component="button"
          onClick={() => setShowContact(v => !v)}
          sx={{
            ...linkSx,
            color: settings.accentColor,
            display: 'flex', alignItems: 'center', gap: 0.5,
          }}
        >
          <MessageCircle size={15} strokeWidth={2} />
          Contact
        </Box>
      </Box>

      {/* Formulaire de contact */}
      {showContact && <ContactForm />}

    </Box>
  );
}
