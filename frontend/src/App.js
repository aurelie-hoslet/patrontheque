import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box, AppBar, Toolbar, Typography, Tabs, Tab } from '@mui/material';
import PatronList from './components/PatronList';
import PatronForm from './components/PatronForm';
import { patronService } from './services/api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#764ba2',
    },
    secondary: {
      main: '#f093fb',
    },
  },
});

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [patrons, setPatrons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPatron, setEditingPatron] = useState(null);

  useEffect(() => {
    loadPatrons();
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

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    if (newValue === 1) {
      setEditingPatron(null);
    }
  };

  const handleEdit = (patron) => {
    setEditingPatron(patron);
    setCurrentTab(0);
  };

  const handleSave = () => {
    loadPatrons();
    setEditingPatron(null);
    setCurrentTab(1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              📐 Gestionnaire de Patrons de Couture
            </Typography>
            <Typography variant="body1">
              {patrons.length} patrons
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ mt: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label={editingPatron ? "Modifier un patron" : "Ajouter un patron"} />
            <Tab label="Parcourir ma collection" />
          </Tabs>

          {currentTab === 0 && (
            <PatronForm 
              patron={editingPatron} 
              onSave={handleSave}
              onCancel={() => {
                setEditingPatron(null);
                setCurrentTab(1);
              }}
            />
          )}
          
          {currentTab === 1 && (
            <PatronList 
              patrons={patrons}
              loading={loading}
              onEdit={handleEdit}
              onDelete={loadPatrons}
            />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;