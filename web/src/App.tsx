import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Alert,
  Card,
  CardContent,
  SelectChangeEvent,
  CssBaseline,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { parse } from 'date-fns';

interface VisaBulletinData {
  final_action_dates: {
    family: Record<string, Record<string, string>>;
    employment: Record<string, Record<string, string>>;
  };
  dates_for_filing: {
    family: Record<string, Record<string, string>>;
    employment: Record<string, Record<string, string>>;
  };
}

const categoriesMap = {
  family: [
    { value: 'F1', label: 'F1 - Unmarried Sons and Daughters of U.S. Citizens' },
    { value: 'F2A', label: 'F2A - Spouses and Children of Permanent Residents' },
    { value: 'F2B', label: 'F2B - Unmarried Sons and Daughters (21 years of age or older) of Permanent Residents' },
    { value: 'F3', label: 'F3 - Married Sons and Daughters of U.S. Citizens' },
    { value: 'F4', label: 'F4 - Brothers and Sisters of Adult U.S. Citizens' },
  ],
  employment: [
    { value: '1st', label: 'EB1 - First Preference (Priority Workers)' },
    { value: '2nd', label: 'EB2 - Second Preference (Advanced Degree/Exceptional Ability)' },
    { value: '3rd', label: 'EB3 - Third Preference (Skilled Workers/Professionals)' },
    { value: 'Other Workers', label: 'EB3 - Other Workers' },
    { value: '4th', label: 'EB4 - Certain Special Immigrants' },
    { value: 'Certain Religious Workers', label: 'EB4 - Certain Religious Workers' },
    { value: '5th Unreserved (including C5, T5, I5, R5)', label: 'EB5 - Unreserved (C5, T5, I5, R5)' },
  ],
};

const chargeabilityAreas = [
  { value: 'AllChargeabilityAreasExceptThoseListed', label: 'All Chargeability Areas' },
  { value: 'CHINA-mainlandborn', label: 'China (Mainland-born)' },
  { value: 'INDIA', label: 'India' },
  { value: 'MEXICO', label: 'Mexico' },
  { value: 'PHILIPPINES', label: 'Philippines' },
];

const normalizeKey = (key: string) => key.replace(/\s+/g, '');

