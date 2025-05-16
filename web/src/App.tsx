// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import PriorityDateChecker from './components/PriorityDateChecker';
import VisaTablePage from './pages/VisaTablePage';
import About from './pages/About';
import { fetchVisaBulletinData, fetchPermDays } from './services/visaService';
import { VisaBulletinData } from './types/visa';

const App = () => {
  const [vbData, setVbData] = useState<VisaBulletinData | null>(null);
  const [permDays, setPermDays] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const vbData = await fetchVisaBulletinData();
      const permDays = await fetchPermDays();
      setVbData(vbData);
      setPermDays(permDays);
    };
    fetchData();
  }, []);

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            MYVISATRACKER
          </Typography>
          <Button color="inherit" component={Link} to="/" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Priority Checker</Button>
          <Button color="inherit" component={Link} to="/table" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Visa Table</Button>
          <Button color="inherit" component={Link} to="/about" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>About Us</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<PriorityDateChecker vbData={vbData} permDays={permDays} />} />
          <Route path="/table" element={<VisaTablePage />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
