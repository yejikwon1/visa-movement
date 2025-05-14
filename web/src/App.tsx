import React, { useState, useEffect } from 'react';
import { Container, Typography, Tabs, Tab } from '@mui/material';
import { VisaBulletinData } from './types/visa';
import PriorityDateChecker from './components/priority-date-checker/PriorityDateChecker';
import VisaTable from './components/visa-bulletin-table/VisaTable';
import { fetchVisaBulletinData, fetchPermDays } from './services/visaService';

const App = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [vbData, setVbData] = useState<VisaBulletinData | null>(null);
  const [permDays, setPermDays] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [visaData, permData] = await Promise.all([
          fetchVisaBulletinData(),
          fetchPermDays(),
        ]);
        setVbData(visaData);
        setPermDays(permData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Visa Bulletin Tool
      </Typography>

      <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} centered sx={{ mb: 3 }}>
        <Tab label="Priority Date Checker" />
        <Tab label="Visa Bulletin Table" />
      </Tabs>

      {tabIndex === 0 && <PriorityDateChecker vbData={vbData} permDays={permDays} />}

      {tabIndex === 1 && vbData && (
        <>
          <VisaTable data={vbData.final_action_dates.family} title="Final Action Dates - Family" />
          <VisaTable data={vbData.dates_for_filing.family} title="Dates for Filing - Family" />
          <VisaTable data={vbData.final_action_dates.employment} title="Final Action Dates - Employment" />
          <VisaTable data={vbData.dates_for_filing.employment} title="Dates for Filing - Employment" />
        </>
      )}
    </Container>
  );
};

export default App;