import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import {
  Shirt, Layers, ClipboardList, Images,
  Store, Sparkles, Bookmark, PersonStanding, ArrowRight, Plus,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { useSettings, getFontFamily, TITLE_FONT } from '../context/SettingsContext';
import { historiqueService, patronService } from '../services/api';
import PatronModal from './PatronModal';

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


const HISTO_TYPE_CONFIG = {
  patron:      { icon: Shirt,          color: '#e36397', label: 'Patron',      tab: 1 },
  tissu:       { icon: Layers,         color: '#33658a', label: 'Tissu',       tab: 2 },
  projet:      { icon: ClipboardList,  color: '#0cbaba', label: 'Projet',      tab: 3 },
  dealer:      { icon: Store,          color: '#7b5ea7', label: 'Dealer',      tab: 5 },
  inspiration: { icon: Sparkles,       color: '#e36397', label: 'Inspiration', tab: 6 },
  wishlist:    { icon: Bookmark,       color: '#33658a', label: 'Wish list',   tab: 7 },
  mensuration: { icon: PersonStanding, color: '#e36397', label: 'Mensuration', tab: 8 },
};

const HISTO_VISIBLE_KEY = 'sewing_histo_visible';

function HistoriqueCard({ item, onOpen, isDark }) {
  const cfg = HISTO_TYPE_CONFIG[item.type] || HISTO_TYPE_CONFIG.patron;
  const Icon = cfg.icon;
  return (
    <Box
      onClick={onOpen}
      sx={{
        flexShrink: 0,
        width: 130,
        borderRadius: 2.5,
        overflow: 'hidden',
        border: `1.5px solid ${cfg.color}30`,
        bgcolor: isDark ? '#1a1a2e' : 'white',
        cursor: 'pointer',
        transition: 'all 0.18s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 6px 20px ${cfg.color}33`,
          border: `1.5px solid ${cfg.color}66`,
        },
      }}
    >
      {/* Thumbnail */}
      {item.image ? (
        <Box sx={{ height: 90, overflow: 'hidden', bgcolor: `${cfg.color}10` }}>
          <Box component="img" src={item.image} alt={item.nom}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
      ) : (
        <Box sx={{ height: 90, bgcolor: `${cfg.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={32} color={cfg.color} strokeWidth={1.5} style={{ opacity: 0.35 }} />
        </Box>
      )}
      {/* Infos */}
      <Box sx={{ px: 1, py: 0.75 }}>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>
          {cfg.label}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.25 }}
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.nom}
        </Typography>
      </Box>
    </Box>
  );
}

function HomePage({ patrons, tissus = [], projets = [], dealers = [], onNavigate }) {
  const { settings } = useSettings();
  const isDark = settings.mode === 'dark';

  const [historique, setHistorique] = useState([]);
  const [histoVisible, setHistoVisible] = useState(() => {
    try { return localStorage.getItem(HISTO_VISIBLE_KEY) !== 'false'; } catch { return true; }
  });
  const [histoPatron, setHistoPatron] = useState(null);
  const [histoPatronOpen, setHistoPatronOpen] = useState(false);

  useEffect(() => {
    historiqueService.getAll().then(res => setHistorique(res.data)).catch(() => {});
  }, []);

  const toggleHistoVisible = () => {
    setHistoVisible(v => {
      const next = !v;
      try { localStorage.setItem(HISTO_VISIBLE_KEY, String(next)); } catch {}
      return next;
    });
  };

  const handleHistoClick = (item) => {
    if (item.type === 'patron') {
      patronService.getById(item.id)
        .then(res => { setHistoPatron(res.data); setHistoPatronOpen(true); })
        .catch(() => onNavigate(1));
    } else {
      const cfg = HISTO_TYPE_CONFIG[item.type];
      if (cfg) onNavigate(cfg.tab);
    }
  };

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

      {/* ── HISTORIQUE ── */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: histoVisible ? 2 : 0 }}>
          <Typography sx={{ fontFamily: TITLE_FONT, fontSize: '1.2rem', fontWeight: 700, color: 'text.primary', flex: 1 }}>
            Précédemment dans Sewing Box…
          </Typography>
          <IconButton size="small" onClick={toggleHistoVisible} sx={{ color: 'text.secondary' }}>
            {histoVisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </IconButton>
        </Box>
        {histoVisible && (
          historique.length === 0 ? (
            <Typography sx={{ fontSize: '0.82rem', color: 'text.disabled', fontStyle: 'italic' }}>
              Aucun élément récent
            </Typography>
          ) : (
            <Box sx={{
              display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2 },
            }}>
              {historique.map(item => (
                <HistoriqueCard key={`${item.type}-${item.id}`} item={item} onOpen={() => handleHistoClick(item)} isDark={isDark} />
              ))}
            </Box>
          )
        )}
      </Box>

      {histoPatron && (
        <PatronModal
          open={histoPatronOpen}
          patron={histoPatron}
          onClose={() => { setHistoPatronOpen(false); setHistoPatron(null); }}
          onEdit={() => { setHistoPatronOpen(false); onNavigate(1); }}
          onDelete={() => { setHistoPatronOpen(false); onNavigate(1); }}
        />
      )}

    </Box>
  );
}

export default HomePage;
