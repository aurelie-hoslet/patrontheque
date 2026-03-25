import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Tooltip } from '@mui/material';
import {
  Home, Shirt, Layers, ClipboardList, Images,
  Store, Sparkles, Bookmark, Settings, Scissors, PersonStanding, Heart
} from 'lucide-react';
import PatronList from './components/PatronList';
import HomePage from './components/HomePage';
import TissuList from './components/TissuList';
import ProjetEnCours from './components/ProjetEnCours';
import GalerieProjets from './components/GalerieProjets';
import DealerList from './components/DealerList';
import Inspirations from './components/Inspirations';
import WishList from './components/WishList';
import Mensurations from './components/Mensurations';
import APropos from './components/APropos';
import Parametres from './components/Parametres';
import { SettingsProvider, useSettings, getFontFamily, TITLE_FONT } from './context/SettingsContext';
import { patronService, tissuService, projetService, dealerService } from './services/api';

const SIDEBAR_COLLAPSED = 64;
const SIDEBAR_EXPANDED = 224;

const NAV_ITEMS = [
  { label: 'Accueil',      icon: Home,          tab: 0  },
  { label: 'Les Patrons',  icon: Shirt,         tab: 1  },
  { label: 'Les Tissus',   icon: Layers,        tab: 2  },
  { label: 'Projets',      icon: ClipboardList, tab: 3  },
  { label: 'Galerie',      icon: Images,        tab: 4  },
  { label: 'Carnet d\'adresses', icon: Store,    tab: 5  },
  { label: 'Inspirations',  icon: Sparkles,       tab: 6  },
  { label: 'Wish List',     icon: Bookmark,       tab: 7  },
  { label: 'Mensurations',  icon: PersonStanding, tab: 8  },
  { label: 'À propos',      icon: Heart,          tab: 9  },
];

