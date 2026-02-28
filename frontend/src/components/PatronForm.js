import React, { useState, useEffect, useRef } from 'react';
import {
  Box, TextField, Button, Grid, FormControl, InputLabel, Select,
  MenuItem, OutlinedInput, Checkbox, ListItemText, Typography,
  Paper, Chip, FormControlLabel, Autocomplete, InputAdornment, IconButton
} from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { patronService } from '../services/api';

const GENRES = ['Femme', 'Homme', 'Enfant', 'Bébé', 'Unisexe', 'Accessoire'];
const TYPES = ['Blouse', 'Body', 'Boxer', 'Chemise', 'Chemisier', 'Combi', 'Culotte',
  'Débardeur', 'Gilet', 'Jean', 'Jupe', 'Jupe-Culotte', 'Legging', 'Maillot De Bain',
  'Manteau', 'Marinière', 'Nuit', 'Pantalon', 'Paréo', 'Peignoir', 'Polo', 'Pull',
  'Robe', 'Salopette', 'Short', 'Soutien-Gorge', 'Sweat', 'Sweat Zippé', 'Tee-Shirt',
  'Top', 'Veste'];
const MANCHES = ['Manches Longues', 'Manches 3/4', 'Manches Courtes', 'Sans Manches'];
const LONGUEURS = ['Courte', 'Genou', 'Longue'];
const TISSU_TYPES = ['Chaîne et trame', 'Maille'];
const TAILLES = ['XS', 'S', 'M', 'L', 'XL', '2X', '3X', '4X+'];
const TAILLES_ENFANT = ['1 an', '2 ans', '3 ans', '4 ans', '5 ans', '6 ans', '8 ans', '10 ans', '12 ans', '14 ans', '16 ans'];
const TAILLES_BEBE = ['Prématuré', 'Naissance', '1 mois', '3 mois', '6 mois', '9 mois', '12 mois', '18 mois', '24 mois'];
const LANGUES = ['Français', 'Anglais', 'Allemand', 'Autre'];
const TYPES_AVEC_MANCHES = [
  'Robe', 'Top', 'Combi', 'Salopette', 'Chemise', 'Blouse', 'Tee-Shirt',
  'Marinière', 'Sweat', 'Sweat Zippé', 'Débardeur', 'Body', 'Chemisier',
  'Pull', 'Gilet', 'Nuit', 'Polo'
];
const TYPES_AVEC_LONGUEUR = ['Robe', 'Jupe', 'Combi', 'Salopette'];
const FORMATS = [
  { key: 'projecteur', label: '📽️ Projecteur' },
  { key: 'a4', label: '📄 A4' },
  { key: 'a0', label: '📋 A0' },
];

const PDF_TYPES = [
  { key: 'Instructions',      label: 'Instructions',      emoji: '📋' },
  { key: 'Patron-Projecteur', label: 'Patron Projecteur', emoji: '📽️' },
  { key: 'Patron-A4',         label: 'Patron A4',         emoji: '📄' },
  { key: 'Patron-A3',         label: 'Patron A3',         emoji: '📃' },
  { key: 'Patron-A0',         label: 'Patron A0',         emoji: '🖨️' },
  { key: 'Patron-US-Letter',  label: 'US Letter',         emoji: '🇺🇸' },
  { key: 'Misses-A4',         label: 'Misses A4',         emoji: '📄' },
  { key: 'Misses-A0',         label: 'Misses A0',         emoji: '🖨️' },
  { key: 'Curvy-A4',          label: 'Curvy A4',          emoji: '📄' },
  { key: 'Curvy-A0',          label: 'Curvy A0',          emoji: '🖨️' },
  { key: 'Instructions+Patron-A4', label: 'Instructions+Patron A4', emoji: '📋' },
  { key: 'Add-on',            label: 'Add-on',            emoji: '➕' },
  { key: 'Notes',             label: 'Notes',             emoji: '📝' },
];

