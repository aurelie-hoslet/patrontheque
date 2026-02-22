import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Grid, FormControl, InputLabel, Select,
  MenuItem, OutlinedInput, Checkbox, ListItemText, Typography,
  Paper, Chip, FormControlLabel, Divider
} from '@mui/material';
import { patronService } from '../services/api';

const GENRES = ['Femme', 'Homme', 'Enfant', 'Bébé', 'Unisexe', 'Accessoire'];
const TYPES = ['Blouse', 'Body', 'Boxer', 'Chemise', 'Chemisier', 'Combi', 'Culotte',
  'Débardeur', 'Gilet', 'Jean', 'Jupe', 'Jupe-Culotte', 'Legging', 'Maillot De Bain',
  'Manteau', 'Marinière', 'Nuit', 'Pantalon', 'Paréo', 'Peignoir', 'Polo', 'Pull',
  'Robe', 'Salopette', 'Short', 'Soutien-Gorge', 'Sweat', 'Sweat Zippé', 'Tee-Shirt',
  'Top', 'Veste'];
const MANCHES = ['Manches Longues', 'Manches Courtes', 'Sans Manches'];
const LONGUEURS = ['Courte', 'Genou', 'Longue'];
const TISSU_TYPES = ['Chaîne et trame', 'Maille'];
const TAILLES = ['XS', 'S', 'M', 'L', 'XL', '2X', '3X', '4X+'];

