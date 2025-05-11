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
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed (0 for January, 11 for December)
        const monthName = now.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();

        // Fiscal year for US government runs from October to September.
        // e.g., October 2023 to September 2024 is FY2024.
        let fiscalYear = currentYear;
        if (currentMonth >= 9) { // 9 is October (0-indexed)
          fiscalYear = currentYear + 1;
        }

        // The filename uses the calendar year, e.g., july-2024.json
        const fileName = `${monthName}-${currentYear}.json`;
        const filePath = `/parsed_json/FY${fiscalYear}/${fileName}`;

        // const response = await fetch('/parsed_json/FY2024/september-2024.json');
        const response = await fetch(filePath);
        if (!response.ok) {
          // Fallback mechanism: Try to fetch the previous month's data if current is not found
          let fallbackResponse;
          let fallbackFilePath;

          const prevMonthDate = new Date(now);
          prevMonthDate.setMonth(currentMonth - 1);
          
          const prevMonthYear = prevMonthDate.getFullYear();
          const prevMonthIndex = prevMonthDate.getMonth();
          const prevMonthName = prevMonthDate.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();

          let prevFiscalYear = prevMonthYear;
          if (prevMonthIndex >= 9) {
            prevFiscalYear = prevMonthYear + 1;
          }
          
          const prevFileName = `${prevMonthName}-${prevMonthYear}.json`;
          fallbackFilePath = `/parsed_json/FY${prevFiscalYear}/${prevFileName}`;
          
          try {
            fallbackResponse = await fetch(fallbackFilePath);
            if (!fallbackResponse.ok) {
              throw new Error(`HTTP error! Status: ${response.status} for ${filePath} and ${fallbackResponse.status} for ${fallbackFilePath}`);
            }
            const data: VisaBulletinData = await fallbackResponse.json();
            setBulletinData(data);
            setError(`Could not find data for the current month (${filePath}). Displaying data for ${prevMonthName} ${prevMonthYear}.`);
          } catch (fallbackErr) {
             console.error("Fallback fetch error:", fallbackErr);
             throw new Error(`HTTP error! Status: ${response.status} for ${filePath}. Fallback to ${fallbackFilePath} also failed.`);
          }
        } else {
          const data: VisaBulletinData = await response.json();
          setBulletinData(data);
        }
      } catch (err: any) {
        console.error("Error in loadVisaBulletinData:", err);
        setError(err.message || 'Failed to load visa bulletin data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadVisaBulletinData();
  }, []);

  const getChargeabilityKey = (
    area: string,
    type: 'final_action_dates' | 'dates_for_filing',
    visaType: 'family' | 'employment'
  ) => {
    // For employment, China is 'CHINA-mainlandborn', for family it's 'CHINA'
    if (area === 'CHINA-mainlandborn' && visaType === 'family') return 'CHINA';
    if (area === 'CHINA' && visaType === 'employment') return 'CHINA-mainlandborn';
    // For AllChargeability, handle both normal and non-breaking space
    if (type === 'dates_for_filing') {
      if (area === 'AllChargeabilityAreasExceptThoseListed') {
        return [
          'AllChargeabilityAreasExceptThoseListed',
          'AllChargeabilityAreas\u00a0ExceptThoseListed',
          'AllChargeabilityAreas ExceptThoseListed', // actual non-breaking space
        ];
      }
    }
    return [area];
  };

  const handleCheckStatus = () => {
    if (!bulletinData || !category || !chargeabilityArea || !priorityDate) {
      setResults(null);
      setError('Please fill out all fields.');
      return;
    }
    setError(null);
    // Final Action Dates
    let finalAction: { status: boolean; cutoff: string } | null = null;
    let filing: { status: boolean; cutoff: string } | null = null;
    try {
      const faKeys = getChargeabilityKey(chargeabilityArea, 'final_action_dates', visaType);
      let faCutoff = null;
      for (const key of faKeys) {
        faCutoff = bulletinData.final_action_dates[visaType][category][key];
        if (faCutoff) break;
      }
      if (faCutoff === 'C') {
        finalAction = { status: true, cutoff: 'Current' };
      } else if (faCutoff) {
        const faDate = parse(faCutoff, 'ddMMMyy', new Date());
        finalAction = { status: priorityDate <= faDate, cutoff: faCutoff };
      }
    } catch {
      finalAction = null;
    }
    // Dates for Filing
    try {
      const filingKeys = getChargeabilityKey(chargeabilityArea, 'dates_for_filing', visaType);
      let filingCutoff = null;
      for (const key of filingKeys) {
        filingCutoff = bulletinData.dates_for_filing[visaType][category][key];
        if (filingCutoff) break;
      }
      if (filingCutoff === 'C') {
        filing = { status: true, cutoff: 'Current' };
      } else if (filingCutoff) {
        const filingDate = parse(filingCutoff, 'ddMMMyy', new Date());
        filing = { status: priorityDate <= filingDate, cutoff: filingCutoff };
      }
    } catch {
      filing = null;
    }
    setResults({ finalAction, filing });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f7fcfa', py: 6 }}>
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
            <Typography variant="h4" align="center" fontWeight={600} gutterBottom>
              Visa Bulletin Priority Date Checker
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Visa Type</InputLabel>
                <Select
                  value={visaType}
                  label="Visa Type"
                  onChange={(e: SelectChangeEvent) => {
                    setVisaType(e.target.value as 'family' | 'employment');
                    setCategory(categoriesMap[e.target.value as 'family' | 'employment'][0].value);
                  }}
                >
                  <MenuItem value="family">Family-Based</MenuItem>
                  <MenuItem value="employment">Employment-Based</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e: SelectChangeEvent) => setCategory(e.target.value)}
                >
                  {categoriesMap[visaType].map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Country of Chargeability</InputLabel>
                <Select
                  value={chargeabilityArea}
                  label="Country of Chargeability"
                  onChange={(e: SelectChangeEvent) => setChargeabilityArea(e.target.value)}
                >
                  {chargeabilityAreas.map((area) => (
                    <MenuItem key={area.value} value={area.value}>{area.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DatePicker
                label="Priority Date (MM/DD/YYYY)"
                value={priorityDate}
                onChange={(newValue: Date | null) => setPriorityDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <Button
                variant="contained"
                size="large"
                sx={{ mt: 2, fontWeight: 600, bgcolor: '#1976d2' }}
                onClick={handleCheckStatus}
                disabled={loading}
              >
                Check Status
              </Button>
              {error && <Alert severity="error">{error}</Alert>}
            </Box>
          </Paper>
          {results && (
            <Card elevation={1} sx={{ borderRadius: 3, p: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>Results</Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={500}>Final Action Dates:</Typography>
                  {results.finalAction ? (
                    results.finalAction.status ? (
                      <Typography color="success.main" fontWeight={600}>
                        ✓ Current{results.finalAction.cutoff !== 'Current' && ` (${results.finalAction.cutoff})`}
                      </Typography>
                    ) : (
                      <Typography color="error.main" fontWeight={600}>
                        ✗ Not Current ({results.finalAction.cutoff})
                      </Typography>
                    )
                  ) : (
                    <Typography color="text.secondary">N/A</Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={500}>Dates for Filing:</Typography>
                  {results.filing ? (
                    results.filing.status ? (
                      <Typography color="success.main" fontWeight={600}>
                        ✓ Current{results.filing.cutoff !== 'Current' && ` (${results.filing.cutoff})`}
                      </Typography>
                    ) : (
                      <Typography color="error.main" fontWeight={600}>
                        ✗ Not Current ({results.filing.cutoff})
                      </Typography>
                    )
                  ) : (
                    <Typography color="text.secondary">N/A</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default App; 