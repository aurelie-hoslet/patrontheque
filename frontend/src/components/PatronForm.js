import React, { useState, useEffect, useRef } from 'react';
import {
  Box, TextField, Button, FormControl, InputLabel, Select,
  MenuItem, OutlinedInput, Checkbox, ListItemText, Typography,
  Paper, Chip, FormControlLabel, Autocomplete, InputAdornment, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Info, Ruler, Image, FileText, Lightbulb, Trash2,
  Pencil, Scissors, Check, ClipboardCopy, Clock, Camera, BarChart2, X
} from 'lucide-react';
import { patronService } from '../services/api';

const GENRES = ['Femme', 'Homme', 'Enfant', 'Bébé', 'Unisexe', 'Accessoire'];
const TYPES = ['Anorak', 'Blouse', 'Blouson', 'Body', 'Boxer', 'Brassière', 'Chemise', 'Chemisier', 'Combi', 'Culotte',
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
  { key: 'projecteur', label: 'Projecteur' },
  { key: 'a4', label: 'A4' },
  { key: 'a0', label: 'A0' },
];

const PDF_TYPES = [
  { key: 'Instructions',           label: 'Instructions' },
  { key: 'Patron-Projecteur',      label: 'Patron Projecteur' },
  { key: 'Patron-A4',              label: 'Patron A4' },
  { key: 'Patron-A3',              label: 'Patron A3' },
  { key: 'Patron-A0',              label: 'Patron A0' },
  { key: 'Patron-US-Letter',       label: 'US Letter' },
  { key: 'Misses-A4',              label: 'Misses A4' },
  { key: 'Misses-A0',              label: 'Misses A0' },
  { key: 'Curvy-A4',               label: 'Curvy A4' },
  { key: 'Curvy-A0',               label: 'Curvy A0' },
  { key: 'Instructions+Patron-A4', label: 'Instructions+Patron A4' },
  { key: 'Add-on',                 label: 'Add-on' },
  { key: 'Notes',                  label: 'Notes' },
];

const compressImage = (dataUrl) => new Promise((resolve) => {
  const img = new window.Image();
  img.onload = () => {
    const MAX = 1200;
    let { width, height } = img;
    if (width > MAX || height > MAX) {
      if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
      else { width = Math.round(width * MAX / height); height = MAX; }
    }
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    canvas.getContext('2d').drawImage(img, 0, 0, width, height);
    resolve(canvas.toDataURL('image/jpeg', 0.82));
  };
  img.src = dataUrl;
});

function ImageField({ label, icon: Icon, value, onChange, onPaste, dashed }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result);
      onChange(compressed);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
      onDrop={handleDrop}
      sx={{
        border: dragging
          ? '2px solid #0cbaba'
          : value
            ? '2px solid rgba(12,186,186,0.4)'
            : `2px ${dashed ? 'dashed' : 'solid'} rgba(12,186,186,0.25)`,
        borderRadius: 3, p: 2.5,
        bgcolor: dragging ? 'rgba(12,186,186,0.12)' : 'rgba(12,186,186,0.04)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2,
        transition: 'all 0.15s',
        '&:hover': { borderColor: '#0cbaba' },
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0cbaba', display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Icon size={16} strokeWidth={2} />{label}
      </Typography>
      {!value && (
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: -1 }}>
          Glisser une image ici
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="outlined" size="small" onClick={onPaste}
          sx={{ borderColor: '#0cbaba', color: '#0cbaba', fontWeight: 700, borderWidth: 2 }}>
          Coller
        </Button>
        {value && (
          <Button variant="outlined" size="small" onClick={() => onChange('')}
            sx={{ borderColor: 'rgba(0,0,0,0.15)', color: 'text.secondary', fontWeight: 700, borderWidth: 2 }}>
            Supprimer
          </Button>
        )}
      </Box>
      {value && (
        <img src={value} alt={label} style={{ maxWidth: '100%', borderRadius: 8, display: 'block' }} />
      )}
    </Box>
  );
}

