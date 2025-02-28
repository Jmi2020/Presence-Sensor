import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PodProvider } from './contexts/PodContext';
import Dashboard from './pages/Dashboard';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PodProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* Additional routes can be added here */}
          </Routes>
        </Router>
      </PodProvider>
    </ThemeProvider>
  );
}

export default App;