function AppContent() {
  const { settings } = useSettings();
  const [currentTab, setCurrentTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [matchTissu, setMatchTissu] = useState(null);

  const handleMatchTissu = (tissu) => {
    setMatchTissu(tissu);
    setCurrentTab(1);
  };
  const [patrons, setPatrons] = useState([]);
  const [tissus, setTissus] = useState([]);
  const [projets, setProjets] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTissus, setLoadingTissus] = useState(true);
  const [loadingProjets, setLoadingProjets] = useState(true);
  const [loadingDealers, setLoadingDealers] = useState(true);

  const isDark = settings.mode === 'dark';
  const font = getFontFamily(settings.font);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: settings.mode,
      primary: {
        main: '#33658a',
        light: '#0cbaba',
        dark: '#1e4d6b',
      },
      secondary: {
        main: settings.accentColor,
      },
      background: {
        default: isDark ? '#0f0f0f' : '#f7f3ee',
        paper:   isDark ? '#1a1a1a' : '#ffffff',
      },
      text: {
        primary:   isDark ? '#f0ede8' : '#1a1310',
        secondary: isDark ? '#9a9490' : '#6b6158',
      },
    },
    typography: {
      fontFamily: font,
      fontSize: 15,
      h1: { fontWeight: 400, fontFamily: TITLE_FONT, letterSpacing: '0' },
      h2: { fontWeight: 400, fontFamily: TITLE_FONT, letterSpacing: '0' },
      h3: { fontWeight: 400, fontFamily: TITLE_FONT, letterSpacing: '0' },
      h4: { fontWeight: 400, fontFamily: TITLE_FONT, letterSpacing: '0' },
      h5: { fontWeight: 400, fontFamily: TITLE_FONT, letterSpacing: '0' },
      body1: { fontWeight: 500, fontSize: '1rem' },
      body2: { fontWeight: 500, fontSize: '0.9rem' },
      button: { fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.01em' },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 12px rgba(26,19,10,0.08), 0 1px 3px rgba(0,0,0,0.06)',
            borderRadius: 16,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 700, fontSize: '0.82rem' },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            boxShadow: 'none',
            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 16 },
        },
      },
    },
  }), [settings, isDark, font]);

  useEffect(() => {
    loadPatrons();
    loadTissus();
    loadProjets();
    loadDealers();
  }, []);

  const loadPatrons = async () => {
    try { setLoading(true); const r = await patronService.getAll(); setPatrons(r.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  const loadTissus = async () => {
    try { setLoadingTissus(true); const r = await tissuService.getAll(); setTissus(r.data); }
    catch (e) { console.error(e); } finally { setLoadingTissus(false); }
  };
  const loadProjets = async () => {
    try { setLoadingProjets(true); const r = await projetService.getAll(); setProjets(r.data); }
    catch (e) { console.error(e); } finally { setLoadingProjets(false); }
  };
  const loadDealers = async () => {
    try { setLoadingDealers(true); const r = await dealerService.getAll(); setDealers(r.data); }
    catch (e) { console.error(e); } finally { setLoadingDealers(false); }
  };

  const showParametres = currentTab === -1;
  const sidebarWidth = sidebarOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;

  const NavItem = ({ item, isSettings }) => {
    const active = isSettings ? showParametres : currentTab === item.tab;
    const Icon = item.icon;

    const content = (
      <Box
        onClick={() => setCurrentTab(isSettings ? -1 : item.tab)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: sidebarOpen ? 1.5 : 0,
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          px: sidebarOpen ? 2 : 0,
          py: 1.2,
          mx: 1,
          borderRadius: 2,
          cursor: 'pointer',
          bgcolor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
          color: active ? 'white' : 'rgba(255,255,255,0.55)',
          fontFamily: font,
          fontWeight: active ? 700 : 500,
          fontSize: '0.88rem',
          transition: 'all 0.15s',
          borderLeft: active ? `3px solid ${settings.accentColor}` : '3px solid transparent',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.08)',
            color: 'white',
          },
        }}
      >
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <Icon size={18} strokeWidth={active ? 2.5 : 2} />
        </Box>
        {sidebarOpen && (
          <Box
            component="span"
            sx={{
              opacity: sidebarOpen ? 1 : 0,
              transition: 'opacity 0.15s',
              overflow: 'hidden',
            }}
          >
            {item.label}
          </Box>
        )}
      </Box>
    );

    if (!sidebarOpen) {
      return (
        <Tooltip title={item.label} placement="right" arrow>
          {content}
        </Tooltip>
      );
    }
    return content;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>

        {/* Sidebar */}
        <Box
          onMouseEnter={() => setSidebarOpen(true)}
          onMouseLeave={() => setSidebarOpen(false)}
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            bgcolor: '#1a1310',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: 0, left: 0,
            height: '100vh',
            zIndex: 200,
            boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
            transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
          }}
        >
          {/* Logo */}
          <Box sx={{
            px: sidebarOpen ? 2.5 : 0,
            py: 2.5,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            gap: 1.5,
            transition: 'padding 0.22s',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}>
            <Box sx={{ flexShrink: 0, color: settings.accentColor }}>
              <Scissors size={22} strokeWidth={2} />
            </Box>
            {sidebarOpen && (
              <Box
                component="span"
                sx={{
                  color: 'white',
                  fontWeight: 400,
                  fontSize: '1.1rem',
                  fontFamily: TITLE_FONT,
                }}
              >
                Sewing Box
              </Box>
            )}
          </Box>

          {/* Nav items */}
          <Box sx={{ flex: 1, py: 1.5, overflowY: 'auto', overflowX: 'hidden' }}>
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </Box>

          {/* Settings */}
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', py: 1 }}>
            <NavItem item={{ label: 'Paramètres', icon: Settings, tab: -1 }} isSettings />
          </Box>
        </Box>

        {/* Main content */}
        <Box sx={{
          ml: `${SIDEBAR_COLLAPSED}px`,
          flex: 1,
          p: { xs: 3, md: 4 },
          minHeight: '100vh',
          transition: 'none',
        }}>
          {showParametres && <Parametres />}
          {currentTab === 0 && (
            <HomePage
              patrons={patrons}
              tissus={tissus}
              projets={projets}
              dealers={dealers}
              onDelete={loadPatrons}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}
          {currentTab === 1 && <PatronList patrons={patrons} loading={loading} onDelete={loadPatrons} matchTissu={matchTissu} onClearMatch={() => setMatchTissu(null)} />}
          {currentTab === 2 && <TissuList tissus={tissus} loading={loadingTissus} onRefresh={loadTissus} onMatchTissu={handleMatchTissu} />}
          {currentTab === 3 && <ProjetEnCours projets={projets} patrons={patrons} tissus={tissus} loading={loadingProjets} onRefresh={loadProjets} />}
          {currentTab === 4 && <GalerieProjets projets={projets} patrons={patrons} tissus={tissus} loading={loadingProjets} onRefresh={loadProjets} />}
          {currentTab === 5 && <DealerList dealers={dealers} loading={loadingDealers} onRefresh={loadDealers} />}
          {currentTab === 6 && <Inspirations />}
          {currentTab === 7 && <WishList />}
          {currentTab === 8 && <Mensurations />}
          {currentTab === 9 && <APropos />}
        </Box>

      </Box>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
