import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  Shirt, Layers, ClipboardList, Images,
  Store, Sparkles, Bookmark, PersonStanding, ArrowRight, Plus
} from 'lucide-react';
import { useSettings, getFontFamily, TITLE_FONT } from '../context/SettingsContext';

const MODULES = [
  {
    label: 'Les Patrons',
    icon: Shirt,
    tab: 1,
    color: '#e36397',
    bg: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
    bgDark: 'linear-gradient(135deg, #2a1520 0%, #3a1a28 100%)',
    emptyLabel: 'Ajouter votre premier patron',
    countLabel: (n) => `${n} patron${n > 1 ? 's' : ''}`,
  },
  {
    label: 'Les Tissus',
    icon: Layers,
    tab: 2,
    color: '#33658a',
    bg: 'linear-gradient(135deg, #e3f0f8 0%, #bbdefb 100%)',
    bgDark: 'linear-gradient(135deg, #0d1f2d 0%, #0d2a3a 100%)',
    emptyLabel: 'Ajouter votre premier tissu',
    countLabel: (n) => `${n} tissu${n > 1 ? 'x' : ''}`,
  },
  {
    label: 'Projets',
    icon: ClipboardList,
    tab: 3,
    color: '#0cbaba',
    bg: 'linear-gradient(135deg, #e0f7f7 0%, #b2ebf2 100%)',
    bgDark: 'linear-gradient(135deg, #071e1e 0%, #0d2a2a 100%)',
    emptyLabel: 'Démarrer un projet',
    countLabel: (n) => `${n} projet${n > 1 ? 's' : ''}`,
  },
  {
    label: 'Galerie',
    icon: Images,
    tab: 4,
    color: '#ff8b60',
    bg: 'linear-gradient(135deg, #fff0e8 0%, #ffccbc 100%)',
    bgDark: 'linear-gradient(135deg, #2a1408 0%, #3a1a0a 100%)',
    emptyLabel: 'Voir la galerie',
    countLabel: (n) => `${n} réalisation${n > 1 ? 's' : ''}`,
  },
  {
    label: 'Carnet d\'adresses',
    icon: Store,
    tab: 5,
    color: '#7b5ea7',
    bg: 'linear-gradient(135deg, #ede7f6 0%, #d1c4e9 100%)',
    bgDark: 'linear-gradient(135deg, #1a0f2a 0%, #231536 100%)',
    emptyLabel: 'Ajouter un dealer',
    countLabel: (n) => `${n} dealer${n > 1 ? 's' : ''}`,
  },
  {
    label: 'Inspirations',
    icon: Sparkles,
    tab: 6,
    color: '#e36397',
    bg: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
    bgDark: 'linear-gradient(135deg, #2a1520 0%, #3a1a28 100%)',
    emptyLabel: 'Ajouter des inspirations',
    countLabel: () => 'Mes inspirations',
  },
  {
    label: 'Wish List',
    icon: Bookmark,
    tab: 7,
    color: '#33658a',
    bg: 'linear-gradient(135deg, #e3f0f8 0%, #bbdefb 100%)',
    bgDark: 'linear-gradient(135deg, #0d1f2d 0%, #0d2a3a 100%)',
    emptyLabel: 'Créer une wish list',
    countLabel: () => 'Ma wish list',
  },
  {
    label: 'Mensurations',
    icon: PersonStanding,
    tab: 8,
    color: '#e36397',
    bg: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
    bgDark: 'linear-gradient(135deg, #2a1520 0%, #3a1a28 100%)',
    emptyLabel: 'Créer un profil',
    countLabel: (n) => `${n} profil${n > 1 ? 's' : ''}`,
  },
];

function ModuleCard({ mod, count, onNavigate, isDark }) {
  const { settings } = useSettings();
  const font = getFontFamily(settings.font);
  const Icon = mod.icon;
  const isEmpty = count === 0;
  const unknownCount = count === null;

  return (
    <Box
      onClick={() => onNavigate(mod.tab)}
      sx={{
        background: isDark ? mod.bgDark : mod.bg,
        border: `1.5px solid ${mod.color}22`,
        borderRadius: 3,
        p: 2.5,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.18s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 8px 28px ${mod.color}33`,
          border: `1.5px solid ${mod.color}66`,
        },
      }}
    >
      {/* Cercle décoratif en fond */}
      <Box sx={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        bgcolor: `${mod.color}15`,
      }} />

      {/* Icon */}
      <Box sx={{
        width: 44, height: 44, borderRadius: 2,
        bgcolor: mod.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 4px 12px ${mod.color}44`,
      }}>
        <Icon size={22} color="white" strokeWidth={2} />
      </Box>

      {/* Label */}
      <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', fontFamily: font, color: 'text.primary', lineHeight: 1.2 }}>
        {mod.label}
      </Typography>

      {/* Stat ou vide */}
      {unknownCount ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: mod.color }}>
            {mod.emptyLabel}
          </Typography>
          <ArrowRight size={14} color={mod.color} strokeWidth={2.5} />
        </Box>
      ) : isEmpty ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: mod.color }}>
          <Plus size={13} strokeWidth={2.5} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: mod.color }}>
            {mod.emptyLabel}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: mod.color }}>
            {mod.countLabel(count)}
          </Typography>
          <ArrowRight size={14} color={mod.color} strokeWidth={2.5} />
        </Box>
      )}
    </Box>
  );
}


function HomePage({ patrons, tissus = [], projets = [], dealers = [], onNavigate }) {
  const { settings } = useSettings();
  const isDark = settings.mode === 'dark';

  const projetsTermines = projets.filter(p => p.statut === 'Terminé').length;

  const moduleCounts = {
    1: patrons.length,
    2: tissus.length,
    3: projets.length,
    4: projetsTermines,
    5: dealers.length,
    6: null,
    7: null,
    8: null,
  };

  return (
    <Box>

      {/* ── TITRE PRINCIPAL ── */}
      <Typography variant="h3" sx={{ mb: 4, fontFamily: TITLE_FONT, color: 'text.primary', lineHeight: 1.3 }}>
        Dans ma Sewing Box, il y a&nbsp;…
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 6,
      }}>
        {MODULES.map((mod) => (
          <ModuleCard
            key={mod.label}
            mod={mod}
            count={moduleCounts[mod.tab] ?? 0}
            onNavigate={onNavigate}
            isDark={isDark}
          />
        ))}
      </Box>

    </Box>
  );
}

export default HomePage;
