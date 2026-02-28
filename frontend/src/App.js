import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import StyleIcon from '@mui/icons-material/Style';
import LayersIcon from '@mui/icons-material/Layers';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PatronList from './components/PatronList';
import HomePage from './components/HomePage';
import TissuList from './components/TissuList';
import ProjetEnCours from './components/ProjetEnCours';
import GalerieProjets from './components/GalerieProjets';
import DealerList from './components/DealerList';
import { patronService, tissuService, projetService, dealerService } from './services/api';

const theme = createTheme({
  typography: {
    fontFamily: "'Architects Daughter', cursive",
    fontSize: 15,
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    body1: { fontWeight: 500, fontSize: '1rem' },
    body2: { fontWeight: 500, fontSize: '0.9rem' },
    button: { fontWeight: 700, fontSize: '0.95rem' },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 16px rgba(51,101,138,0.15), 0 1px 4px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '0.82rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#33658a',
      light: '#0cbaba',
      dark: '#1e4d6b',
    },
    secondary: {
      main: '#e36397',
      dark: '#e85d75',
    },
    background: {
      default: '#fff8f6',
    },
  },
});

const NAV_ITEMS = [
  { label: 'Accueil',      icon: <HomeIcon /> },
  { label: 'Les Patrons',  icon: <StyleIcon /> },
  { label: 'Les Tissus',   icon: <LayersIcon /> },
  { label: 'Projets',      icon: <AssignmentIcon /> },
  { label: 'Galerie',      icon: <PhotoLibraryIcon /> },
  { label: 'Les Dealers',  icon: <StorefrontIcon /> },
];

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [patrons, setPatrons] = useState([]);
  const [tissus, setTissus] = useState([]);
  const [projets, setProjets] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTissus, setLoadingTissus] = useState(true);
  const [loadingProjets, setLoadingProjets] = useState(true);
  const [loadingDealers, setLoadingDealers] = useState(true);

  useEffect(() => {
    loadPatrons();
    loadTissus();
    loadProjets();
    loadDealers();
  }, []);

  const loadPatrons = async () => {
    try {
      setLoading(true);
      const response = await patronService.getAll();
      setPatrons(response.data);
    } catch (error) {
      console.error('Erreur chargement patrons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTissus = async () => {
    try {
      setLoadingTissus(true);
      const response = await tissuService.getAll();
      setTissus(response.data);
    } catch (error) {
      console.error('Erreur chargement tissus:', error);
    } finally {
      setLoadingTissus(false);
    }
  };

  const loadProjets = async () => {
    try {
      setLoadingProjets(true);
      const response = await projetService.getAll();
      setProjets(response.data);
    } catch (error) {
      console.error('Erreur chargement projets:', error);
    } finally {
      setLoadingProjets(false);
    }
  };

  const loadDealers = async () => {
    try {
      setLoadingDealers(true);
      const response = await dealerService.getAll();
      setDealers(response.data);
    } catch (error) {
      console.error('Erreur chargement dealers:', error);
    } finally {
      setLoadingDealers(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>

        {/* Sidebar */}
        <Box sx={{
          width: 220,
          flexShrink: 0,
          bgcolor: '#1e4d6b',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 100,
          boxShadow: '4px 0 16px rgba(0,0,0,0.18)',
        }}>
          {/* Logo */}
          <Box sx={{ px: 2.5, py: 3, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
            <Typography sx={{
              color: 'white',
              fontWeight: 800,
              fontSize: '1.05rem',
              lineHeight: 1.3,
              fontFamily: "'Architects Daughter', cursive",
            }}>
              📐 Sewing Box
            </Typography>
          </Box>

          {/* Nav items */}
          <Box sx={{ flex: 1, py: 1.5 }}>
            {NAV_ITEMS.map((item, index) => {
              const active = currentTab === index;
              return (
                <Box
                  key={item.label}
                  onClick={() => setCurrentTab(index)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2.5,
                    py: 1.25,
                    mx: 1,
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: active ? 'white' : 'rgba(255,255,255,0.65)',
                    fontFamily: "'Architects Daughter', cursive",
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.9rem',
                    transition: 'all 0.15s',
                    borderLeft: active ? '3px solid #0cbaba' : '3px solid transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.10)',
                      color: 'white',
                    },
                    '& svg': { fontSize: '1.2rem' },
                  }}
                >
                  {item.icon}
                  {item.label}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Main content */}
        <Box sx={{ ml: '220px', flex: 1, p: 4, minHeight: '100vh' }}>
          {currentTab === 0 && (
            <HomePage
              patrons={patrons}
              tissus={tissus}
              projets={projets}
              onEdit={() => {}}
              onDelete={loadPatrons}
              onBrowse={() => setCurrentTab(1)}
            />
          )}
          {currentTab === 1 && (
            <PatronList
              patrons={patrons}
              loading={loading}
              onDelete={loadPatrons}
            />
          )}
          {currentTab === 2 && (
            <TissuList
              tissus={tissus}
              loading={loadingTissus}
              onRefresh={loadTissus}
            />
          )}
          {currentTab === 3 && (
            <ProjetEnCours
              projets={projets}
              patrons={patrons}
              tissus={tissus}
              loading={loadingProjets}
              onRefresh={loadProjets}
            />
          )}
          {currentTab === 4 && (
            <GalerieProjets
              projets={projets}
              patrons={patrons}
              tissus={tissus}
              loading={loadingProjets}
              onRefresh={loadProjets}
            />
          )}
          {currentTab === 5 && (
            <DealerList
              dealers={dealers}
              loading={loadingDealers}
              onRefresh={loadDealers}
            />
          )}
        </Box>

      </Box>
    </ThemeProvider>
  );
}

export default App;
