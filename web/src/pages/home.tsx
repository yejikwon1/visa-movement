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
import SEO from '../components/SEO';

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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Visa Bulletin Priority Date Checker",
    "description": "Track your visa bulletin priority date and immigration status with real-time updates for family and employment-based visas.",
    "url": "https://trackusvisa.com",
    "mainEntity": {
      "@type": "WebApplication",
      "name": "Visa Bulletin Tracker",
      "description": "Free tool to check priority dates and track visa bulletin updates",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Priority Date Checker",
        "Visa Bulletin Tracker", 
        "Family Visa Status",
        "Employment Visa Status",
        "Real-time Updates"
      ]
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://trackusvisa.com"
        }
      ]
    }
  };

  if (loading) {
    return (
      <>
        <SEO 
          title="Loading - Visa Bulletin Priority Date Checker"
          description="Loading visa bulletin data..."
          noIndex={true}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO 
          title="Error - Visa Bulletin Priority Date Checker"
          description="Error loading visa bulletin data"
          noIndex={true}
        />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Visa Bulletin Priority Date Checker | Track Your Immigration Status"
        description="Check your visa bulletin priority date and track immigration status. Real-time updates for family and employment-based visas. Free priority date calculator and visa bulletin tracker."
        keywords="visa bulletin, priority date, immigration status, green card, family visa, employment visa, visa tracker, priority date checker, immigration calculator, visa bulletin dates, priority date calculator"
        structuredData={structuredData}
      />
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
        </Paper>
      </Container>
    </>
  );
};

export default Home;
