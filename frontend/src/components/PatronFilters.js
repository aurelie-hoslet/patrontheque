import React, { useState, useEffect } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography,
  TextField, FormControl, InputLabel, Select, MenuItem,
  OutlinedInput, Checkbox, ListItemText, Button,
  FormControlLabel, ToggleButton, ToggleButtonGroup, Box
} from '@mui/material';
import { ChevronDown, SlidersHorizontal, Scissors } from 'lucide-react';
import { patronService } from '../services/api';

const FILTRES_ACTIFS = true;

const TYPES_AVEC_MANCHES = [
  'Robe', 'Top', 'Combi', 'Salopette', 'Chemise', 'Blouse', 'Tee-Shirt',
  'Marinière', 'Sweat', 'Sweat Zippé', 'Débardeur', 'Body', 'Chemisier',
  'Pull', 'Gilet', 'Nuit', 'Polo'
];
const TYPES_AVEC_LONGUEUR = ['Robe', 'Jupe', 'Combi', 'Salopette'];

const METRAGE_RANGES = [
  { label: '< 1m',  value: '<1',  min: 0, max: 1 },
  { label: '1–2m',  value: '1-2', min: 1, max: 2 },
  { label: '2–3m',  value: '2-3', min: 2, max: 3 },
  { label: '3–4m',  value: '3-4', min: 3, max: 4 },
  { label: '4–5m',  value: '4-5', min: 4, max: 5 },
  { label: '5m +',  value: '5+',  min: 5, max: 99 },
];

const filterSelectSx = {
  '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#e8e3dd', transition: 'border-color 0.2s' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a', borderWidth: 2 },
  minHeight: 56,
};

const filterInputLabelSx = {
  fontWeight: 600, color: '#6b6158',
  '&.Mui-focused': { color: '#33658a' }
};