function PatronForm({ patron, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    marque: '',
    modele: '',
    genres: [],
    types: [],
    typeAccessoire: '',
    manches: [],
    longueurs: [],
    tissuTypes: [],
    tissuSpecifique: [],
    details: [],
    taillesIndiquees: '',
    taillesDisponibles: [],
    metrageMin: '',
    metrageMax: '',
    formats: { projecteur: false, a4: false, a0: false },
    maTaille: false,
    cousu: false,
    notes: '',
    lienShop: '',
    imagePrincipale: '',
    imageTableauTailles: '',
    imageSchemaTechnique: ''
  });

  const [tissuInput, setTissuInput] = useState('');
  const [detailInput, setDetailInput] = useState('');
  const [options, setOptions] = useState({ tissuSpecifique: [], details: [] });

  useEffect(() => {
    if (patron) {
      setFormData({
        ...patron,
        metrageMin: patron.metrageMin || '',
        metrageMax: patron.metrageMax || ''
      });
    }
    loadOptions();
  }, [patron]);

  const loadOptions = async () => {
    try {
      const response = await patronService.getFilterOptions();
      setOptions({
        tissuSpecifique: response.data.tissuSpecifique || [],
        details: response.data.details || []
      });
    } catch (error) {
      console.error('Erreur chargement options:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddTag = (field, value, inputSetter) => {
    if (value && !formData[field].includes(value)) {
      handleChange(field, [...formData[field], value]);
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
      if (patron) {
        await patronService.update(patron._id, formData);
      } else {
        await patronService.create(formData);
      }
      onSave();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const showManches = formData.types.some(type =>
    ['Robe', 'Top', 'Combi', 'Salopette', 'Chemise', 'Blouse', 'Tee-Shirt',
      'Marinière', 'Sweat', 'Sweat Zippé', 'Débardeur', 'Body', 'Chemisier',
      'Pull', 'Gilet', 'Nuit', 'Polo'].includes(type)
  );

  const showLongueurs = formData.types.some(type =>
    ['Robe', 'Jupe', 'Combi', 'Salopette'].includes(type)
  );

  const isAccessoire = formData.genres.includes('Accessoire');

  const SectionTitle = ({ children, emoji, color }) => (
    <Typography
      variant="h5"
      sx={{
        fontWeight: 800,
        color: color,
        mb: 3,
        mt: 4,
        pb: 1,
        borderBottom: `4px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}
    >
      <span style={{ fontSize: '1.5em' }}>{emoji}</span>
      {children}
    </Typography>
  );

  return (
    <Paper elevation={3} sx={{ p: 4, background: 'linear-gradient(135deg, #fef9ff 0%, #fff5f8 100%)' }}>

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 900, textAlign: 'center', mb: 4, fontSize: '2.5rem' }}>
        {patron ? '✨ Modifier un patron ✨' : '🦄 Ajouter un patron 🦄'}
      </Typography>

      {/* SECTION 1: INFORMATIONS DE BASE */}
      <Box sx={{ p: 3, mb: 4, borderRadius: 3, border: '3px solid #FFB6D9', background: '#FFF0F7' }}>
        <SectionTitle emoji="📝" color="#FF69B4">Informations de base</SectionTitle>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Marque"
              value={formData.marque}
              onChange={(e) => handleChange('marque', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderWidth: 3, borderColor: '#FF69B4' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderWidth: 3, borderColor: '#FF1493' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FF69B4', borderWidth: 5 }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Modèle"
              value={formData.modele}
              onChange={(e) => handleChange('modele', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderWidth: 3, borderColor: '#FF69B4' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderWidth: 3, borderColor: '#FF1493' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FF69B4', borderWidth: 5 }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Genres</InputLabel>
              <Select
                multiple
                value={formData.genres}
                onChange={(e) => handleChange('genres', e.target.value)}
                input={<OutlinedInput label="Genres" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="medium" sx={{ bgcolor: '#FFE4F0', fontWeight: 700, fontSize: '0.95rem' }} />
                    ))}
                  </Box>
                )}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderWidth: 3, borderColor: '#FF69B4' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderWidth: 3, borderColor: '#FF1493' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FF69B4', borderWidth: 5 },
                  minHeight: 56, minWidth: 200
                }}
              >
                {GENRES.map((genre) => (
                  <MenuItem key={genre} value={genre} sx={{ fontSize: '1.05rem', py: 1.5 }}>
                    <Checkbox checked={formData.genres.indexOf(genre) > -1} />
                    <ListItemText primary={genre} sx={{ '& .MuiTypography-root': { fontWeight: 600, fontSize: '1.05rem' } }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {!isAccessoire && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 700 }}>Types de vêtement</InputLabel>
                <Select
                  multiple
                  value={formData.types}
                  onChange={(e) => handleChange('types', e.target.value)}
                  input={<OutlinedInput label="Types de vêtement" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} sx={{ bgcolor: '#FFE4F0', fontWeight: 700 }} />
                      ))}
                    </Box>
                  )}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderWidth: 3, borderColor: '#FF69B4' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderWidth: 3, borderColor: '#FF1493' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FF69B4', borderWidth: 5 },
                    minHeight: 56, minWidth: 200
                  }}
                >
                  {TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      <Checkbox checked={formData.types.indexOf(type) > -1} />
                      <ListItemText primary={type} sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {isAccessoire && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Type d'accessoire"
                value={formData.typeAccessoire}
                onChange={(e) => handleChange('typeAccessoire', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderWidth: 3, borderColor: '#FF69B4' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderWidth: 3, borderColor: '#FF1493' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FF69B4', borderWidth: 5 },
                  minHeight: 56, minWidth: 200, fontWeight:600
                }}
              />
            </Grid>
          )}
        </Grid>
      </Box>

      {/* SECTION 2: CARACTÉRISTIQUES */}
      <Box sx={{ p: 3, mb: 4, borderRadius: 3, border: '3px solid #A8E6CF', background: '#F0FFF4' }}>
        <SectionTitle emoji="✂️" color="#4CAF50">Caractéristiques</SectionTitle>

        <Grid container spacing={3}>
          {showManches && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 700 }}>Longueur des manches</InputLabel>
                <Select
                  multiple
                  value={formData.manches}
                  onChange={(e) => handleChange('manches', e.target.value)}
                  input={<OutlinedInput label="Longueur des manches" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} sx={{ bgcolor: '#D4EDDA', fontWeight: 700 }} />
                      ))}
                    </Box>
                  )}
                  sx={{minHeight:56, minWidth:200}}
                >
                  {MANCHES.map((manche) => (
                    <MenuItem key={manche} value={manche}>
                      <Checkbox checked={formData.manches.indexOf(manche) > -1} />
                      <ListItemText primary={manche} sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {showLongueurs && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 700 }}>Longueur</InputLabel>
                <Select
                  multiple
                  value={formData.longueurs}
                  onChange={(e) => handleChange('longueurs', e.target.value)}
                  input={<OutlinedInput label="Longueur" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} sx={{ bgcolor: '#D4EDDA', fontWeight: 700 }} />
                      ))}
                    </Box>
                  )}
                  sx={{minHeight:56, minWidth:200}}
                >
                  {LONGUEURS.map((longueur) => (
                    <MenuItem key={longueur} value={longueur}>
                      <Checkbox checked={formData.longueurs.indexOf(longueur) > -1} />
                      <ListItemText primary={longueur} sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontWeight: 700 }}>Type de tissu</InputLabel>
              <Select
                multiple
                value={formData.tissuTypes}
                onChange={(e) => handleChange('tissuTypes', e.target.value)}
                input={<OutlinedInput label="Type de tissu" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} sx={{ bgcolor: '#D4EDDA', fontWeight: 700 }} />
                    ))}
                  </Box>
                )}
                sx={{minHeight:56, minWidth:200}}
              >
                {TISSU_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    <Checkbox checked={formData.tissuTypes.indexOf(type) > -1} />
                    <ListItemText primary={type} sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Ajouter un tissu spécifique"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag('tissuSpecifique', tissuInput, setTissuInput);
                }
              }}
              helperText="Appuyez sur Entrée pour ajouter"
              sx={{ '& .MuiOutlinedInput-root': { fontWeight: 600, '& fieldset': { borderWidth: 3, borderColor: '#A8E6CF' } } }}
            />
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.tissuSpecifique.map((tissu) => (
                <Chip
                  key={tissu}
                  label={tissu}
                  onDelete={() => handleRemoveTag('tissuSpecifique', tissu)}
                  sx={{ bgcolor: '#A8E6CF', fontWeight: 700, fontSize: '0.9rem' }}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.details.map((detail) => (
                <Chip
                  key={detail}
                  label={detail}
                  onDelete={() => handleRemoveTag('details', detail)}
                  sx={{ bgcolor: '#A8E6CF', fontWeight: 700, fontSize: '0.9rem' }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* SECTION 3: TAILLES & MÉTRAGE */}
      <Box sx={{
        '& .MuiOutlinedInput-root': {
          fontWeight: 600,
          '& fieldset': { borderWidth: 3, borderColor: '#FFD3B6' },
          '&:hover fieldset': { borderColor: '#FF9800' },
          '&.Mui-focused fieldset': { borderColor: '#FF9800', borderWidth: 3 }
        }
      }}>
        <SectionTitle emoji="📏" color="#FF9800">Tailles & Métrage</SectionTitle>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tailles indiquées"
              value={formData.taillesIndiquees}
              onChange={(e) => handleChange('taillesIndiquees', e.target.value)}
              helperText="Ex: 34-46 EU, 14-24 US"
              sx={{ '& .MuiOutlinedInput-root': { fontWeight: 600 } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontWeight: 700 }}>Tailles disponibles</InputLabel>
              <Select
                multiple
                value={formData.taillesDisponibles}
                onChange={(e) => handleChange('taillesDisponibles', e.target.value)}
                input={<OutlinedInput label="Tailles disponibles" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} sx={{ bgcolor: '#FFE4CC', fontWeight: 700 }} />
                    ))}
                  </Box>
                )}
                sx={{minHeight:56, minWidth:200}}
              >
                {TAILLES.map((taille) => (
                  <MenuItem key={taille} value={taille}>
                    <Checkbox checked={formData.taillesDisponibles.indexOf(taille) > -1} />
                    <ListItemText primary={taille} sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Métrage minimum (m)"
              value={formData.metrageMin}
              onChange={(e) => handleChange('metrageMin', e.target.value ? parseFloat(e.target.value) : '')}
              inputProps={{ step: 0.1, min: 0 }}
              sx={{ '& .MuiOutlinedInput-root': { fontWeight: 600 } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Métrage maximum (m)"
              value={formData.metrageMax}
              onChange={(e) => handleChange('metrageMax', e.target.value ? parseFloat(e.target.value) : '')}
              inputProps={{ step: 0.1, min: 0 }}
              sx={{ '& .MuiOutlinedInput-root': { fontWeight: 600 } }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* SECTION 4: FORMATS & OPTIONS */}
      <Box sx={{ p: 3, mb: 4, borderRadius: 3, border: '3px solid #B6E0FF', background: '#F0F8FF' }}>
        <SectionTitle emoji="⚙️" color="#2196F3">Formats & Options</SectionTitle>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Formats disponibles</Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.formats.projecteur}
                    onChange={(e) => handleChange('formats', { ...formData.formats, projecteur: e.target.checked })}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                  />
                }
                label={<span style={{ fontWeight: 700, fontSize: '1.1rem' }}>📽️ Projecteur</span>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.formats.a4}
                    onChange={(e) => handleChange('formats', { ...formData.formats, a4: e.target.checked })}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                  />
                }
                label={<span style={{ fontWeight: 700, fontSize: '1.1rem' }}>📄 A4</span>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.formats.a0}
                    onChange={(e) => handleChange('formats', { ...formData.formats, a0: e.target.checked })}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                  />
                }
                label={<span style={{ fontWeight: 700, fontSize: '1.1rem' }}>📋 A0</span>}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Options personnelles</Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.maTaille}
                    onChange={(e) => handleChange('maTaille', e.target.checked)}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                  />
                }
                label={<span style={{ fontWeight: 700, fontSize: '1.1rem' }}>✅ Ma taille</span>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.cousu}
                    onChange={(e) => handleChange('cousu', e.target.checked)}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                  />
                }
                label={<span style={{ fontWeight: 700, fontSize: '1.1rem' }}>✂️ Déjà cousu</span>}
              />
            </Box>
          </Grid>

          {formData.cousu && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes de réalisation"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { fontWeight: 600 } }}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Lien boutique"
              value={formData.lienShop}
              onChange={(e) => handleChange('lienShop', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { fontWeight: 600 } }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* SECTION 5: IMAGES */}
      <Box sx={{ p: 3, mb: 4, borderRadius: 3, border: '3px solid #E1BEE7', background: '#F9F0FF' }}>
        <SectionTitle emoji="🖼️" color="#9C27B0">Images</SectionTitle>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#9C27B0' }}>📸 Image principale</Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button variant="outlined" onClick={() => handlePasteFromClipboard('imagePrincipale')}>
                📋 Coller du presse-papier
              </Button>
            </Box>
            {formData.imagePrincipale && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 2, border: '2px solid #E1BEE7' }}>
                <img src={formData.imagePrincipale} alt="Aperçu" style={{ maxWidth: 200, borderRadius: 8 }} />
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#9C27B0' }}>📊 Tableau des tailles</Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button variant="outlined" onClick={() => handlePasteFromClipboard('imageTableauTailles')}>
                  📋 Coller du presse-papier
                </Button>
              </Box>
            </Box>
            {formData.imageTableauTailles && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 2, border: '2px solid #E1BEE7' }}>
                <img src={formData.imageTableauTailles} alt="Tableau" style={{ maxWidth: 200, borderRadius: 8 }} />
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#9C27B0' }}>📐 Schéma technique</Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button variant="outlined" onClick={() => handlePasteFromClipboard('imageSchemaTechnique')}>
                  📋 Coller du presse-papier
                </Button>
              </Box>
            </Box>
            {formData.imageSchemaTechnique && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 2, border: '2px solid #E1BEE7' }}>
                <img src={formData.imageSchemaTechnique} alt="Schéma" style={{ maxWidth: 200, borderRadius: 8 }} />
              </Box>
            )}


            {/* BOUTONS D'ACTION */}
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 5 }}>
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
                  borderColor: '#FF9800',
                  color: '#FF9800',
                  '&:hover': { borderWidth: 3, bgcolor: '#FFF3E0' }
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                variant="contained"
                size="large"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  px: 5,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #FF69B4 30%, #FFB6D9 90%)',
                  boxShadow: '0 3px 5px 2px rgba(255, 105, 180, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF1493 30%, #FF69B4 90%)',
                  }
                }}
              >
                {patron ? '✨ Modifier ✨' : '🦄 Ajouter 🦄'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}
export default PatronForm;
