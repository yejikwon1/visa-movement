import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Card,
  CardContent,
  SelectChangeEvent,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { parse, format } from 'date-fns';

interface VisaBulletinData {
  final_action_dates: {
    employment: Record<string, Record<string, string>>;
  };
  dates_for_filing: {
    employment: Record<string, Record<string, string>>;
  };
}

const App = () => {
  const [visaType, setVisaType] = useState('Employment-Based');
  const [category, setCategory] = useState('EB3');
  const [country, setCountry] = useState('All Chargeability Areas');
  const [priorityDate, setPriorityDate] = useState<Date | null>(null);
  const [vbData, setVbData] = useState<VisaBulletinData | null>(null);
  const [permDays, setPermDays] = useState<number | null>(null);
  const [finalActionResult, setFinalActionResult] = useState('');
  const [filingDateResult, setFilingDateResult] = useState('');
  const [expectedPermDate, setExpectedPermDate] = useState<string | null>(null);

  const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/6822940a8a456b79669c86e9/latest';
  const PERM_JSONBIN_URL = 'https://api.jsonbin.io/v3/b/68229ba28a456b79669c8a65/latest';
  const JSONBIN_API_KEY = '$2a$10$chnGp34LEzygcMi0MZX3Lez0oi8NoWGnrfskj9TjdapYXh8nou2sC';


  useEffect(() => {
    // Fetch Visa Bulletin data
    fetch(JSONBIN_URL, {
      headers: { 'X-Master-Key': JSONBIN_API_KEY },
    })
      .then((res) => res.json())
      .then((data) => {
        const rawRecord = data.record;
  
        // Normalize country keys for filing dates
        Object.keys(rawRecord.dates_for_filing.employment).forEach((catKey) => {
          const categoryData = rawRecord.dates_for_filing.employment[catKey];
          Object.keys(categoryData).forEach((key) => {
            const normalizedKey = key.replace(/\s/g, '');
            if (normalizedKey !== key) {
              categoryData[normalizedKey] = categoryData[key];
            }
          });
        });
  
        setVbData(rawRecord);
      })
      .catch((err) => console.error('❌ Error fetching VB data:', err));
  
    // ✅ FIXED: Fetch PERM days data (record inside record)
    fetch(PERM_JSONBIN_URL, {
      headers: { 'X-Master-Key': JSONBIN_API_KEY },
    })
      .then((res) => res.json())
      .then((data) => {
        const days = data.record?.record?.calendar_days;
        if (typeof days === 'number') {
          setPermDays(days);
        } else {
          console.warn('PERM calendar_days not found');
        }
      })
      .catch((err) => console.error('❌ Error fetching PERM data:', err));
  }, []);
  
  const checkStatus = () => {
    if (!vbData || !priorityDate) {
      console.warn('❌ Missing vbData or priorityDate');
      return;
    }

    const categoryMap: Record<string, string> = {
      EB1: '1st',
      EB2: '2nd',
      EB3: '3rd',
      EB4: '4th',
      EB5: '5th Unreserved (including C5, T5, I5, R5, NU, RU)',
    };

    const countryMap: Record<string, string> = {
      'All Chargeability Areas': 'AllChargeabilityAreasExceptThoseListed',
      'China (mainland born)': 'CHINA-mainlandborn',
      India: 'INDIA',
      Mexico: 'MEXICO',
      Philippines: 'PHILIPPINES',
    };

    const mappedCategory = categoryMap[category];
    const mappedCountry = countryMap[country].replace(/\s/g, '');

    const pdString = format(priorityDate, 'yyyyMMdd');
    const finalCutoffRaw =
      vbData.final_action_dates.employment[mappedCategory]?.[mappedCountry];

    const filingCategoryData = vbData.dates_for_filing.employment[mappedCategory];
    const filingCutoffRaw = filingCategoryData?.[mappedCountry];

    const formatCutoff = (raw: string) => {
      const parsed = parse(raw, 'ddMMMyy', new Date());
      return format(parsed, 'MM/dd/yyyy');
    };

    const compareDates = (pd: string, cutoff: string) => {
      if (cutoff === 'C' || cutoff === 'U') return false;
      const pdNum = parseInt(pd);
      const cutoffDate = parse(cutoff, 'ddMMMyy', new Date());
      const cutoffNum = parseInt(format(cutoffDate, 'yyyyMMdd'));
      return pdNum <= cutoffNum;
    };

    if (finalCutoffRaw) {
      const isCurrent = compareDates(pdString, finalCutoffRaw);
      const formatted =
        finalCutoffRaw === 'C' || finalCutoffRaw === 'U'
          ? finalCutoffRaw
          : formatCutoff(finalCutoffRaw);
      setFinalActionResult(
        isCurrent ? `✅ Current (${formatted})` : `❌ Not Current (${formatted})`
      );
    }

    if (filingCutoffRaw) {
      const isCurrent = compareDates(pdString, filingCutoffRaw);
      const formatted =
        filingCutoffRaw === 'C' || filingCutoffRaw === 'U'
          ? filingCutoffRaw
          : formatCutoff(filingCutoffRaw);
      setFilingDateResult(
        isCurrent ? `✅ Current (${formatted})` : `❌ Not Current (${formatted})`
      );
    } else {
      setFilingDateResult('N/A');
    }

    // Calculate expected PERM processing date
    if (permDays && priorityDate) {
      const expectedDate = new Date(priorityDate);
      expectedDate.setDate(expectedDate.getDate() + permDays);
      const formatted = format(expectedDate, 'MM-dd-yyyy');
      setExpectedPermDate(formatted);
    } else {
      setExpectedPermDate(null);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Visa Bulletin Priority Date Checker
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Visa Type</InputLabel>
          <Select value={visaType} onChange={(e) => setVisaType(e.target.value)}>
            <MenuItem value="Employment-Based">Employment-Based</MenuItem>
            <MenuItem value="Family-Based">Family-Based</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Category</InputLabel>
          <Select value={category} onChange={(e: SelectChangeEvent) => setCategory(e.target.value)}>
            <MenuItem value="EB1">EB1</MenuItem>
            <MenuItem value="EB2">EB2</MenuItem>
            <MenuItem value="EB3">EB3</MenuItem>
            <MenuItem value="EB4">EB4</MenuItem>
            <MenuItem value="EB5">EB5</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Country of Chargeability</InputLabel>
          <Select value={country} onChange={(e: SelectChangeEvent) => setCountry(e.target.value)}>
            <MenuItem value="All Chargeability Areas">All Chargeability Areas</MenuItem>
            <MenuItem value="China (mainland born)">China (mainland born)</MenuItem>
            <MenuItem value="India">India</MenuItem>
            <MenuItem value="Mexico">Mexico</MenuItem>
            <MenuItem value="Philippines">Philippines</MenuItem>
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Priority Date (MM/DD/YYYY)"
            value={priorityDate}
            onChange={(newValue: Date | null) => setPriorityDate(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                margin: 'normal',
              },
            }}
          />
        </LocalizationProvider>

        <Box textAlign="center" mt={2}>
          <Button variant="contained" onClick={checkStatus}>
            Check Status
          </Button>
        </Box>
      </Paper>

      {(finalActionResult || filingDateResult || expectedPermDate) && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">Results</Typography>
            <Typography>Final Action Dates: {finalActionResult}</Typography>
            <Typography>Dates for Filing: {filingDateResult}</Typography>
            {expectedPermDate && (
              <Typography>
                Expected PERM Processing Date: 📅 {expectedPermDate}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default App;