const filterFieldSx = {
  '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#e8e3dd', transition: 'border-color 0.2s' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a', borderWidth: 2 },
  '& .MuiInputLabel-root': { fontWeight: 600, color: '#6b6158' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#33658a' },
};

function PatronFilters({ onFilter }) {
  const [filters, setFilters] = useState({
    searchText: '',
    langues: [],
    genres: [],
    types: [],
    typeAccessoires: [],
    manches: [],
    longueurs: [],
    tissuTypes: [],
    tissuSpecifique: [],
    details: [],
    taillesDisponibles: [],
    taillesEnfant: [],
    formats: { projecteur: false, a4: false, a0: false },
    metrageRanges: [],
    cousu: undefined
  });

  const [options, setOptions] = useState({
    genres: [],
    types: [],
    manches: [],
    longueurs: [],
    tissuTypes: [],
    tissuSpecifique: [],
    details: [],
    taillesDisponibles: [],
    taillesEnfant: [],
    formats: []
  });

  useEffect(() => {
    loadOptions();
  }, []);

  const buildBackendFilters = (f) => {
    const { metrageRanges, ...rest } = f;
    if (!metrageRanges || metrageRanges.length === 0) return rest;
    const selected = METRAGE_RANGES.filter(r => metrageRanges.includes(r.value));
    return { ...rest, metrageRanges: selected.map(r => ({ min: r.min, max: r.max })) };
  };

  useEffect(() => {
    if (FILTRES_ACTIFS) onFilter(buildBackendFilters(filters));
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOptions = async () => {
    try {
      const response = await patronService.getFilterOptions();
      setOptions(response.data);
    } catch (error) {
      console.error('Erreur chargement options:', error);
    }
  };

  const isTypeDisabled = (type) => {
    if (filters.manches.length > 0 && !TYPES_AVEC_MANCHES.includes(type)) return true;
    if (filters.longueurs.length > 0 && !TYPES_AVEC_LONGUEUR.includes(type)) return true;
    return false;
  };

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
  };

  const handleGenresChange = (newGenres) => {
    const wasAccessoire = filters.genres.includes('Accessoire');
    const isNowAccessoire = newGenres.includes('Accessoire');
    const wasEnfant = filters.genres.some(g => g === 'Enfant' || g === 'Bébé');
    const isNowEnfant = newGenres.some(g => g === 'Enfant' || g === 'Bébé');

    const updates = { genres: newGenres };
    if (!wasAccessoire && isNowAccessoire) {
      updates.types = [];
      updates.manches = [];
      updates.longueurs = [];
    } else if (wasAccessoire && !isNowAccessoire) {
      updates.typeAccessoires = [];
    }
    if (!wasEnfant && isNowEnfant) {
      updates.taillesDisponibles = [];
    } else if (wasEnfant && !isNowEnfant) {
      updates.taillesEnfant = [];
    }
    setFilters({ ...filters, ...updates });
  };

  const handleApplyFilters = () => {
    if (FILTRES_ACTIFS) onFilter(buildBackendFilters(filters));
  };

  const handleReset = () => {
    const resetFilters = {
      searchText: '',
      langues: [],
      genres: [],
      types: [],
      typeAccessoires: [],
      manches: [],
      longueurs: [],
      tissuTypes: [],
      tissuSpecifique: [],
      details: [],
      taillesDisponibles: [],
      taillesEnfant: [],
      formats: { projecteur: false, a4: false, a0: false },
      metrageRanges: [],
      cousu: undefined
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  const hasActiveFilters = filters.searchText || filters.langues.length > 0 || filters.genres.length > 0
    || filters.types.length > 0 || filters.typeAccessoires.length > 0 || filters.manches.length > 0
    || filters.longueurs.length > 0 || filters.tissuTypes.length > 0 || filters.tissuSpecifique.length > 0
    || filters.details.length > 0 || filters.taillesDisponibles.length > 0 || filters.taillesEnfant.length > 0
    || filters.metrageRanges.length > 0 || filters.cousu;

  const grid3 = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 };

  return (
    <Accordion
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '12px !important',
        border: hasActiveFilters ? '1.5px solid #33658a' : '1.5px solid rgba(26,19,10,0.07)',
        boxShadow: '0 2px 8px rgba(26,19,10,0.06)',
        mb: 2,
        '&:before': { display: 'none' }
      }}
    >
      <AccordionSummary
        expandIcon={<ChevronDown size={20} color="#33658a" />}
        sx={{ borderRadius: '12px', '&.Mui-expanded': { borderBottom: '1.5px solid rgba(26,19,10,0.07)' } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SlidersHorizontal size={18} color="#33658a" strokeWidth={2} />
          <Typography variant="subtitle1" sx={{ color: '#33658a', fontWeight: 700 }}>Filtres</Typography>
          {hasActiveFilters && (
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#e36397' }} />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Ligne 1 : Recherche | Déjà cousu | Langue */}
          <Box sx={grid3}>
            <TextField
              fullWidth
              label="Recherche (marque, modèle, notes)"
              value={filters.searchText}
              onChange={(e) => handleChange('searchText', e.target.value)}
              sx={filterFieldSx}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.cousu === true}
                    onChange={(e) => handleChange('cousu', e.target.checked ? true : undefined)}
                    sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Scissors size={14} color="#33658a" strokeWidth={2} />
                    <span style={{ fontWeight: 600, color: '#33658a', fontSize: '0.88rem' }}>Déjà cousu</span>
                  </Box>
                }
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel sx={filterInputLabelSx}>Langue</InputLabel>
              <Select multiple value={filters.langues}
                onChange={(e) => handleChange('langues', e.target.value)}
                input={<OutlinedInput label="Langue" />}
                renderValue={(selected) => selected.join(', ')}
                sx={filterSelectSx}>
                {['Français', 'Anglais', 'Allemand', 'Autre'].map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    <Checkbox checked={filters.langues.indexOf(lang) > -1} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
                    <ListItemText primary={lang} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Ligne 2 : Genre | Type | Tailles */}
          <Box sx={grid3}>
            <FormControl fullWidth>
              <InputLabel sx={filterInputLabelSx}>Genres</InputLabel>
              <Select multiple value={filters.genres}
                onChange={(e) => handleGenresChange(e.target.value)}
                input={<OutlinedInput label="Genres" />}
                renderValue={(selected) => selected.join(', ')}
                sx={filterSelectSx}>
                {options.genres.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    <Checkbox checked={filters.genres.indexOf(genre) > -1} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
                    <ListItemText primary={genre} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {filters.genres.includes('Accessoire') ? (
              <FormControl fullWidth>
                <InputLabel sx={filterInputLabelSx}>Type d'accessoire</InputLabel>
                <Select multiple value={filters.typeAccessoires}
                  onChange={(e) => handleChange('typeAccessoires', e.target.value)}
                  input={<OutlinedInput label="Type d'accessoire" />}
                  renderValue={(selected) => selected.join(', ')}
                  sx={filterSelectSx}>
                  {(options.typeAccessoires || []).map((type) => (
                    <MenuItem key={type} value={type}>
                      <Checkbox checked={filters.typeAccessoires.indexOf(type) > -1} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
                      <ListItemText primary={type} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <FormControl fullWidth>
                <InputLabel sx={filterInputLabelSx}>Types</InputLabel>
                <Select multiple value={filters.types}
                  onChange={(e) => handleChange('types', e.target.value)}
                  input={<OutlinedInput label="Types" />}
                  renderValue={(selected) => selected.join(', ')}
                  sx={filterSelectSx}>
                  {options.types.map((type) => (
                    <MenuItem key={type} value={type} disabled={isTypeDisabled(type)}>
                      <Checkbox checked={filters.types.indexOf(type) > -1} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
                      <ListItemText primary={type} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {filters.genres.some(g => g === 'Enfant' || g === 'Bébé') ? (
              <FormControl fullWidth>
                <InputLabel sx={filterInputLabelSx}>Tailles enfant</InputLabel>
                <Select multiple value={filters.taillesEnfant}
                  onChange={(e) => handleChange('taillesEnfant', e.target.value)}
                  input={<OutlinedInput label="Tailles enfant" />}
                  renderValue={(selected) => selected.join(', ')}
                  sx={filterSelectSx}>
                  {(options.taillesEnfant || []).map((taille) => (
                    <MenuItem key={taille} value={taille}>
                      <Checkbox checked={filters.taillesEnfant.indexOf(taille) > -1} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
                      <ListItemText primary={taille} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <FormControl fullWidth>
                <InputLabel sx={filterInputLabelSx}>Tailles adulte</InputLabel>
                <Select multiple value={filters.taillesDisponibles}
                  onChange={(e) => handleChange('taillesDisponibles', e.target.value)}
                  input={<OutlinedInput label="Tailles adulte" />}
                  renderValue={(selected) => selected.join(', ')}
                  sx={filterSelectSx}>
                  {options.taillesDisponibles.map((taille) => (
                    <MenuItem key={taille} value={taille}>
                      <Checkbox checked={filters.taillesDisponibles.indexOf(taille) > -1} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
                      <ListItemText primary={taille} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>

          {/* Ligne 3 : Manches | Longueurs | Détails */}
          <Box sx={grid3}>
            <FormControl fullWidth>
              <InputLabel sx={filterInputLabelSx}>Manches</InputLabel>
              <Select multiple value={filters.manches}
                onChange={(e) => handleChange('manches', e.target.value)}
                input={<OutlinedInput label="Manches" />}
                renderValue={(selected) => selected.join(', ')}
                sx={filterSelectSx}>
                {options.manches.map((manche) => (
                  <MenuItem key={manche} value={manche}>
                    <Checkbox checked={filters.manches.indexOf(manche) > -1} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
                    <ListItemText primary={manche} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={filterInputLabelSx}>Longueurs</InputLabel>
              <Select multiple value={filters.longueurs}
                onChange={(e) => handleChange('longueurs', e.target.value)}
                input={<OutlinedInput label="Longueurs" />}
                renderValue={(selected) => selected.join(', ')}
                sx={filterSelectSx}>
                {options.longueurs.map((longueur) => (
                  <MenuItem key={longueur} value={longueur}>
                    <Checkbox checked={filters.longueurs.indexOf(longueur) > -1} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
                    <ListItemText primary={longueur} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={filterInputLabelSx}>Détails</InputLabel>
              <Select multiple value={filters.details}
                onChange={(e) => handleChange('details', e.target.value)}
                input={<OutlinedInput label="Détails" />}
                renderValue={(selected) => selected.join(', ')}
                sx={filterSelectSx}>
                {options.details.map((detail) => (
                  <MenuItem key={detail} value={detail}>
                    <Checkbox checked={filters.details.indexOf(detail) > -1} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
                    <ListItemText primary={detail} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Ligne 4 : Type de tissu | Métrage | Besoin spécifique */}
          <Box sx={grid3}>
            <FormControl fullWidth>
              <InputLabel sx={filterInputLabelSx}>Type de tissu</InputLabel>
              <Select multiple value={filters.tissuTypes}
                onChange={(e) => handleChange('tissuTypes', e.target.value)}
                input={<OutlinedInput label="Type de tissu" />}
                renderValue={(selected) => selected.join(', ')}
                sx={filterSelectSx}>
                {options.tissuTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    <Checkbox checked={filters.tissuTypes.indexOf(type) > -1} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
                    <ListItemText primary={type} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ToggleButtonGroup
                value={filters.metrageRanges}
                onChange={(e, val) => handleChange('metrageRanges', val)}
                sx={{ flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}
              >
                {METRAGE_RANGES.map(r => (
                  <ToggleButton key={r.value} value={r.value}
                    sx={{
                      fontWeight: 700, borderColor: '#e8e3dd', color: '#33658a', borderWidth: 2,
                      borderRadius: '20px !important',
                      '&.Mui-selected': { bgcolor: '#33658a', color: '#fff', borderColor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' } },
                      '&:hover': { bgcolor: '#f7f3ee' }
                    }}>
                    {r.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <FormControl fullWidth>
              <InputLabel sx={filterInputLabelSx}>Besoins spécifiques</InputLabel>
              <Select multiple value={filters.tissuSpecifique}
                onChange={(e) => handleChange('tissuSpecifique', e.target.value)}
                input={<OutlinedInput label="Besoins spécifiques" />}
                renderValue={(selected) => selected.join(', ')}
                sx={filterSelectSx}>
                {options.tissuSpecifique.map((tissu) => (
                  <MenuItem key={tissu} value={tissu}>
                    <Checkbox checked={filters.tissuSpecifique.indexOf(tissu) > -1} sx={{ color: '#33658a', '&.Mui-checked': { color: '#33658a' } }} />
                    <ListItemText primary={tissu} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Boutons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleApplyFilters} fullWidth
              sx={{ fontWeight: 700, bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' }, borderRadius: 2 }}>
              Appliquer les filtres
            </Button>
            <Button variant="outlined" onClick={handleReset} fullWidth
              sx={{ fontWeight: 700, borderWidth: 2, borderColor: '#33658a', color: '#33658a', borderRadius: 2, '&:hover': { borderWidth: 2, bgcolor: '#f0f6fb' } }}>
              Réinitialiser
            </Button>
          </Box>

        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

export default PatronFilters;