function HoverSelect({ children, MenuProps: menuPropsProp, ...props }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const handleEnter = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 100);
  };

  return (
    <Box sx={{ width: '100%' }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Select
        {...props}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        MenuProps={{
          ...menuPropsProp,
          PaperProps: {
            ...menuPropsProp?.PaperProps,
            onMouseEnter: handleEnter,
            onMouseLeave: handleLeave,
          },
        }}
      >
        {children}
      </Select>
    </Box>
  );
}

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
    imageSupp3: '',
    typePatron: 'PDF',
    nomMagazine: '',
    numeroParution: '',
    pages: '',
    titreLivre: '',
    auteur: '',
    recopie: false,
    vintage: false,
    typePlanche: '',
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
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmPdfDeleteInfo, setConfirmPdfDeleteInfo] = useState(null);

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
        typeAccessoires: patron.typeAccessoires?.length > 0 ? patron.typeAccessoires : (patron.typeAccessoire ? [patron.typeAccessoire] : []),
      typePatron: patron.typePatron || 'PDF',
      nomMagazine: patron.nomMagazine || '',
      numeroParution: patron.numeroParution || '',
      pages: patron.pages || '',
      titreLivre: patron.titreLivre || '',
      auteur: patron.auteur || '',
      recopie: patron.recopie || false,
      vintage: patron.vintage || false,
      typePlanche: patron.typePlanche || '',
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
            reader.onloadend = async () => {
              const compressed = await compressImage(reader.result);
              handleChange(field, compressed);
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

      const imageFields = ['imagePrincipale', 'imageTableauTailles', 'imageSchemaTechnique', 'imageSupp1', 'imageSupp2', 'imageSupp3'];
      const compressedImages = {};
      for (const f of imageFields) {
        if (formData[f] && formData[f].startsWith('data:')) {
          compressedImages[f] = await compressImage(formData[f]);
        }
      }

      const payload = {
        ...formData,
        ...compressedImages,
        metrageMin: formData.metrageMin !== '' ? Number(formData.metrageMin) : undefined,
        metrageMax: formData.metrageMax !== '' ? Number(formData.metrageMax) : undefined,
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
      const msg = error.response?.data?.message || error.message || 'Erreur inconnue';
      alert(`Erreur lors de la sauvegarde : ${msg}`);
    }
  };

  const showManches = formData.types.some(type => TYPES_AVEC_MANCHES.includes(type));
  const showLongueurs = formData.types.some(type => TYPES_AVEC_LONGUEUR.includes(type));

  const isAccessoire = formData.genres.includes('Accessoire');
  const isEnfant = formData.genres.includes('Enfant');
  const isBebe = formData.genres.includes('Bébé');
  const isAdulte = formData.genres.some(g => ['Femme', 'Homme', 'Unisexe'].includes(g));

  const SectionTitle = ({ children, icon: Icon, color, centered }) => (
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
        gap: 1.5
      }}
    >
      {children}
    </Typography>
  );

  // BLOC 1 – TextField & Autocomplete renderInput
  const roseFieldSx = {
    '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#e8e3dd', transition: 'border-color 0.2s' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#e85d75' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#e36397', borderWidth: 2 },
    '& .MuiInputLabel-root': { fontWeight: 700, color: '#e36397' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#e36397' },
    '& .MuiFormHelperText-root': { color: '#9e9e9e' },
  };

  // BLOC 1 – Select
  const roseSelectSx = {
    '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#e8e3dd', transition: 'border-color 0.2s' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#e85d75' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#e36397', borderWidth: 2 },
    minHeight: 56, minWidth: 200
  };

  // BLOC 1 – InputLabel
  const roseInputLabelSx = {
    fontWeight: 700, color: '#e36397',
    '&.Mui-focused': { color: '#e36397' }
  };

  // BLOC 2 – TextField
  const bleuFieldSx = {
    '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#e8e3dd', transition: 'border-color 0.2s' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a', borderWidth: 2 },
    '& .MuiInputLabel-root': { fontWeight: 700, color: '#33658a' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#33658a' },
    '& .MuiFormHelperText-root': { color: '#9e9e9e' },
  };

  // BLOC 2 – Select
  const bleuSelectSx = {
    '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#e8e3dd', transition: 'border-color 0.2s' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a', borderWidth: 2 },
    minHeight: 56, minWidth: 200
  };

  // BLOC 2 – InputLabel
  const bleuInputLabelSx = {
    fontWeight: 700, color: '#33658a',
    '&.Mui-focused': { color: '#33658a' }
  };

  return (
    <Paper
      elevation={0}
      sx={{ p: 4, bgcolor: 'white' }}
      onKeyDown={(e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault(); }}
    >
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 900, textAlign: 'center', mb: 4, fontSize: '2.5rem' }}>
        {patron ? 'Modifier un patron' : 'Ajouter un patron'}
      </Typography>

      {/* ── BLOC 1 : INFORMATIONS DU PATRON (ROSE) ── */}
      <Box sx={{ p: 3, mb: 4, borderRadius: 3, border: '2px solid rgba(227,99,151,0.2)', background: 'rgba(227,99,151,0.03)' }}>
        <SectionTitle icon={Info} color="#e36397">Informations du patron</SectionTitle>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>

          {/* Marque */}
          <Box>
            <Autocomplete
              freeSolo
              options={options.marques}
              value={formData.marque}
              inputValue={formData.marque}
              onChange={(_, newValue) => handleChange('marque', newValue || '')}
              onInputChange={(_, newValue) => handleChange('marque', newValue)}
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
              <HoverSelect
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
              </HoverSelect>
            </FormControl>
          </Box>

          {/* Types de vêtement ou Type d'accessoire */}
          <Box>
            {!isAccessoire ? (
              <FormControl fullWidth>
                <InputLabel sx={roseInputLabelSx}>Types de vêtement</InputLabel>
                <HoverSelect
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
                </HoverSelect>
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
                <HoverSelect
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
                </HoverSelect>
              </FormControl>
            </Box>
          )}

          {/* Longueur (conditionnel) */}
          {showLongueurs && (
            <Box>
              <FormControl fullWidth>
                <InputLabel sx={roseInputLabelSx}>Longueur</InputLabel>
                <HoverSelect
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
                </HoverSelect>
              </FormControl>
            </Box>
          )}

          {/* Type de tissu */}
          <Box>
            <FormControl fullWidth>
              <InputLabel sx={roseInputLabelSx}>Type de tissu</InputLabel>
              <HoverSelect
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
              </HoverSelect>
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
      <Box sx={{ p: 3, mb: 4, borderRadius: 3, border: '2px solid rgba(51,101,138,0.2)', background: 'rgba(51,101,138,0.03)' }}>
        <SectionTitle icon={Ruler} color="#33658a">Tailles & Infos pratiques</SectionTitle>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

          {/* ── Type de patron ── */}
          <Box sx={{ maxWidth: 280 }}>
            <FormControl fullWidth>
              <InputLabel sx={bleuInputLabelSx}>Type de patron</InputLabel>
              <HoverSelect
                value={formData.typePatron}
                onChange={(e) => handleChange('typePatron', e.target.value)}
                input={<OutlinedInput label="Type de patron" />}
                sx={bleuSelectSx}
              >
                {['PDF', 'Magazine', 'Pochette', 'Livre'].map(t => (
                  <MenuItem key={t} value={t} sx={{ fontWeight: 600 }}>{t}</MenuItem>
                ))}
              </HoverSelect>
            </FormControl>
          </Box>

          {/* ── PDF / Pochette : Formats disponibles + Langue ── */}
          {(formData.typePatron === 'PDF' || formData.typePatron === 'Pochette') && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, maxWidth: { sm: '66%' } }}>
              <FormControl fullWidth>
                <InputLabel sx={bleuInputLabelSx}>Formats disponibles</InputLabel>
                <HoverSelect
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
                </HoverSelect>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={bleuInputLabelSx}>Langue</InputLabel>
                <HoverSelect
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
                </HoverSelect>
              </FormControl>
            </Box>
          )}

          {/* ── Magazine / Livre : Langue seule ── */}
          {(formData.typePatron === 'Magazine' || formData.typePatron === 'Livre') && (
            <Box sx={{ maxWidth: 280 }}>
              <FormControl fullWidth>
                <InputLabel sx={bleuInputLabelSx}>Langue</InputLabel>
                <HoverSelect
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
                </HoverSelect>
              </FormControl>
            </Box>
          )}

          {/* ── Magazine : Nom + Numéro/date ── */}
          {formData.typePatron === 'Magazine' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth label="Nom du magazine"
                value={formData.nomMagazine}
                onChange={(e) => handleChange('nomMagazine', e.target.value)}
                sx={bleuFieldSx}
              />
              <TextField
                fullWidth label="Numéro / date de parution"
                value={formData.numeroParution}
                onChange={(e) => handleChange('numeroParution', e.target.value)}
                sx={bleuFieldSx}
              />
            </Box>
          )}

          {/* ── Livre : Titre + Auteur ── */}
          {formData.typePatron === 'Livre' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth label="Titre du livre"
                value={formData.titreLivre}
                onChange={(e) => handleChange('titreLivre', e.target.value)}
                sx={bleuFieldSx}
              />
              <TextField
                fullWidth label="Auteur"
                value={formData.auteur}
                onChange={(e) => handleChange('auteur', e.target.value)}
                sx={bleuFieldSx}
              />
            </Box>
          )}

          {/* ── Magazine / Livre : Page(s) ── */}
          {(formData.typePatron === 'Magazine' || formData.typePatron === 'Livre') && (
            <Box sx={{ maxWidth: 280 }}>
              <TextField
                fullWidth label="Page(s)"
                value={formData.pages}
                onChange={(e) => handleChange('pages', e.target.value)}
                helperText="Ex: 42, 44-48"
                sx={bleuFieldSx}
              />
            </Box>
          )}

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
                      <HoverSelect
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
                      </HoverSelect>
                    </FormControl>
                  )}
                  {isEnfant && (
                    <FormControl fullWidth>
                      <InputLabel sx={bleuInputLabelSx}>Tailles enfant</InputLabel>
                      <HoverSelect
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
                      </HoverSelect>
                    </FormControl>
                  )}
                  {isBebe && (
                    <FormControl fullWidth>
                      <InputLabel sx={bleuInputLabelSx}>Tailles bébé</InputLabel>
                      <HoverSelect
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
                      </HoverSelect>
                    </FormControl>
                  )}
                  {!isAdulte && !isEnfant && !isBebe && (
                    <FormControl fullWidth>
                      <InputLabel sx={bleuInputLabelSx}>Tailles disponibles</InputLabel>
                      <HoverSelect
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
                      </HoverSelect>
                    </FormControl>
                  )}
                </>
              )}
            </Box>
            {!isAccessoire && (
              <Box sx={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', pt: '8px' }}>
                <FormControlLabel
                  control={<Checkbox checked={formData.maTaille} onChange={(e) => handleChange('maTaille', e.target.checked)} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />}
                  label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 700, color: '#33658a' }}><Check size={14} strokeWidth={2.5} />Ma taille</Box>}
                />
              </Box>
            )}
          </Box>

          {/* ── Déjà cousu | Notes ── */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', sm: 'nowrap' }, alignItems: 'center' }}>
            <Box sx={{ flex: '0 0 auto' }}>
              <FormControlLabel
                control={<Checkbox checked={formData.cousu} onChange={(e) => handleChange('cousu', e.target.checked)} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />}
                label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 700, color: '#33658a' }}><Scissors size={14} strokeWidth={2} />Déjà cousu</Box>}
              />
            </Box>
            {formData.cousu && (
              <Box sx={{ flex: '1 1 auto' }}>
                <TextField
                  fullWidth multiline rows={3}
                  label="Notes de réalisation"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  sx={bleuFieldSx}
                />
              </Box>
            )}
          </Box>

          {/* ── Recopié | Vintage (Magazine, Pochette, Livre) ── */}
          {formData.typePatron !== 'PDF' && (
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={<Checkbox checked={formData.recopie} onChange={(e) => handleChange('recopie', e.target.checked)} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />}
                label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 700, color: '#33658a' }}><ClipboardCopy size={14} strokeWidth={2} />Recopié</Box>}
              />
              <FormControlLabel
                control={<Checkbox checked={formData.vintage} onChange={(e) => handleChange('vintage', e.target.checked)} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />}
                label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 700, color: '#33658a' }}><Clock size={14} strokeWidth={2} />Vintage</Box>}
              />
            </Box>
          )}

          {/* ── À Savoir ── */}
          <TextField
            fullWidth multiline rows={2}
            label="À Savoir"
            value={formData.aSavoir}
            onChange={(e) => handleChange('aSavoir', e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lightbulb size={18} color="#33658a" strokeWidth={2} />
                  </InputAdornment>
                )
              }
            }}
            sx={bleuFieldSx}
          />

          {/* ── Lien boutique (PDF uniquement) ── */}
          {formData.typePatron === 'PDF' && (
            <TextField
              fullWidth
              label="Lien boutique"
              value={formData.lienShop}
              onChange={(e) => handleChange('lienShop', e.target.value)}
              sx={bleuFieldSx}
            />
          )}

          {/* ── Type de planche (Magazine, Pochette, Livre) ── */}
          {formData.typePatron !== 'PDF' && (
            <Box sx={{ maxWidth: 320 }}>
              <FormControl fullWidth>
                <InputLabel sx={bleuInputLabelSx}>Type de planche</InputLabel>
                <HoverSelect
                  value={formData.typePlanche}
                  onChange={(e) => handleChange('typePlanche', e.target.value)}
                  input={<OutlinedInput label="Type de planche" />}
                  sx={bleuSelectSx}
                >
                  {['À télécharger', 'Planches fournies', 'Téléchargé'].map(t => (
                    <MenuItem key={t} value={t} sx={{ fontWeight: 600 }}>{t}</MenuItem>
                  ))}
                </HoverSelect>
              </FormControl>
            </Box>
          )}

        </Box>
      </Box>

      {/* ── BLOC 3 : IMAGES ── */}
      <Box sx={{ p: 3, mb: 4, borderRadius: 3, border: '2px solid rgba(12,186,186,0.2)', background: 'rgba(12,186,186,0.03)' }}>
        <SectionTitle icon={Image} color="#0cbaba" centered>Images</SectionTitle>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>

          <ImageField label="Image principale"   icon={Camera}    value={formData.imagePrincipale}      onChange={(v) => handleChange('imagePrincipale', v)}      onPaste={() => handlePasteFromClipboard('imagePrincipale')} />
          <ImageField label="Tableau des mesures" icon={BarChart2}  value={formData.imageTableauTailles}  onChange={(v) => handleChange('imageTableauTailles', v)}  onPaste={() => handlePasteFromClipboard('imageTableauTailles')} />
          <ImageField label="Schéma technique"    icon={Ruler}     value={formData.imageSchemaTechnique} onChange={(v) => handleChange('imageSchemaTechnique', v)} onPaste={() => handlePasteFromClipboard('imageSchemaTechnique')} />
          <ImageField label="Image supp. 1" icon={Image} value={formData.imageSupp1} onChange={(v) => handleChange('imageSupp1', v)} onPaste={() => handlePasteFromClipboard('imageSupp1')} dashed />
          <ImageField label="Image supp. 2" icon={Image} value={formData.imageSupp2} onChange={(v) => handleChange('imageSupp2', v)} onPaste={() => handlePasteFromClipboard('imageSupp2')} dashed />
          <ImageField label="Image supp. 3" icon={Image} value={formData.imageSupp3} onChange={(v) => handleChange('imageSupp3', v)} onPaste={() => handlePasteFromClipboard('imageSupp3')} dashed />

        </Box>
      </Box>

      {/* ── BLOC 4 : PDFs ── */}
      {(formData.typePatron === 'PDF' || formData.typePlanche === 'Téléchargé' || !!formData.pdfPath) && (
      <Box sx={{ p: 3, mb: 4, borderRadius: 3, border: '2px solid rgba(123,94,167,0.2)', background: 'rgba(123,94,167,0.03)' }}>
        <SectionTitle icon={FileText} color="#7b5ea7" centered>Fichiers PDF</SectionTitle>

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
                  onDelete={(e) => {
                    e.preventDefault();
                    setConfirmPdfDeleteInfo(pdf);
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
                <FileText size={16} color="#7b5ea7" strokeWidth={2} style={{ flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', fontStyle: 'italic', flex: 1, minWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.fileName}
                </Typography>
                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <HoverSelect
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
                      <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>
                    ))}
                    <MenuItem value="__autre__">Autre</MenuItem>
                  </HoverSelect>
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
                    <Pencil size={15} strokeWidth={2} />
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
          <FileText size={40} color="#7b5ea7" strokeWidth={1.5} style={{ marginBottom: 8 }} />
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
      )}

      {/* ── BOUTONS D'ACTION – EN DEHORS DES BLOCS ── */}
      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', alignItems: 'center', mt: 4, mb: 2 }}>
        {patron && onDelete && (
          <IconButton
            onClick={() => setConfirmDeleteOpen(true)}
            sx={{ bgcolor: '#e85d75', color: 'white', '&:hover': { bgcolor: '#c94a60' } }}
          >
            <Trash2 size={18} strokeWidth={2} />
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
            borderWidth: 2,
            borderColor: '#33658a',
            color: '#33658a',
            '&:hover': { borderWidth: 2, bgcolor: 'rgba(51,101,138,0.06)' }
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
            bgcolor: '#e36397',
            '&:hover': { bgcolor: '#c9547f' }
          }}
        >
          {patron ? 'Modifier' : 'Ajouter'}
        </Button>
      </Box>

      {/* Dialog confirmation suppression patron */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Supprimer ce patron ?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Cette action est irréversible. Le patron et tous ses fichiers PDF associés seront supprimés.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDeleteOpen(false)} sx={{ fontWeight: 700 }}>Annuler</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setConfirmDeleteOpen(false);
              try {
                await patronService.delete(patron._id);
                onDelete();
              } catch (err) {
                console.error('Erreur suppression:', err);
              }
            }}
            sx={{ bgcolor: '#e85d75', '&:hover': { bgcolor: '#c94a60' }, fontWeight: 700 }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog confirmation suppression PDF */}
      <Dialog open={!!confirmPdfDeleteInfo} onClose={() => setConfirmPdfDeleteInfo(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Supprimer ce PDF ?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {confirmPdfDeleteInfo?.name.replace(/\.pdf$/i, '').replace(/^[^_]+_/, '')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmPdfDeleteInfo(null)} sx={{ fontWeight: 700 }}>Annuler</Button>
          <Button
            variant="contained"
            onClick={async () => {
              const pdf = confirmPdfDeleteInfo;
              setConfirmPdfDeleteInfo(null);
              try {
                await patronService.deletePdf(patron._id, pdf.name);
                setExistingPdfs(prev => prev.filter(p => p.name !== pdf.name));
              } catch (err) {
                console.error('Erreur suppression PDF:', err);
              }
            }}
            sx={{ bgcolor: '#e85d75', '&:hover': { bgcolor: '#c94a60' }, fontWeight: 700 }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

    </Paper>
  );
}

export default PatronForm;