const App = () => {
  const [visaType, setVisaType] = useState<'family' | 'employment'>('employment');
  const [category, setCategory] = useState('3rd');
  const [chargeabilityArea, setChargeabilityArea] = useState('AllChargeabilityAreasExceptThoseListed');
  const [priorityDate, setPriorityDate] = useState<Date | null>(null);
  const [bulletinData, setBulletinData] = useState<VisaBulletinData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<null | {
    finalAction: { status: boolean; cutoff: string } | null;
    filing: { status: boolean; cutoff: string } | null;
  }>(null);

  useEffect(() => {
    const loadVisaBulletinData = async () => {
      setLoading(true);
      setError(null);
      try {
        const BIN_ID = "682129658561e97a50120314";
        const API_KEY = "$2a$10$chnGp34LEzygcMi0MZX3Lez0oi8NoWGnrfskj9TjdapYXh8nou2sC";
        
        console.log('Fetching data from JSONBin.io...');
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
          headers: {
            "X-Master-Key": API_KEY,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('JSONBin.io API Error:', {
            status: response.status,
            statusText: response.statusText,
            errorText
          });
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Received data from JSONBin.io:', result);
        
        if (!result.record) {
          console.error('Invalid data format:', result);
          throw new Error('Invalid data format received from JSONBin.io');
        }
        
        const data: VisaBulletinData = result.record;
        console.log('Parsed visa bulletin data:', data);
        setBulletinData(data);
      } catch (err: any) {
        console.error("Error loading visa bulletin data:", err);
        setError(err.message || 'Error fetching data from JSONBin.io');
      } finally {
        setLoading(false);
      }
    };

    loadVisaBulletinData();
  }, []);

  const handleCheckStatus = () => {
    if (!bulletinData || !category || !chargeabilityArea || !priorityDate) {
      setError('Please fill out all fields.');
      setResults(null);
      return;
    }
    setError(null);
    setResults(null);

    try {
      const normArea = normalizeKey(chargeabilityArea);

      let finalAction = null;
      let filing = null;
      const faCategoryData = bulletinData.final_action_dates?.[visaType]?.[category];
      const filingCategoryData = bulletinData.dates_for_filing?.[visaType]?.[category];

      if (faCategoryData && faCategoryData[normArea]) {
        const faCutoff = faCategoryData[normArea];
        if (faCutoff === 'C') finalAction = { status: true, cutoff: 'Current' };
        else if (faCutoff === 'U') finalAction = { status: false, cutoff: 'Unavailable' };
        else if (faCutoff) {
          const faDate = parse(faCutoff, 'ddMMMyy', new Date());
          finalAction = { status: priorityDate <= faDate, cutoff: faCutoff };
        }
      }

      if (filingCategoryData && filingCategoryData[normArea]) {
        const filingCutoff = filingCategoryData[normArea];
        if (filingCutoff === 'C') filing = { status: true, cutoff: 'Current' };
        else if (filingCutoff === 'U') filing = { status: false, cutoff: 'Unavailable' };
        else if (filingCutoff) {
          const filingDate = parse(filingCutoff, 'ddMMMyy', new Date());
          filing = { status: priorityDate <= filingDate, cutoff: filingCutoff };
        }
      }

      if (!finalAction && !filing) {
        setError(`No data for selected criteria: ${visaType}/${category}/${chargeabilityArea}.`);
      }
      setResults({ finalAction, filing });

    } catch (e: any) {
      console.error("Error processing dates:", e);
      setError(`Error processing dates for selected category.`);
      setResults(null);
    }
  };

  useEffect(() => {
    if (categoriesMap[visaType] && categoriesMap[visaType].length > 0) {
      setCategory(categoriesMap[visaType][0].value);
    } else {
      setCategory('');
    }
    setResults(null);
    setError(null);
  }, [visaType]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', py: { xs: 3, sm: 6 } }}>
        <Container maxWidth="sm">
          <Typography 
            variant="h4" 
            align="center" 
            fontWeight={600} 
            gutterBottom 
            sx={{ mb: 2 }}
          >
            Visa Bulletin Priority Date Checker
          </Typography>

          <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <FormControl fullWidth>
                <InputLabel id="visa-type-label">Visa Type</InputLabel>
                <Select
                  labelId="visa-type-label"
                  value={visaType}
                  label="Visa Type"
                  onChange={(e: SelectChangeEvent) => setVisaType(e.target.value as 'family' | 'employment')}
                >
                  <MenuItem value="family">Family-Based</MenuItem>
                  <MenuItem value="employment">Employment-Based</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={category}
                  label="Category"
                  onChange={(e: SelectChangeEvent) => setCategory(e.target.value)}
                  disabled={!categoriesMap[visaType] || categoriesMap[visaType].length === 0}
                >
                  {categoriesMap[visaType] && categoriesMap[visaType].map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="chargeability-area-label">Country of Chargeability</InputLabel>
                <Select
                  labelId="chargeability-area-label"
                  value={chargeabilityArea}
                  label="Country of Chargeability"
                  onChange={(e: SelectChangeEvent) => setChargeabilityArea(e.target.value)}
                >
                  {chargeabilityAreas.map((area) => (
                    <MenuItem key={area.value} value={area.value}>{area.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                <DatePicker
                  label="Priority Date (MM/DD/YYYY)"
                  value={priorityDate}
                  onChange={(newValue) => {
                    setPriorityDate(newValue);
                    setResults(null);
                  }}
                  slotProps={{ textField: { fullWidth: true, helperText: "Select your priority date" } }}
                />
              </Box>
              <Button
                variant="contained"
                size="large"
                sx={{ fontWeight: 600, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                onClick={handleCheckStatus}
                disabled={loading || !priorityDate}
              >
                {loading ? 'Loading Data...' : 'Check Status'}
              </Button>
              {error && !loading && <Alert severity="warning" sx={{ mt: 2 }}>{error}</Alert>}
            </Box>
          </Paper>

          {results && (
            <Card elevation={1} sx={{ borderRadius: 3, p: { xs: 1.5, sm: 2 }, mt: 3, width: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>Results</Typography>
                <Typography variant="subtitle1" fontWeight={500}>Final Action Dates:</Typography>
                {results.finalAction ? (
                  results.finalAction.cutoff === 'Current' ? <Typography color="success.main" fontWeight={600}>✓ Current</Typography>
                  : results.finalAction.cutoff === 'Unavailable' ? <Typography color="warning.dark" fontWeight={600}>⚠ Unavailable</Typography>
                  : results.finalAction.status ? <Typography color="success.main" fontWeight={600}>✓ Current ({results.finalAction.cutoff})</Typography>
                  : <Typography color="error.main" fontWeight={600}>✗ Not Current ({results.finalAction.cutoff})</Typography>
                ) : <Typography color="text.secondary">N/A</Typography>}
                <Typography variant="subtitle1" fontWeight={500} sx={{ mt: 2 }}>Dates for Filing:</Typography>
                {results.filing ? (
                  results.filing.cutoff === 'Current' ? <Typography color="success.main" fontWeight={600}>✓ Current</Typography>
                  : results.filing.cutoff === 'Unavailable' ? <Typography color="warning.dark" fontWeight={600}>⚠ Unavailable</Typography>
                  : results.filing.status ? <Typography color="success.main" fontWeight={600}>✓ Current ({results.filing.cutoff})</Typography>
                  : <Typography color="error.main" fontWeight={600}>✗ Not Current ({results.filing.cutoff})</Typography>
                ) : <Typography color="text.secondary">N/A</Typography>}
              </CardContent>
            </Card>
          )}
           {loading && !bulletinData && (
             <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Typography>Loading initial visa bulletin data...</Typography>
             </Box>
           )}
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default App;
