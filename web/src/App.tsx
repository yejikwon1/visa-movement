import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button
} from '@mui/material';

import PriorityDateChecker from './components/PriorityDateChecker';
import VisaTablePage from './pages/VisaTablePage';
import About from './pages/About';
//import SingleTurnChat from './components/singleTurnChat';
import MultiTurnChat from './components/MultiTurnChat';


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
            COOLVISATRACKER
          </Typography>
          <Button color="inherit" component={Link} to="/" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            Priority Checker
          </Button>
          <Button color="inherit" component={Link} to="/table" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            Visa Table
          </Button>
          <Button color="inherit" component={Link} to="/about" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            About Us
          </Button>
          <Button color="inherit" component={Link} to="/chat" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            Chatbot
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<PriorityDateChecker vbData={vbData} permDays={permDays} />} />
          <Route path="/table" element={<VisaTablePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/chat" element={<MultiTurnChat />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