function PatronForm({ patron, onSave, onCancel, onDelete }) {
  const [formData, setFormData] = useState({
    marque: '',
    modele: '',
    genres: [],
    types: [],
    typeAccessoire: '',
    typeAccessoires: [],
    manches: [],
    longueurs: [],
    tissuTypes: [],
    tissuSpecifique: [],
    details: [],
    taillesIndiquees: '',
    langues: [],
    taillesDisponibles: [],
    taillesEnfant: [],
    taillesBebe: [],
    dimensions: '',
    metrageMin: '',
    metrageMax: '',
    formats: { projecteur: false, a4: false, a0: false },
    maTaille: false,
    cousu: false,
    notes: '',
    lienShop: '',
    aSavoir: '',
    imagePrincipale: '',
    imageTableauTailles: '',
    imageSchemaTechnique: '',
    imageSupp1: '',
    imageSupp2: '',
    imageSupp3: ''
  });

  const [tissuInput, setTissuInput] = useState('');
  const [typeAccInput, setTypeAccInput] = useState('');
  const [detailInput, setDetailInput] = useState('');
  const [pdfFiles, setPdfFiles] = useState([]);
  const [existingPdfs, setExistingPdfs] = useState([]);
  const [draggingPdf, setDraggingPdf] = useState(false);
  const [editingNameIds, setEditingNameIds] = useState(new Set());
  const pdfInputRef = useRef(null);
  const [options, setOptions] = useState({ marques: [], typeAccessoires: [], tissuSpecifique: [], details: [] });

  useEffect(() => {
    if (patron) {
      setFormData({
        ...patron,
        langues: patron.langues || [],
        taillesEnfant: patron.taillesEnfant || [],
        taillesBebe: patron.taillesBebe || [],
        dimensions: patron.dimensions || '',
        metrageMin: patron.metrageMin || '',
        metrageMax: patron.metrageMax || '',
        typeAccessoires: patron.typeAccessoires?.length > 0 ? patron.typeAccessoires : (patron.typeAccessoire ? [patron.typeAccessoire] : [])
      });
      if (patron.pdfPath) {
        patronService.getPdfs(patron._id)
          .then(res => setExistingPdfs(res.data))
          .catch(() => setExistingPdfs([]));
      } else {
        setExistingPdfs([]);
      }
    }
    loadOptions();
  }, [patron]);

  const loadOptions = async () => {
    try {
      const response = await patronService.getFilterOptions();
      setOptions({
        marques: response.data.marques || [],
        typeAccessoires: response.data.typeAccessoires || [],
        tissuSpecifique: response.data.tissuSpecifique || [],
        details: response.data.details || []
      });
    } catch (error) {
      console.error('Erreur chargement options:', error);
    }
  };

  const handleChange = (field, value) => {
    if (field === 'types') {
      const willShowManches = value.some(t => TYPES_AVEC_MANCHES.includes(t));
      const willShowLongueurs = value.some(t => TYPES_AVEC_LONGUEUR.includes(t));
      setFormData(prev => ({
        ...prev,
        types: value,
        manches: willShowManches ? prev.manches : [],
        longueurs: willShowLongueurs ? prev.longueurs : [],
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const capFirst = s => s && typeof s === 'string' ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const handleAddTag = (field, value, inputSetter) => {
    const normalized = capFirst(value.trim());
    if (normalized && !formData[field].map(v => v.toLowerCase()).includes(normalized.toLowerCase())) {
      handleChange(field, [...formData[field], normalized]);
      inputSetter('');
    }
  };

  const handleRemoveTag = (field, value) => {
    handleChange(field, formData[field].filter(item => item !== value));
  };

  const handlePasteFromClipboard = async (field) => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onloadend = () => {
              handleChange(field, reader.result);
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
      alert('Pas d\'image dans le presse-papier');
    } catch (error) {
      alert('Erreur : impossible d\'accéder au presse-papier. Utilisez Ctrl+C sur une image d\'abord.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.marque || !formData.modele || formData.genres.length === 0) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const seen = {};
      const resolvedPdfs = pdfFiles.map(p => {
        const base = (p.customName.trim() || p.fileName).replace(/\.pdf$/i, '');
        const key = base.toLowerCase();
        seen[key] = (seen[key] || 0) + 1;
        const finalName = seen[key] === 1 ? base : `${base}${seen[key]}`;
        return { name: finalName + '.pdf', data: p.data };
      });

      const payload = {
        ...formData,
        pdfFiles: resolvedPdfs.length > 0 ? resolvedPdfs : undefined
      };
      if (patron) {
        await patronService.update(patron._id, payload);
      } else {
        await patronService.create(payload);
      }
      onSave();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const showManches = formData.types.some(type => TYPES_AVEC_MANCHES.includes(type));
  const showLongueurs = formData.types.some(type => TYPES_AVEC_LONGUEUR.includes(type));

  const isAccessoire = formData.genres.includes('Accessoire');
  const isEnfant = formData.genres.includes('Enfant');
  const isBebe = formData.genres.includes('Bébé');
  const isAdulte = formData.genres.some(g => ['Femme', 'Homme', 'Unisexe'].includes(g));

  const SectionTitle = ({ children, emoji, color, centered }) => (
    <Typography
      variant="h5"
      sx={{
        fontWeight: 800,
        color: color,
        mb: 3,
        mt: 1,
        pb: 1,
        borderBottom: `4px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: centered ? 'center' : 'flex-start',
        gap: 1
      }}
    >
      <span style={{ fontSize: '1.5em' }}>{emoji}</span>
      {children}
    </Typography>
  );

  // BLOC 1 – TextField & Autocomplete renderInput
  const roseFieldSx = {
    '& .MuiOutlinedInput-notchedOutline': { borderWidth: 3, borderColor: '#ffddd2', transition: 'border-color 0.2s' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#e85d75' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#e36397', borderWidth: 3 },
    '& .MuiInputLabel-root': { fontWeight: 700, color: '#e36397', fontSize: '1.1rem' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#e36397' },
    '& .MuiFormHelperText-root': { color: '#9e9e9e' },
  };

  // BLOC 1 – Select (le label est un InputLabel séparé, pas un enfant du Select)
  const roseSelectSx = {
    '& .MuiOutlinedInput-notchedOutline': { borderWidth: 3, borderColor: '#ffddd2', transition: 'border-color 0.2s' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#e85d75' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#e36397', borderWidth: 3 },
    minHeight: 56, minWidth: 200
  };

  // BLOC 1 – InputLabel (commun à tous les Select du bloc rose)
  const roseInputLabelSx = {
    fontWeight: 700, color: '#e36397', fontSize: '1.1rem',
    '&.Mui-focused': { color: '#e36397' }
  };

  // BLOC 2 – TextField
  const bleuFieldSx = {
    '& .MuiOutlinedInput-notchedOutline': { borderWidth: 3, borderColor: '#a8c8e0', transition: 'border-color 0.2s' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a', borderWidth: 3 },
    '& .MuiInputLabel-root': { fontWeight: 700, color: '#33658a', fontSize: '1.1rem' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#33658a' },
    '& .MuiFormHelperText-root': { color: '#9e9e9e' },
  };

  // BLOC 2 – Select
  const bleuSelectSx = {
    '& .MuiOutlinedInput-notchedOutline': { borderWidth: 3, borderColor: '#a8c8e0', transition: 'border-color 0.2s' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a', borderWidth: 3 },
    minHeight: 56, minWidth: 200
  };

  // BLOC 2 – InputLabel
  const bleuInputLabelSx = {
    fontWeight: 700, color: '#33658a', fontSize: '1.1rem',
    '&.Mui-focused': { color: '#33658a' }
  };

  return (
    <Paper
      elevation={3}
      sx={{ p: 4, background: 'linear-gradient(135deg, #fffcfa 0%, #fff5f0 100%)' }}
      onKeyDown={(e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault(); }}
    >
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 900, textAlign: 'center', mb: 4, fontSize: '2.5rem' }}>
        {patron ? '✨ Modifier un patron ✨' : '🦄 Ajouter un patron 🦄'}
      </Typography>

      {/* ── BLOC 1 : INFORMATIONS DU PATRON (ROSE) ── */}
      <Box sx={{ p: 3, mb: 4, borderRadius: 3, border: '3px solid #ffddd2', background: '#fff5f0' }}>
        <SectionTitle emoji="📝" color="#e36397">Informations du patron</SectionTitle>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>

          {/* Marque */}
          <Box>
            <Autocomplete
              freeSolo
              options={options.marques}
              value={formData.marque}
              onChange={(_, newValue) => handleChange('marque', newValue || '')}
              onInputChange={(_, newValue, reason) => {
                if (reason === 'input') handleChange('marque', newValue);
              }}
              slotProps={{
                listbox: { style: { maxHeight: '400px', fontSize: '1.05rem' } }
              }}
              renderInput={(params) => (
                <TextField {...params} required fullWidth label="Marque" sx={roseFieldSx} />
              )}
            />
          </Box>

          {/* Modèle */}
          <Box>
            <TextField
              required fullWidth label="Modèle"
              value={formData.modele}
              onChange={(e) => handleChange('modele', e.target.value)}
              sx={roseFieldSx}
            />
          </Box>

          {/* Genres */}
          <Box>
            <FormControl fullWidth required>
              <InputLabel sx={roseInputLabelSx}>Genres</InputLabel>
              <Select
                multiple value={formData.genres}
                onChange={(e) => handleChange('genres', e.target.value)}
                input={<OutlinedInput label="Genres" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => <Chip key={value} label={value} size="medium" sx={{ bgcolor: '#ffddd2', fontWeight: 700, fontSize: '0.95rem' }} />)}
                  </Box>
                )}
                sx={roseSelectSx}
              >
                {GENRES.map((genre) => (
                  <MenuItem key={genre} value={genre} sx={{ fontSize: '1.05rem', py: 1.5 }}>
                    <Checkbox checked={formData.genres.indexOf(genre) > -1} />
                    <ListItemText primary={genre} sx={{ '& .MuiTypography-root': { fontWeight: 600, fontSize: '1.05rem' } }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Types de vêtement ou Type d'accessoire */}
          <Box>
            {!isAccessoire ? (
              <FormControl fullWidth>
                <InputLabel sx={roseInputLabelSx}>Types de vêtement</InputLabel>
                <Select
                  multiple value={formData.types}
                  onChange={(e) => handleChange('types', e.target.value)}
                  input={<OutlinedInput label="Types de vêtement" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => <Chip key={value} label={value} sx={{ bgcolor: '#ffddd2', fontWeight: 700 }} />)}
                    </Box>
                  )}
                  sx={roseSelectSx}
                >
                  {TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      <Checkbox checked={formData.types.indexOf(type) > -1} />
                      <ListItemText primary={type} sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Box>
                <Autocomplete
                  freeSolo
                  options={options.typeAccessoires.filter(o => !formData.typeAccessoires.includes(o))}
                  inputValue={typeAccInput}
                  onInputChange={(_, newValue, reason) => { if (reason === 'input') setTypeAccInput(newValue); }}
                  onChange={(_, newValue) => { if (newValue) handleAddTag('typeAccessoires', newValue, setTypeAccInput); }}
                  slotProps={{ listbox: { style: { maxHeight: '400px', fontSize: '1.05rem' } } }}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth label="Type(s) d'accessoire"
                      helperText="Sélectionnez ou tapez, puis Entrée pour ajouter"
                      sx={roseFieldSx} />
                  )}
                />
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.typeAccessoires.map((type) => (
                    <Chip key={type} label={type} onDelete={() => handleRemoveTag('typeAccessoires', type)}
                      sx={{ bgcolor: '#ffddd2', fontWeight: 700, fontSize: '0.9rem' }} />
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* Manches (conditionnel) */}
          {showManches && (
            <Box>
              <FormControl fullWidth>
                <InputLabel sx={roseInputLabelSx}>Manches</InputLabel>
                <Select
                  multiple value={formData.manches}
                  onChange={(e) => handleChange('manches', e.target.value)}
                  input={<OutlinedInput label="Manches" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => <Chip key={value} label={value} sx={{ bgcolor: '#ffddd2', fontWeight: 700 }} />)}
                    </Box>
                  )}
                  sx={roseSelectSx}
                >
                  {MANCHES.map((manche) => (
                    <MenuItem key={manche} value={manche}>
                      <Checkbox checked={formData.manches.indexOf(manche) > -1} />
                      <ListItemText primary={manche} sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Longueur (conditionnel) */}
          {showLongueurs && (
            <Box>
              <FormControl fullWidth>
                <InputLabel sx={roseInputLabelSx}>Longueur</InputLabel>
                <Select
                  multiple value={formData.longueurs}
                  onChange={(e) => handleChange('longueurs', e.target.value)}
                  input={<OutlinedInput label="Longueur" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => <Chip key={value} label={value} sx={{ bgcolor: '#ffddd2', fontWeight: 700 }} />)}
                    </Box>
                  )}
                  sx={roseSelectSx}
                >
                  {LONGUEURS.map((longueur) => (
                    <MenuItem key={longueur} value={longueur}>
                      <Checkbox checked={formData.longueurs.indexOf(longueur) > -1} />
                      <ListItemText primary={longueur} sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Type de tissu */}
          <Box>
            <FormControl fullWidth>
              <InputLabel sx={roseInputLabelSx}>Type de tissu</InputLabel>
              <Select
                multiple value={formData.tissuTypes}
                onChange={(e) => handleChange('tissuTypes', e.target.value)}
                input={<OutlinedInput label="Type de tissu" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => <Chip key={value} label={value} sx={{ bgcolor: '#ffddd2', fontWeight: 700 }} />)}
                  </Box>
                )}
                sx={roseSelectSx}
              >
                {TISSU_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    <Checkbox checked={formData.tissuTypes.indexOf(type) > -1} />
                    <ListItemText primary={type} sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Besoin spécifique */}
          <Box>
            <Autocomplete
              freeSolo
              options={options.tissuSpecifique.filter(o => !formData.tissuSpecifique.includes(o))}
              inputValue={tissuInput}
              onInputChange={(_, newValue, reason) => { if (reason === 'input') setTissuInput(newValue); }}
              onChange={(_, newValue) => { if (newValue) handleAddTag('tissuSpecifique', newValue, setTissuInput); }}
              renderInput={(params) => (
                <TextField {...params} fullWidth label="Besoin spécifique"
                  helperText="Sélectionnez ou tapez, puis Entrée pour ajouter"
                  sx={roseFieldSx}
                />
              )}
            />
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.tissuSpecifique.map((tissu) => (
                <Chip key={tissu} label={tissu} onDelete={() => handleRemoveTag('tissuSpecifique', tissu)}
                  sx={{ bgcolor: '#ffddd2', fontWeight: 700, fontSize: '0.9rem' }} />
              ))}
            </Box>
          </Box>

          {/* Métrage min */}
          <Box>
            <TextField fullWidth type="number" label="Métrage minimum (m)"
              value={formData.metrageMin}
              onChange={(e) => handleChange('metrageMin', e.target.value ? parseFloat(e.target.value) : '')}
              inputProps={{ step: 0.1, min: 0 }}
              sx={roseFieldSx}
            />
          </Box>

          {/* Métrage max */}
          <Box>
            <TextField fullWidth type="number" label="Métrage maximum (m)"
              value={formData.metrageMax}
              onChange={(e) => handleChange('metrageMax', e.target.value ? parseFloat(e.target.value) : '')}
              inputProps={{ step: 0.1, min: 0 }}
              sx={roseFieldSx}
            />
          </Box>

          {/* Détails – pleine largeur */}
          <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
            <Autocomplete
              freeSolo
              options={options.details.filter(o => !formData.details.includes(o))}
              inputValue={detailInput}
              onInputChange={(_, newValue, reason) => { if (reason === 'input') setDetailInput(newValue); }}
              onChange={(_, newValue) => { if (newValue) handleAddTag('details', newValue, setDetailInput); }}
              renderInput={(params) => (
                <TextField {...params} fullWidth label="Détails"
                  helperText="Sélectionnez ou tapez, puis Entrée pour ajouter"
                  sx={roseFieldSx}
                />
              )}
            />
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.details.map((detail) => (
                <Chip key={detail} label={detail} onDelete={() => handleRemoveTag('details', detail)}
                  sx={{ bgcolor: '#ffddd2', fontWeight: 700, fontSize: '0.9rem' }} />
              ))}
            </Box>
          </Box>

        </Box>
      </Box>

      {/* ── BLOC 2 : TAILLES & INFOS PRATIQUES (BLEU) ── */}
      <Box sx={{ p: 3, mb: 4, borderRadius: 3, border: '3px solid #a8c8e0', background: '#e8f2f8' }}>
        <SectionTitle emoji="📏" color="#33658a">Tailles & Infos pratiques</SectionTitle>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

          {/* ── LIGNE 1 : Formats disponibles | Langue ── */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, maxWidth: { sm: '66%' } }}>
            <FormControl fullWidth>
              <InputLabel sx={bleuInputLabelSx}>Formats disponibles</InputLabel>
              <Select
                multiple
                value={FORMATS.filter(f => formData.formats[f.key]).map(f => f.key)}
                onChange={(e) => handleChange('formats', {
                  projecteur: e.target.value.includes('projecteur'),
                  a4: e.target.value.includes('a4'),
                  a0: e.target.value.includes('a0'),
                })}
                input={<OutlinedInput label="Formats disponibles" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((key) => {
                      const f = FORMATS.find(o => o.key === key);
                      return <Chip key={key} label={f?.label} sx={{ bgcolor: '#c8ebeb', fontWeight: 700 }} />;
                    })}
                  </Box>
                )}
                sx={bleuSelectSx}
              >
                {FORMATS.map((f) => (
                  <MenuItem key={f.key} value={f.key}>
                    <Checkbox checked={formData.formats[f.key]} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
                    <ListItemText primary={f.label} sx={{ '& .MuiTypography-root': { fontWeight: 600, color: '#33658a' } }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={bleuInputLabelSx}>Langue</InputLabel>
              <Select
                multiple
                value={formData.langues}
                onChange={(e) => handleChange('langues', e.target.value)}
                input={<OutlinedInput label="Langue" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((v) => <Chip key={v} label={v} sx={{ bgcolor: '#c8ebeb', fontWeight: 700 }} />)}
                  </Box>
                )}
                sx={bleuSelectSx}
              >
                {LANGUES.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    <Checkbox checked={formData.langues.includes(lang)} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
                    <ListItemText primary={lang} sx={{ '& .MuiTypography-root': { fontWeight: 600, color: '#33658a' } }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* ── LIGNE 2 : Tailles indiquées | Tailles disponibles | Ma taille ── */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', sm: 'nowrap' }, alignItems: 'flex-start' }}>
            {!isAccessoire && (
              <Box sx={{ flex: { xs: '0 0 100%', sm: '0 0 33%' } }}>
                <TextField
                  fullWidth
                  label="Tailles indiquées"
                  value={formData.taillesIndiquees}
                  onChange={(e) => handleChange('taillesIndiquees', e.target.value)}
                  helperText="Ex: 34-46 EU, 14-24 US"
                  sx={bleuFieldSx}
                />
              </Box>
            )}
            <Box sx={{ flex: { xs: '0 0 100%', sm: '1 1 auto' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {isAccessoire ? (
                <TextField
                  fullWidth
                  label="Dimensions"
                  value={formData.dimensions}
                  onChange={(e) => handleChange('dimensions', e.target.value)}
                  helperText="Ex: 20x30cm, unique, S/M/L"
                  sx={bleuFieldSx}
                />
              ) : (
                <>
                  {isAdulte && (
                    <FormControl fullWidth>
                      <InputLabel sx={bleuInputLabelSx}>Tailles disponibles</InputLabel>
                      <Select
                        multiple
                        value={formData.taillesDisponibles}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.includes('__all__')) {
                            const allSelected = TAILLES.every(t => formData.taillesDisponibles.includes(t));
                            handleChange('taillesDisponibles', allSelected ? [] : [...TAILLES]);
                          } else {
                            handleChange('taillesDisponibles', val);
                          }
                        }}
                        input={<OutlinedInput label="Tailles disponibles" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} sx={{ bgcolor: '#c8ebeb', fontWeight: 700 }} />
                            ))}
                          </Box>
                        )}
                        sx={bleuSelectSx}
                      >
                        <MenuItem value="__all__">
                          <Checkbox
                            checked={TAILLES.every(t => formData.taillesDisponibles.includes(t))}
                            indeterminate={formData.taillesDisponibles.length > 0 && !TAILLES.every(t => formData.taillesDisponibles.includes(t))}
                            sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' }, '&.MuiCheckbox-indeterminate': { color: '#33658a' } }}
                          />
                          <ListItemText primary="Tout cocher" sx={{ '& .MuiTypography-root': { color: '#33658a', fontWeight: 700, fontStyle: 'italic' } }} />
                        </MenuItem>
                        {TAILLES.map((taille) => (
                          <MenuItem key={taille} value={taille}>
                            <Checkbox checked={formData.taillesDisponibles.indexOf(taille) > -1} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
                            <ListItemText primary={taille} sx={{ '& .MuiTypography-root': { color: '#33658a', fontWeight: 600 } }} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  {isEnfant && (
                    <FormControl fullWidth>
                      <InputLabel sx={bleuInputLabelSx}>Tailles enfant</InputLabel>
                      <Select
                        multiple
                        value={formData.taillesEnfant}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.includes('__all__')) {
                            const allSelected = TAILLES_ENFANT.every(t => formData.taillesEnfant.includes(t));
                            handleChange('taillesEnfant', allSelected ? [] : [...TAILLES_ENFANT]);
                          } else {
                            handleChange('taillesEnfant', val);
                          }
                        }}
                        input={<OutlinedInput label="Tailles enfant" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} sx={{ bgcolor: '#c8ebeb', fontWeight: 700 }} />
                            ))}
                          </Box>
                        )}
                        sx={bleuSelectSx}
                      >
                        <MenuItem value="__all__">
                          <Checkbox
                            checked={TAILLES_ENFANT.every(t => formData.taillesEnfant.includes(t))}
                            indeterminate={formData.taillesEnfant.length > 0 && !TAILLES_ENFANT.every(t => formData.taillesEnfant.includes(t))}
                            sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' }, '&.MuiCheckbox-indeterminate': { color: '#33658a' } }}
                          />
                          <ListItemText primary="Tout cocher" sx={{ '& .MuiTypography-root': { color: '#33658a', fontWeight: 700, fontStyle: 'italic' } }} />
                        </MenuItem>
                        {TAILLES_ENFANT.map((taille) => (
                          <MenuItem key={taille} value={taille}>
                            <Checkbox checked={formData.taillesEnfant.includes(taille)} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
                            <ListItemText primary={taille} sx={{ '& .MuiTypography-root': { color: '#33658a', fontWeight: 600 } }} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  {isBebe && (
                    <FormControl fullWidth>
                      <InputLabel sx={bleuInputLabelSx}>Tailles bébé</InputLabel>
                      <Select
                        multiple
                        value={formData.taillesBebe}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.includes('__all__')) {
                            const allSelected = TAILLES_BEBE.every(t => formData.taillesBebe.includes(t));
                            handleChange('taillesBebe', allSelected ? [] : [...TAILLES_BEBE]);
                          } else {
                            handleChange('taillesBebe', val);
                          }
                        }}
                        input={<OutlinedInput label="Tailles bébé" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} sx={{ bgcolor: '#c8ebeb', fontWeight: 700 }} />
                            ))}
                          </Box>
                        )}
                        sx={bleuSelectSx}
                      >
                        <MenuItem value="__all__">
                          <Checkbox
                            checked={TAILLES_BEBE.every(t => formData.taillesBebe.includes(t))}
                            indeterminate={formData.taillesBebe.length > 0 && !TAILLES_BEBE.every(t => formData.taillesBebe.includes(t))}
                            sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' }, '&.MuiCheckbox-indeterminate': { color: '#33658a' } }}
                          />
                          <ListItemText primary="Tout cocher" sx={{ '& .MuiTypography-root': { color: '#33658a', fontWeight: 700, fontStyle: 'italic' } }} />
                        </MenuItem>
                        {TAILLES_BEBE.map((taille) => (
                          <MenuItem key={taille} value={taille}>
                            <Checkbox checked={formData.taillesBebe.includes(taille)} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
                            <ListItemText primary={taille} sx={{ '& .MuiTypography-root': { color: '#33658a', fontWeight: 600 } }} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  {!isAdulte && !isEnfant && !isBebe && (
                    <FormControl fullWidth>
                      <InputLabel sx={bleuInputLabelSx}>Tailles disponibles</InputLabel>
                      <Select
                        multiple
                        value={formData.taillesDisponibles}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.includes('__all__')) {
                            const allSelected = TAILLES.every(t => formData.taillesDisponibles.includes(t));
                            handleChange('taillesDisponibles', allSelected ? [] : [...TAILLES]);
                          } else {
                            handleChange('taillesDisponibles', val);
                          }
                        }}
                        input={<OutlinedInput label="Tailles disponibles" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} sx={{ bgcolor: '#c8ebeb', fontWeight: 700 }} />
                            ))}
                          </Box>
                        )}
                        sx={bleuSelectSx}
                      >
                        <MenuItem value="__all__">
                          <Checkbox
                            checked={TAILLES.every(t => formData.taillesDisponibles.includes(t))}
                            indeterminate={formData.taillesDisponibles.length > 0 && !TAILLES.every(t => formData.taillesDisponibles.includes(t))}
                            sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' }, '&.MuiCheckbox-indeterminate': { color: '#33658a' } }}
                          />
                          <ListItemText primary="Tout cocher" sx={{ '& .MuiTypography-root': { color: '#33658a', fontWeight: 700, fontStyle: 'italic' } }} />
                        </MenuItem>
                        {TAILLES.map((taille) => (
                          <MenuItem key={taille} value={taille}>
                            <Checkbox checked={formData.taillesDisponibles.indexOf(taille) > -1} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
                            <ListItemText primary={taille} sx={{ '& .MuiTypography-root': { color: '#33658a', fontWeight: 600 } }} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </>
              )}
            </Box>
            {!isAccessoire && (
              <Box sx={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', pt: '8px' }}>
                <FormControlLabel
                  control={<Checkbox checked={formData.maTaille} onChange={(e) => handleChange('maTaille', e.target.checked)} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />}
                  label={<span style={{ fontWeight: 700, color: '#33658a' }}>✅ Ma taille</span>}
                />
              </Box>
            )}
          </Box>

          {/* ── LIGNE 3 : Déjà cousu | Notes (conditionnel) ── */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', sm: 'nowrap' }, alignItems: 'center' }}>
            <Box sx={{ flex: '0 0 auto' }}>
              <FormControlLabel
                control={<Checkbox checked={formData.cousu} onChange={(e) => handleChange('cousu', e.target.checked)} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />}
                label={<span style={{ fontWeight: 700, color: '#33658a' }}>✂️ Déjà cousu</span>}
              />
            </Box>
            {formData.cousu && (
              <Box sx={{ flex: '1 1 auto' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes de réalisation"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  sx={bleuFieldSx}
                />
              </Box>
            )}
          </Box>

          {/* ── LIGNE 4 : À Savoir ── */}
          <TextField
            fullWidth
            multiline
            rows={2}
            label="À Savoir"
            value={formData.aSavoir}
            onChange={(e) => handleChange('aSavoir', e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LightbulbIcon sx={{ color: '#33658a' }} />
                  </InputAdornment>
                )
              }
            }}
            sx={bleuFieldSx}
          />

          {/* ── LIGNE 5 : Lien boutique ── */}
          <TextField
            fullWidth
            label="Lien boutique"
            value={formData.lienShop}
            onChange={(e) => handleChange('lienShop', e.target.value)}
            sx={bleuFieldSx}
          />

        </Box>
      </Box>

      {/* ── BLOC 3 : IMAGES (LAVANDE) ── */}
      <Box sx={{ p: 3, mb: 4, borderRadius: 3, border: '3px solid #a0dede', background: '#e6f9f9' }}>
        <SectionTitle emoji="🖼️" color="#0cbaba" centered>Images</SectionTitle>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>

          {/* Image principale */}
          <Box sx={{ border: '3px solid #0cbaba', borderRadius: 3, p: 2.5, bgcolor: '#e6f9f9', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2, transition: 'border-color 0.2s', '&:hover': { borderColor: '#0cbaba' } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0cbaba' }}>📸 Image principale</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={() => handlePasteFromClipboard('imagePrincipale')}
                sx={{ borderColor: '#0cbaba', color: '#0cbaba', fontWeight: 700, borderWidth: 2 }}>
                Ajouter
              </Button>
              {formData.imagePrincipale && (
                <Button variant="outlined" onClick={() => handleChange('imagePrincipale', '')}
                  sx={{ borderColor: '#a0dede', color: '#bbb', fontWeight: 700, borderWidth: 2 }}>
                  Supprimer
                </Button>
              )}
            </Box>
            {formData.imagePrincipale && (
              <img src={formData.imagePrincipale} alt="Aperçu" style={{ maxWidth: '100%', borderRadius: 8, display: 'block' }} />
            )}
          </Box>

          {/* Tableau des tailles */}
          <Box sx={{ border: '3px solid #0cbaba', borderRadius: 3, p: 2.5, bgcolor: '#e6f9f9', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2, transition: 'border-color 0.2s', '&:hover': { borderColor: '#0cbaba' } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0cbaba' }}>📊 Tableau des mesures</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={() => handlePasteFromClipboard('imageTableauTailles')}
                sx={{ borderColor: '#0cbaba', color: '#0cbaba', fontWeight: 700, borderWidth: 2 }}>
                Ajouter
              </Button>
              {formData.imageTableauTailles && (
                <Button variant="outlined" onClick={() => handleChange('imageTableauTailles', '')}
                  sx={{ borderColor: '#a0dede', color: '#bbb', fontWeight: 700, borderWidth: 2 }}>
                  Supprimer
                </Button>
              )}
            </Box>
            {formData.imageTableauTailles && (
              <img src={formData.imageTableauTailles} alt="Tableau" style={{ maxWidth: '100%', borderRadius: 8, display: 'block' }} />
            )}
          </Box>

          {/* Schéma technique */}
          <Box sx={{ border: '3px solid #0cbaba', borderRadius: 3, p: 2.5, bgcolor: '#e6f9f9', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2, transition: 'border-color 0.2s', '&:hover': { borderColor: '#0cbaba' } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0cbaba' }}>📐 Schéma technique</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={() => handlePasteFromClipboard('imageSchemaTechnique')}
                sx={{ borderColor: '#0cbaba', color: '#0cbaba', fontWeight: 700, borderWidth: 2 }}>
                Ajouter
              </Button>
              {formData.imageSchemaTechnique && (
                <Button variant="outlined" onClick={() => handleChange('imageSchemaTechnique', '')}
                  sx={{ borderColor: '#a0dede', color: '#bbb', fontWeight: 700, borderWidth: 2 }}>
                  Supprimer
                </Button>
              )}
            </Box>
            {formData.imageSchemaTechnique && (
              <img src={formData.imageSchemaTechnique} alt="Schéma" style={{ maxWidth: '100%', borderRadius: 8, display: 'block' }} />
            )}
          </Box>

          {/* Images supplémentaires */}
          {[
            { field: 'imageSupp1', label: '🖼️ Image supp. 1' },
            { field: 'imageSupp2', label: '🖼️ Image supp. 2' },
            { field: 'imageSupp3', label: '🖼️ Image supp. 3' },
          ].map(({ field, label }) => (
            <Box key={field} sx={{ border: '3px dashed #0cbaba', borderRadius: 3, p: 2.5, bgcolor: '#e6f9f9', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2, transition: 'border-color 0.2s', '&:hover': { borderColor: '#0cbaba' } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0cbaba' }}>{label}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={() => handlePasteFromClipboard(field)}
                  sx={{ borderColor: '#0cbaba', color: '#0cbaba', fontWeight: 700, borderWidth: 2 }}>
                  Ajouter
                </Button>
                {formData[field] && (
                  <Button variant="outlined" onClick={() => handleChange(field, '')}
                    sx={{ borderColor: '#a0dede', color: '#bbb', fontWeight: 700, borderWidth: 2 }}>
                    Supprimer
                  </Button>
                )}
              </Box>
              {formData[field] && (
                <img src={formData[field]} alt={label} style={{ maxWidth: '100%', borderRadius: 8, display: 'block' }} />
              )}
            </Box>
          ))}

        </Box>
      </Box>

      {/* ── BLOC 4 : PDFs ── */}
      <Box sx={{ p: 3, mb: 4, borderRadius: 3, border: '3px solid #7b5ea7', background: '#f5f0fb' }}>
        <SectionTitle emoji="📄" color="#7b5ea7" centered>Fichiers PDF</SectionTitle>

        {existingPdfs.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ mb: 1, fontSize: '0.85rem', color: '#7b5ea7', fontWeight: 600 }}>
              PDFs déjà présents :
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {existingPdfs.filter((pdf, i, arr) => arr.findIndex(p => p.name === pdf.name) === i).map(pdf => (
                <Chip
                  key={pdf.name}
                  label={pdf.name.replace(/\.pdf$/i, '').replace(/^[^_]+_/, '')}
                  component="a"
                  href={`http://localhost:5000${pdf.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  clickable
                  size="small"
                  onDelete={async (e) => {
                    e.preventDefault();
                    if (!window.confirm(`Supprimer "${pdf.name.replace(/\.pdf$/i, '').replace(/^[^_]+_/, '')}" ?`)) return;
                    try {
                      await patronService.deletePdf(patron._id, pdf.name);
                      setExistingPdfs(prev => prev.filter(p => p.name !== pdf.name));
                    } catch (err) {
                      console.error('Erreur suppression PDF:', err);
                    }
                  }}
                  sx={{ bgcolor: '#e8dcf5', color: '#7b5ea7', fontWeight: 700, '&:hover': { bgcolor: '#d4c5f0' } }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Liste des PDFs sélectionnés avec sélecteur de type */}
        {pdfFiles.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {pdfFiles.map((p) => (
              <Box key={p.id} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', bgcolor: 'white', borderRadius: 2, px: 2, py: 1, border: '2px solid #d4c5f0', flexWrap: 'wrap' }}>
                <PictureAsPdfIcon sx={{ color: '#7b5ea7', fontSize: '1.1rem', flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', fontStyle: 'italic', flex: 1, minWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.fileName}
                </Typography>
                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <Select
                    displayEmpty
                    value={PDF_TYPES.some(t => t.key === p.typeKey) ? p.typeKey : (p.typeKey === '__autre__' ? '__autre__' : '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPdfFiles(prev => prev.map(f => f.id === p.id
                        ? { ...f, typeKey: val, customName: val !== '__autre__' ? val : '' }
                        : f
                      ));
                      if (val !== '__autre__') setEditingNameIds(prev => { const s = new Set(prev); s.delete(p.id); return s; });
                    }}
                    sx={{ fontSize: '0.85rem', color: '#7b5ea7', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d4c5f0' } }}
                  >
                    <MenuItem value="" disabled><em>Choisir un type…</em></MenuItem>
                    {PDF_TYPES.map(t => (
                      <MenuItem key={t.key} value={t.key}>{t.emoji} {t.label}</MenuItem>
                    ))}
                    <MenuItem value="__autre__">✏️ Autre</MenuItem>
                  </Select>
                </FormControl>
                {(p.typeKey === '__autre__' || editingNameIds.has(p.id)) && (
                  <TextField
                    size="small"
                    value={p.customName}
                    onChange={(e) => setPdfFiles(prev => prev.map(f => f.id === p.id ? { ...f, customName: e.target.value } : f))}
                    placeholder="Nom personnalisé…"
                    sx={{ width: 150, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d4c5f0' } }}
                  />
                )}
                {p.typeKey && p.typeKey !== '__autre__' && (
                  <IconButton
                    size="small"
                    title="Renommer"
                    onClick={() => setEditingNameIds(prev => {
                      const s = new Set(prev);
                      if (s.has(p.id)) { s.delete(p.id); } else { s.add(p.id); setPdfFiles(ps => ps.map(f => f.id === p.id ? { ...f, customName: f.customName || f.typeKey } : f)); }
                      return s;
                    })}
                    sx={{ color: editingNameIds.has(p.id) ? '#7b5ea7' : '#b0a0d0', p: 0.5 }}
                  >
                    <DriveFileRenameOutlineIcon fontSize="small" />
                  </IconButton>
                )}
                <Button
                  size="small"
                  onClick={() => setPdfFiles(prev => prev.filter(f => f.id !== p.id))}
                  sx={{ color: '#e85d75', minWidth: 'auto', px: 0.5 }}
                >✕</Button>
              </Box>
            ))}
          </Box>
        )}

        {/* Zone de dépôt */}
        <Box
          onDragOver={(e) => { e.preventDefault(); setDraggingPdf(true); }}
          onDragLeave={() => setDraggingPdf(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDraggingPdf(false);
            const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
            if (!files.length) return;
            files.forEach((file) => {
              const reader = new FileReader();
              reader.onload = (ev) => {
                setPdfFiles(prev => [...prev, { id: Date.now() + Math.random(), typeKey: '', customName: '', fileName: file.name, data: ev.target.result }]);
              };
              reader.readAsDataURL(file);
            });
          }}
          onClick={() => pdfInputRef.current?.click()}
          sx={{
            border: `2px dashed ${draggingPdf ? '#7b5ea7' : '#d4c5f0'}`,
            borderRadius: 2, p: 3, textAlign: 'center', cursor: 'pointer',
            bgcolor: draggingPdf ? '#ede7f8' : '#faf8ff',
            transition: 'all 0.15s',
            '&:hover': { borderColor: '#7b5ea7', bgcolor: '#ede7f8' }
          }}
        >
          <PictureAsPdfIcon sx={{ fontSize: 36, color: '#7b5ea7', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Glisser-déposer les PDF ici<br />ou cliquer pour ouvrir un dossier
          </Typography>
        </Box>

        {/* Input caché */}
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            const files = Array.from(e.target.files);
            if (!files.length) return;
            files.forEach((file) => {
              const reader = new FileReader();
              reader.onload = (ev) => {
                setPdfFiles(prev => [...prev, { id: Date.now() + Math.random(), typeKey: '', customName: '', fileName: file.name, data: ev.target.result }]);
              };
              reader.readAsDataURL(file);
            });
            e.target.value = '';
          }}
        />
      </Box>

      {/* ── BOUTONS D'ACTION – EN DEHORS DES BLOCS ── */}
      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', alignItems: 'center', mt: 4, mb: 2 }}>
        {patron && onDelete && (
          <IconButton
            onClick={async () => {
              if (!window.confirm('Supprimer ce patron ?')) return;
              try {
                await patronService.delete(patron._id);
                onDelete();
              } catch (err) {
                console.error('Erreur suppression:', err);
              }
            }}
            sx={{ bgcolor: '#e85d75', color: 'white', '&:hover': { bgcolor: '#c94a60' } }}
          >
            <DeleteIcon />
          </IconButton>
        )}
        <Button
          variant="outlined"
          onClick={onCancel}
          size="large"
          sx={{
            fontWeight: 800,
            fontSize: '1.1rem',
            px: 5,
            py: 1.5,
            borderWidth: 3,
            borderColor: '#33658a',
            color: '#33658a',
            '&:hover': { borderWidth: 3, bgcolor: '#ffddd2' }
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          sx={{
            fontWeight: 800,
            fontSize: '1.1rem',
            px: 5,
            py: 1.5,
            background: 'linear-gradient(45deg, #e36397 30%, #e85d75 90%)',
            boxShadow: '0 3px 5px 2px rgba(227, 99, 151, .3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #c94a60 30%, #e36397 90%)',
            }
          }}
        >
          {patron ? '✨ Modifier ✨' : '🦄 Ajouter 🦄'}
        </Button>
      </Box>

    </Paper>
  );
}

export default PatronForm;
