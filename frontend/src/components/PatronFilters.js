import React, { useState, useEffect } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography,
  TextField, FormControl, InputLabel, Select, MenuItem,
  OutlinedInput, Checkbox, ListItemText, Button, Grid,
  FormControlLabel, Slider, Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { patronService } from '../services/api';

function PatronFilters({ onFilter }) {
  const [filters, setFilters] = useState({
    searchText: '',
    genres: [],
    types: [],
    manches: [],
    longueurs: [],
    tissuTypes: [],
    tissuSpecifique: [],
    details: [],
    taillesDisponibles: [],
    formats: { projecteur: false, a4: false, a0: false },
    metrageMin: 0,
    metrageMax: 10,
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
    formats: []
  });

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const response = await patronService.getFilterOptions();
      setOptions(response.data);
    } catch (error) {
      console.error('Erreur chargement options:', error);
    }
  };

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilter(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      searchText: '',
      genres: [],
      types: [],
      manches: [],
      longueurs: [],
      tissuTypes: [],
      tissuSpecifique: [],
      details: [],
      taillesDisponibles: [],
      formats: { projecteur: false, a4: false, a0: false },
      metrageMin: 0,
      metrageMax: 10,
      cousu: undefined
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">🔍 Filtres</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Recherche (marque, modèle, notes)"
              value={filters.searchText}
              onChange={(e) => handleChange('searchText', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Genres</InputLabel>
              <Select
                multiple
                value={filters.genres}
                onChange={(e) => handleChange('genres', e.target.value)}
                input={<OutlinedInput label="Genres" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {options.genres.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    <Checkbox checked={filters.genres.indexOf(genre) > -1} />
                    <ListItemText primary={genre} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Types</InputLabel>
              <Select
                multiple
                value={filters.types}
                onChange={(e) => handleChange('types', e.target.value)}
                input={<OutlinedInput label="Types" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {options.types.map((type) => (
                  <MenuItem key={type} value={type}>
                    <Checkbox checked={filters.types.indexOf(type) > -1} />
                    <ListItemText primary={type} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Manches</InputLabel>
              <Select
                multiple
                value={filters.manches}
                onChange={(e) => handleChange('manches', e.target.value)}
                input={<OutlinedInput label="Manches" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {options.manches.map((manche) => (
                  <MenuItem key={manche} value={manche}>
                    <Checkbox checked={filters.manches.indexOf(manche) > -1} />
                    <ListItemText primary={manche} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Longueurs</InputLabel>
              <Select
                multiple
                value={filters.longueurs}
                onChange={(e) => handleChange('longueurs', e.target.value)}
                input={<OutlinedInput label="Longueurs" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {options.longueurs.map((longueur) => (
                  <MenuItem key={longueur} value={longueur}>
                    <Checkbox checked={filters.longueurs.indexOf(longueur) > -1} />
                    <ListItemText primary={longueur} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Type de tissu</InputLabel>
              <Select
                multiple
                value={filters.tissuTypes}
                onChange={(e) => handleChange('tissuTypes', e.target.value)}
                input={<OutlinedInput label="Type de tissu" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {options.tissuTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    <Checkbox checked={filters.tissuTypes.indexOf(type) > -1} />
                    <ListItemText primary={type} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Tissus spécifiques</InputLabel>
              <Select
                multiple
                value={filters.tissuSpecifique}
                onChange={(e) => handleChange('tissuSpecifique', e.target.value)}
                input={<OutlinedInput label="Tissus spécifiques" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {options.tissuSpecifique.map((tissu) => (
                  <MenuItem key={tissu} value={tissu}>
                    <Checkbox checked={filters.tissuSpecifique.indexOf(tissu) > -1} />
                    <ListItemText primary={tissu} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Détails</InputLabel>
              <Select
                multiple
                value={filters.details}
                onChange={(e) => handleChange('details', e.target.value)}
                input={<OutlinedInput label="Détails" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {options.details.map((detail) => (
                  <MenuItem key={detail} value={detail}>
                    <Checkbox checked={filters.details.indexOf(detail) > -1} />
                    <ListItemText primary={detail} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Tailles</InputLabel>
              <Select
                multiple
                value={filters.taillesDisponibles}
                onChange={(e) => handleChange('taillesDisponibles', e.target.value)}
                input={<OutlinedInput label="Tailles" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {options.taillesDisponibles.map((taille) => (
                  <MenuItem key={taille} value={taille}>
                    <Checkbox checked={filters.taillesDisponibles.indexOf(taille) > -1} />
                    <ListItemText primary={taille} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography gutterBottom>Métrage (mètres)</Typography>
            <Slider
              value={[filters.metrageMin, filters.metrageMax]}
              onChange={(e, value) => {
                handleChange('metrageMin', value[0]);
                handleChange('metrageMax', value[1]);
              }}
              valueLabelDisplay="auto"
              min={0}
              max={10}
              step={0.1}
              marks={[
                { value: 0, label: '0m' },
                { value: 5, label: '5m' },
                { value: 10, label: '10m' }
              ]}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.cousu === true}
                  onChange={(e) => handleChange('cousu', e.target.checked ? true : undefined)}
                />
              }
              label="Déjà cousu uniquement"
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2}>
              <Button variant="contained" onClick={handleApplyFilters} fullWidth>
                Appliquer les filtres
              </Button>
              <Button variant="outlined" onClick={handleReset} fullWidth>
                Réinitialiser
              </Button>
            </Box>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}

export default PatronFilters;