import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Select, MenuItem, FormControl, InputLabel,
  Button, Typography, Paper, IconButton, Checkbox,
  LinearProgress, Autocomplete, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { ClipboardList, Plus, Trash2, Clipboard, Pencil, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { projetService } from '../services/api';

const ETAPES_TEMPLATE = [
  'Préparation du patron',
  'Tissu lavé et repassé',
  'Préparation de la mercerie',
  'Découpage du tissu',
  'Assemblage',
  'Finitions',
];

const genId = () => `e_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

function SortableEtape({ etape, onToggle, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: etape.id });
  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: 1,
        bgcolor: isDragging ? 'rgba(51,101,138,0.08)' : 'transparent' }}
    >
      <Box {...attributes} {...listeners}
        sx={{ cursor: 'grab', color: 'text.disabled', display: 'flex', alignItems: 'center', '&:active': { cursor: 'grabbing' } }}>
        <GripVertical size={14} strokeWidth={2} />
      </Box>
      <Checkbox checked={etape.faite} onChange={onToggle} size="small"
        sx={{ p: 0.25, color: '#0cbaba', '&.Mui-checked': { color: '#0cbaba' } }} />
      <Typography variant="body2" sx={{ flex: 1, fontSize: '0.88rem',
        textDecoration: etape.faite ? 'line-through' : 'none',
        color: etape.faite ? 'text.disabled' : 'inherit' }}>
        {etape.titre}
      </Typography>
      <IconButton size="small" onClick={onDelete}
        sx={{ color: 'rgba(232,93,117,0.5)', '&:hover': { color: '#e85d75' }, p: 0.25 }}>
        <Trash2 size={13} strokeWidth={2} />
      </IconButton>
    </Box>
  );
}

const defaultForm = {
  nom: '', patronId: '', tissuId: '', statut: 'Idée',
  notes: '', image: '', dateDebut: '', dateFin: '', etapes: []
};

const fieldSx = {
  '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#e8e3dd' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a', borderWidth: 2 },
  '& .MuiInputLabel-root': { fontWeight: 600, color: '#6b6158' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#33658a' },
};

function ProjetForm({ projet, patrons, tissus, onSave, onCancel }) {
  const [formData, setFormData] = useState(defaultForm);
  const [newEtape, setNewEtape] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [dragging, setDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    projetService.getEtapesSuggestions()
      .then(res => setSuggestions(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (projet) {
      setFormData({
        nom: projet.nom || '',
        patronId: projet.patronId || '',
        tissuId: projet.tissuId || '',
        statut: projet.statut || 'En cours',
        notes: projet.notes || '',
        image: projet.image || '',
        dateDebut: projet.dateDebut ? projet.dateDebut.slice(0, 10) : '',
        dateFin: projet.dateFin ? projet.dateFin.slice(0, 10) : '',
        etapes: (projet.etapes || []).map(e => ({ ...e, id: e.id || genId() }))
      });
    } else {
      setFormData({
        ...defaultForm,
        etapes: ETAPES_TEMPLATE.map(titre => ({ id: genId(), titre, faite: false }))
      });
    }
  }, [projet]);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const loadImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => handleChange('image', reader.result);
    reader.readAsDataURL(file);
  };

  const handlePasteImage = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'));
        if (imageType) { loadImageFile(await item.getType(imageType)); return; }
      }
    } catch { console.error('Impossible de lire le presse-papiers'); }
  };

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) { loadImageFile(item.getAsFile()); return; }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const ajouterEtape = (titre) => {
    if (!titre?.trim()) return;
    handleChange('etapes', [...formData.etapes, { id: genId(), titre: titre.trim(), faite: false }]);
    setNewEtape('');
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = formData.etapes.findIndex(e => e.id === active.id);
      const newIdx = formData.etapes.findIndex(e => e.id === over.id);
      handleChange('etapes', arrayMove(formData.etapes, oldIdx, newIdx));
    }
  };

  const etapesFaites = formData.etapes.filter(e => e.faite).length;
  const totalEtapes = formData.etapes.length;
  const progression = totalEtapes > 0 ? Math.round((etapesFaites / totalEtapes) * 100) : 0;

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const data = {
        ...formData,
        patronId: formData.patronId || undefined,
        tissuId: formData.tissuId || undefined,
        dateDebut: formData.dateDebut || undefined,
        dateFin: formData.dateFin || undefined
      };
      if (projet) {
        await projetService.update(projet._id, data);
      } else {
        await projetService.create(data);
      }
      onSave();
    } catch (error) {
      console.error('Erreur sauvegarde projet:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const patronSelectionne = patrons.find(p => p._id === formData.patronId);
  const nomProjetAffiche = formData.nom || (patronSelectionne ? `${patronSelectionne.marque} - ${patronSelectionne.modele}` : '');

  return (
    <Paper elevation={0} sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#33658a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ClipboardList size={18} color="white" strokeWidth={2} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {projet ? 'Modifier le projet' : 'Nouveau projet'}
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

        <TextField
          label="Nom du projet (optionnel)"
          value={formData.nom}
          onChange={e => handleChange('nom', e.target.value)}
          fullWidth
          placeholder={nomProjetAffiche || "Ex: Robe d'été bleue"}
          helperText="Si vide, le nom du patron sera utilisé"
          sx={fieldSx}
        />

        <FormControl fullWidth sx={fieldSx}>
          <InputLabel>Patron associé</InputLabel>
          <Select value={formData.patronId} label="Patron associé" onChange={e => handleChange('patronId', e.target.value)}>
            <MenuItem value=""><em>Aucun</em></MenuItem>
            {patrons.map(p => (
              <MenuItem key={p._id} value={p._id}>{p.marque} — {p.modele}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={fieldSx}>
          <InputLabel>Tissu associé</InputLabel>
          <Select value={formData.tissuId} label="Tissu associé" onChange={e => handleChange('tissuId', e.target.value)}>
            <MenuItem value=""><em>Aucun</em></MenuItem>
            {tissus.map(t => (
              <MenuItem key={t._id} value={t._id}>
                {t.nom}{t.couleur ? ` — ${t.couleur}` : ''}{t.quantite ? ` (${t.quantite}m)` : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Date de début"
            type="date"
            value={formData.dateDebut}
            onChange={e => handleChange('dateDebut', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={fieldSx}
          />
          <TextField
            label="Date de fin"
            type="date"
            value={formData.dateFin}
            onChange={e => handleChange('dateFin', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={fieldSx}
          />
        </Box>

        <Box>
          <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            État
          </Typography>
          <RadioGroup row value={formData.statut} onChange={e => handleChange('statut', e.target.value)}>
            {['Idée', 'En cours', 'Terminé'].map(val => (
              <FormControlLabel key={val} value={val} label={val} control={
                <Radio size="small" sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
              } />
            ))}
          </RadioGroup>
        </Box>

        {/* Étapes */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Étapes
          </Typography>

          {totalEtapes > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  {etapesFaites}/{totalEtapes} terminées
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0cbaba' }}>
                  {progression}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progression}
                sx={{ height: 5, borderRadius: 3, bgcolor: 'rgba(26,19,10,0.07)', '& .MuiLinearProgress-bar': { bgcolor: '#0cbaba' } }} />
            </Box>
          )}

          {totalEtapes > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={formData.etapes.map(e => e.id)} strategy={verticalListSortingStrategy}>
                <Box sx={{ mb: 1.5, bgcolor: 'rgba(51,101,138,0.04)', borderRadius: 2, border: '1.5px solid rgba(26,19,10,0.07)', py: 0.5 }}>
                  {formData.etapes.map((etape, idx) => (
                    <SortableEtape
                      key={etape.id}
                      etape={etape}
                      onToggle={() => handleChange('etapes', formData.etapes.map((e, i) => i === idx ? { ...e, faite: !e.faite } : e))}
                      onDelete={() => handleChange('etapes', formData.etapes.filter((_, i) => i !== idx))}
                    />
                  ))}
                </Box>
              </SortableContext>
            </DndContext>
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Autocomplete
              freeSolo
              options={suggestions}
              inputValue={newEtape}
              onInputChange={(_, val) => setNewEtape(val)}
              onChange={(_, val) => { if (val && typeof val === 'string') ajouterEtape(val); }}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} size="small" placeholder="Ajouter une étape..."
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); ajouterEtape(newEtape); } }}
                  sx={fieldSx} />
              )}
            />
            <IconButton onClick={() => ajouterEtape(newEtape)}
              sx={{ bgcolor: '#33658a', color: 'white', borderRadius: 1.5, '&:hover': { bgcolor: '#1e4d6b' } }}>
              <Plus size={18} />
            </IconButton>
          </Box>
        </Box>

        <TextField
          label="Notes"
          value={formData.notes}
          onChange={e => handleChange('notes', e.target.value)}
          fullWidth
          multiline
          rows={3}
          sx={fieldSx}
        />

        {/* Image */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Photo du projet
          </Typography>
          {formData.image ? (
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <img src={formData.image} alt="Aperçu" style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 8 }} />
              <IconButton size="small" onClick={() => handleChange('image', '')}
                sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white', boxShadow: 1 }}>
                <Trash2 size={14} strokeWidth={2} />
              </IconButton>
            </Box>
          ) : (
            <Box
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); loadImageFile(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById('projet-file-input').click()}
              sx={{
                border: `2px dashed ${dragging ? '#33658a' : '#e8e3dd'}`,
                borderRadius: 2, p: 2.5, textAlign: 'center', cursor: 'pointer',
                bgcolor: dragging ? '#e3eef7' : 'transparent',
                transition: 'all 0.15s',
                '&:hover': { borderColor: '#33658a', bgcolor: '#f0f6fa' }
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.85rem' }}>
                Glisser-déposer ou cliquer pour parcourir
              </Typography>
              <Button size="small" variant="outlined" startIcon={<Clipboard size={14} />}
                onClick={e => { e.stopPropagation(); handlePasteImage(); }}
                sx={{ borderColor: '#33658a', color: '#33658a', fontWeight: 600, borderWidth: 2 }}>
                Coller une image
              </Button>
              <input id="projet-file-input" type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => loadImageFile(e.target.files[0])} />
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 1 }}>
          <Button onClick={onCancel} sx={{ color: 'text.secondary' }}>Annuler</Button>
          <Button type="button" onClick={handleSubmit} variant="contained" startIcon={projet ? <Pencil size={16} /> : <Plus size={16} />}
            sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' }, fontWeight: 700 }}>
            {projet ? 'Modifier' : 'Créer le projet'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default ProjetForm;
