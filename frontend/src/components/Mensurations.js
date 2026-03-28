import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { PersonStanding, Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { mensurationsService, historiqueService } from '../services/api';
import { useSettings, getFontFamily } from '../context/SettingsContext';

const CHAMPS = [
  { key: 'taille',           label: 'Taille (hauteur)',          unite: 'cm', group: 'Corps' },
  { key: 'tourPoitrineHaut', label: 'Tour de poitrine haut',     unite: 'cm', group: 'Buste' },
  { key: 'tourPoitrineBas',  label: 'Tour de poitrine bas',      unite: 'cm', group: 'Buste' },
  { key: 'tourTaille',       label: 'Tour de taille',            unite: 'cm', group: 'Buste' },
  { key: 'tourHanches',      label: 'Tour de hanches',           unite: 'cm', group: 'Bas' },
  { key: 'hauteurPoitrine',  label: 'Hauteur de poitrine',       unite: 'cm', group: 'Buste' },
  { key: 'longueurDos',      label: 'Longueur de dos',           unite: 'cm', group: 'Dos' },
  { key: 'carrureDos',       label: 'Carrure dos',               unite: 'cm', group: 'Dos' },
  { key: 'largeurEpaules',   label: "Largeur d'épaules",         unite: 'cm', group: 'Dos' },
  { key: 'entrejambe',       label: 'Entrejambe',                unite: 'cm', group: 'Bas' },
  { key: 'tourBras',         label: 'Tour de bras',              unite: 'cm', group: 'Bras' },
  { key: 'longueurBras',     label: 'Longueur de bras',          unite: 'cm', group: 'Bras' },
  { key: 'tourCou',          label: 'Tour de cou',               unite: 'cm', group: 'Tête' },
  { key: 'tourTete',         label: 'Tour de tête',              unite: 'cm', group: 'Tête' },
  { key: 'pointure',         label: 'Pointure',                  unite: '',   group: 'Pieds' },
];

const GROUPS = ['Corps', 'Buste', 'Dos', 'Bas', 'Bras', 'Tête', 'Pieds'];

const EMPTY_FORM = () => ({
  nom: '',
  genre: '',
  ...Object.fromEntries(CHAMPS.map(c => [c.key, '']))
});

function ProfilForm({ initial, onSave, onCancel }) {
  const { settings } = useSettings();
  const font = getFontFamily(settings.font);
  const [data, setData] = useState(initial || EMPTY_FORM());

  const set = (key, val) => setData(prev => ({ ...prev, [key]: val }));

  const fieldSx = {
    '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#e8e3dd' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#e36397' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#e36397', borderWidth: 2 },
    '& .MuiInputLabel-root': { fontWeight: 600, color: '#6b6158' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#e36397' },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          required
          fullWidth
          label="Nom du profil"
          value={data.nom}
          onChange={e => set('nom', e.target.value)}
          sx={fieldSx}
          placeholder="Ex: Moi, Ma fille, Mon amie Lisa..."
        />
        <FormControl sx={{ minWidth: 140, ...fieldSx }}>
          <InputLabel>Genre</InputLabel>
          <Select
            value={data.genre}
            label="Genre"
            onChange={e => set('genre', e.target.value)}
          >
            <MenuItem value="Femme">Femme</MenuItem>
            <MenuItem value="Homme">Homme</MenuItem>
            <MenuItem value="Enfant">Enfant</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {GROUPS.map(group => {
        const champs = CHAMPS.filter(c => c.group === group);
        return (
          <Box key={group} sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#e36397', mb: 1.5, fontFamily: font }}>
              {group}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
              {champs.map(c => (
                <TextField
                  key={c.key}
                  label={c.label}
                  value={data[c.key]}
                  onChange={e => set(c.key, e.target.value)}
                  type="number"
                  inputProps={{ step: 0.5, min: 0 }}
                  sx={fieldSx}
                  slotProps={{
                    input: c.unite ? {
                      endAdornment: <Box component="span" sx={{ fontSize: '0.8rem', color: 'text.secondary', pl: 0.5 }}>{c.unite}</Box>
                    } : undefined
                  }}
                />
              ))}
            </Box>
          </Box>
        );
      })}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 1 }}>
        <Button onClick={onCancel} sx={{ color: 'text.secondary' }}>Annuler</Button>
        <Button
          variant="contained"
          disabled={!data.nom.trim()}
          onClick={() => onSave(data)}
          sx={{ bgcolor: '#e36397', '&:hover': { bgcolor: '#c9547f' }, fontWeight: 700 }}
        >
          Enregistrer
        </Button>
      </Box>
    </Box>
  );
}

