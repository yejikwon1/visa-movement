// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { fetchVisaBulletinData, fetchPermDays } from '../services/visaService';
import { VisaBulletinData } from '../types/visa';
import PriorityDateChecker from '../components/PriorityDateChecker';
import VisaTable from '../components/VisaTable';

const Home = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [vbData, setVbData] = useState<VisaBulletinData | null>(null);
  const [permDays, setPermDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [visaData, permData] = await Promise.all([
          fetchVisaBulletinData(),
          fetchPermDays(),
        ]);
        setVbData(visaData);
        setPermDays(permData);
        setError(null);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load visa bulletin data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Visa Bulletin Tracker
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
          Track your priority date and stay informed about visa bulletin updates. Our tool helps you estimate when your priority date may become current.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={(e, val) => setTabIndex(val)}
          centered
          sx={{
            mb: 4,
            '& .MuiTabs-indicator': {
              height: 3,
            },
          }}
        >
          <Tab label="Priority Date Checker" />
          <Tab label="Visa Bulletin Table" />
          <Tab label="About Us" />
        </Tabs>

        {tabIndex === 0 && <PriorityDateChecker />}
        {tabIndex === 1 && vbData && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <VisaTable data={vbData.final_action_dates.family} title="Final Action Dates - Family" />
            <VisaTable data={vbData.dates_for_filing.family} title="Dates for Filing - Family" />
            <VisaTable data={vbData.final_action_dates.employment} title="Final Action Dates - Employment" />
            <VisaTable data={vbData.dates_for_filing.employment} title="Dates for Filing - Employment" />
          </Box>
        )}
        {tabIndex === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>About Us</Typography>
            <Typography variant="body1">This is the About Us section content.</Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Home;
