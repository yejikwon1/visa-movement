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
  Tabs,
  Tab,
  SelectChangeEvent,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { parse, format } from 'date-fns';
import VisaTable from './VisaTable';

interface VisaBulletinData {
  final_action_dates: {
    employment: Record<string, Record<string, string>>;
    family: Record<string, Record<string, string>>;
  };
  dates_for_filing: {
    employment: Record<string, Record<string, string>>;
    family: Record<string, Record<string, string>>;
  };
}

const App = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [visaType, setVisaType] = useState('Employment-Based');
  const [category, setCategory] = useState('EB3');
  const [categoryOptions, setCategoryOptions] = useState<string[]>(['EB1', 'EB2', 'EB3', 'EB4', 'EB5']);
  const [country, setCountry] = useState('All Chargeability Areas');
  const [priorityDate, setPriorityDate] = useState<Date | null>(null);
  const [vbData, setVbData] = useState<VisaBulletinData | null>(null);
  const [permDays, setPermDays] = useState<number | null>(null);
  const [finalActionResult, setFinalActionResult] = useState('');
  const [filingDateResult, setFilingDateResult] = useState('');
  const [expectedPermDate, setExpectedPermDate] = useState<string | null>(null);

  const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/6822940a8a456b79669c86e9/latest';
  const PERM_JSONBIN_URL = 'https://api.jsonbin.io/v3/b/68229ba28a456b79669c8a65/latest';
  const JSONBIN_API_KEY = 'YOUR_JSONBIN_API_KEY';

  useEffect(() => {
    fetch(JSONBIN_URL, {
      headers: { 'X-Master-Key': JSONBIN_API_KEY },
    })
      .then((res) => res.json())
      .then((data) => {
        const rawRecord = data.record;
        ['employment', 'family'].forEach((type) => {
          Object.keys(rawRecord.dates_for_filing[type]).forEach((catKey) => {
            const categoryData = rawRecord.dates_for_filing[type][catKey];
            Object.keys(categoryData).forEach((key) => {
              const normalizedKey = key.replace(/\s/g, '');
              if (normalizedKey !== key) {
                categoryData[normalizedKey] = categoryData[key];
              }
            });
          });
        });
        setVbData(rawRecord);
      });

    fetch(PERM_JSONBIN_URL, {
      headers: { 'X-Master-Key': JSONBIN_API_KEY },
    })
      .then((res) => res.json())
      .then((data) => {
        const days = data.record?.record?.calendar_days;
        if (typeof days === 'number') setPermDays(days);
      });
  }, []);

  useEffect(() => {
    if (visaType === 'Employment-Based') {
      setCategoryOptions(['EB1', 'EB2', 'EB3', 'EB4', 'EB5']);
      setCategory('EB3');
    } else {
      setCategoryOptions(['F1', 'F2A', 'F2B', 'F3', 'F4']);
      setCategory('F2A');
    }
  }, [visaType]);

  const checkStatus = () => {
    if (!vbData || !priorityDate) return;

    const categoryMapEmployment: Record<string, string> = {
      EB1: '1st',
      EB2: '2nd',
      EB3: '3rd',
      EB4: '4th',
      EB5: '5thUnreserved(includingC5,T5,I5,R5,NU,RU)',
    };

    const categoryMapFamily: Record<string, string> = {
      F1: 'F1',
      F2A: 'F2A',
      F2B: 'F2B',
      F3: 'F3',
      F4: 'F4',
    };

    const countryMap: Record<string, string> = {
      'All Chargeability Areas': 'AllChargeabilityAreasExceptThoseListed',
      'China (mainland born)': 'CHINA-mainlandborn',
      India: 'INDIA',
      Mexico: 'MEXICO',
      Philippines: 'PHILIPPINES',
    };

    const categoryMap = visaType === 'Employment-Based' ? categoryMapEmployment : categoryMapFamily;
    const mappedCategory = categoryMap[category];
    const mappedCountry = countryMap[country].replace(/\s/g, '');
    const source = visaType === 'Employment-Based' ? 'employment' : 'family';

    const pdString = format(priorityDate, 'yyyyMMdd');
    const finalCutoffRaw = vbData.final_action_dates[source][mappedCategory]?.[mappedCountry];
    const filingCutoffRaw = vbData.dates_for_filing[source][mappedCategory]?.[mappedCountry];

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
      const formatted = ['C', 'U'].includes(finalCutoffRaw)
        ? finalCutoffRaw
        : formatCutoff(finalCutoffRaw);
      setFinalActionResult(isCurrent ? `✅ Current (${formatted})` : `❌ Not Current (${formatted})`);
    }

    if (filingCutoffRaw) {
      const isCurrent = compareDates(pdString, filingCutoffRaw);
      const formatted = ['C', 'U'].includes(filingCutoffRaw)
        ? filingCutoffRaw
        : formatCutoff(filingCutoffRaw);
      setFilingDateResult(isCurrent ? `✅ Current (${formatted})` : `❌ Not Current (${formatted})`);
    } else {
      setFilingDateResult('N/A');
    }

    if (permDays && priorityDate) {
      const expectedDate = new Date(priorityDate);
      expectedDate.setDate(expectedDate.getDate() + permDays);
      setExpectedPermDate(format(expectedDate, 'MM-dd-yyyy'));
    } else {
      setExpectedPermDate(null);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Visa Bulletin Tool
      </Typography>

      <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} centered sx={{ mb: 3 }}>
        <Tab label="Priority Date Checker" />
        <Tab label="Visa Bulletin Table" />
      </Tabs>

      {tabIndex === 0 && (
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
            <Select
              key={visaType}
              value={category}
              onChange={(e: SelectChangeEvent) => setCategory(e.target.value)}
            >
              {categoryOptions.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
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

          {(finalActionResult || filingDateResult || expectedPermDate) && (
            <Card sx={{ mt: 4 }}>
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
        </Paper>
      )}

      {tabIndex === 1 && vbData && (
        <>
          <VisaTable data={vbData.final_action_dates.family} title="Final Action Dates - Family" />
          <VisaTable data={vbData.dates_for_filing.family} title="Dates for Filing - Family" />
        </>
      )}
    </Container>
  );
};

export default App;