function ProfilCard({ profil, onEdit, onDelete }) {
  const { settings } = useSettings();
  const font = getFontFamily(settings.font);
  const isDark = settings.mode === 'dark';
  const [expanded, setExpanded] = useState(false);

  const filled = CHAMPS.filter(c => profil[c.key] !== '' && profil[c.key] != null && profil[c.key] !== undefined);
  const grouped = GROUPS.map(g => ({
    group: g,
    champs: filled.filter(c => c.group === g),
  })).filter(g => g.champs.length > 0);

  return (
    <Paper elevation={0} sx={{
      border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(26,19,10,0.08)'}`,
      borderRadius: 3,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 3, py: 2,
        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#faf7f4',
        borderBottom: expanded ? `1.5px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(26,19,10,0.06)'}` : 'none',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#e36397', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PersonStanding size={18} color="white" strokeWidth={2} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', fontFamily: font }}>{profil.nom}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {filled.length} mensuration{filled.length > 1 ? 's' : ''} renseignée{filled.length > 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Modifier">
            <IconButton size="small" onClick={() => onEdit(profil)} sx={{ color: 'text.secondary' }}>
              <Pencil size={15} strokeWidth={2} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton size="small" onClick={() => onDelete(profil)} sx={{ color: '#e85d75' }}>
              <Trash2 size={15} strokeWidth={2} />
            </IconButton>
          </Tooltip>
          {filled.length > 0 && (
            <IconButton size="small" onClick={() => setExpanded(v => !v)} sx={{ color: 'text.secondary' }}>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Body */}
      {expanded && filled.length > 0 && (
        <Box sx={{ px: 3, py: 2.5 }}>
          {grouped.map(({ group, champs }) => (
            <Box key={group} sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#e36397', mb: 1 }}>
                {group}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1 }}>
                {champs.map(c => (
                  <Box key={c.key} sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f7f4f0',
                    borderRadius: 1.5, px: 1.5, py: 0.75,
                  }}>
                    <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', fontWeight: 500 }}>
                      {c.label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: 'text.primary', ml: 1 }}>
                      {profil[c.key]}{c.unite}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}

export default function Mensurations() {
  const { settings } = useSettings();
  const font = getFontFamily(settings.font);
  const isDark = settings.mode === 'dark';

  const [profils, setProfils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (editing?._id) {
      historiqueService.track({
        id: editing._id,
        type: 'mensuration',
        nom: editing.nom || 'Profil',
        image: null,
      }).catch(() => {});
    }
  }, [editing?._id]);

  const load = async () => {
    try {
      setLoading(true);
      const r = await mensurationsService.getAll();
      setProfils(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    try {
      if (editing?._id) {
        await mensurationsService.update(editing._id, data);
      } else {
        await mensurationsService.create(data);
      }
      setDialogOpen(false);
      setEditing(null);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await mensurationsService.delete(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: "'Permanent Marker', cursive" }}>
            Mensurations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => { setEditing(null); setDialogOpen(true); }}
          sx={{ bgcolor: '#e36397', '&:hover': { bgcolor: '#c9547f' }, fontWeight: 700, borderRadius: 2 }}
        >
          Nouveau profil
        </Button>
      </Box>

      {/* Contenu */}
      {loading ? (
        <Typography color="text.secondary">Chargement...</Typography>
      ) : profils.length === 0 ? (
        <Box sx={{
          border: `2px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(26,19,10,0.1)'}`,
          borderRadius: 4, p: 8, textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5,
        }}>
          <PersonStanding size={60} strokeWidth={1} color={isDark ? '#333' : '#ddd'} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: font, mb: 0.5 }}>
              Aucun profil de mensurations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Créez des profils pour vous, vos proches ou vos clientes.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => { setEditing(null); setDialogOpen(true); }}
            sx={{ bgcolor: '#e36397', '&:hover': { bgcolor: '#c9547f' }, fontWeight: 700, borderRadius: 2 }}
          >
            Créer un profil
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {profils.map(profil => (
            <ProfilCard
              key={profil._id}
              profil={profil}
              onEdit={(p) => { setEditing(p); setDialogOpen(true); }}
              onDelete={setDeleteTarget}
            />
          ))}
        </Box>
      )}

      {/* Dialog ajout/modification */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditing(null); }} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontFamily: font, fontSize: '1.3rem', pb: 0 }}>
          {editing ? 'Modifier le profil' : 'Nouveau profil'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <ProfilForm
            initial={editing}
            onSave={handleSave}
            onCancel={() => { setDialogOpen(false); setEditing(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog confirmation suppression */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontFamily: font }}>Supprimer ce profil ?</DialogTitle>
        <DialogContent>
          <Typography>
            Le profil <strong>{deleteTarget?.nom}</strong> et toutes ses mensurations seront définitivement supprimés.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)}>Annuler</Button>
          <Button onClick={handleDelete} variant="contained" sx={{ bgcolor: '#e85d75', '&:hover': { bgcolor: '#c44060' } }}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
