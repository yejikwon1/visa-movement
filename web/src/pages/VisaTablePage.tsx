import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import VisaTable from '../components/VisaTable';
import { VisaBulletinData } from '../types/visa';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const years = Array.from({ length: 10 }, (_, i) => (2016 + i).toString());

// ✅ Fiscal Year 계산 함수
const getFiscalYear = (year: string, month: string): string => {
  const monthIndex = months.indexOf(month); // 0 = January, 9 = October
  return monthIndex >= 9 ? (parseInt(year) + 1).toString() : year;
};

const VisaTablePage = () => {
  const [year, setYear] = useState('2025');
  const [month, setMonth] = useState('May');
  const [vbData, setVbData] = useState<VisaBulletinData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMonthChange = (e: SelectChangeEvent) => setMonth(e.target.value);
  const handleYearChange = (e: SelectChangeEvent) => setYear(e.target.value);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const fiscalYear = getFiscalYear(year, month);
        const filePath = `/parsed_json/FY${fiscalYear}/${month.toLowerCase()}-${year}.json`;
        console.log('📂 Fetching:', filePath);

        const response = await fetch(filePath);
        if (!response.ok) throw new Error('File not found');

        const json = await response.json();
        setVbData(json);
      } catch (err) {
        setError('Data not found for the selected month/year.');
        setVbData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [month, year]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Visa Bulletin Table
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center' }}>
        <FormControl>
          <InputLabel>Year</InputLabel>
          <Select value={year} onChange={handleYearChange} label="Year">
            {years.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Month</InputLabel>
          <Select value={month} onChange={handleMonthChange} label="Month">
            {months.map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {vbData && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <VisaTable data={vbData.final_action_dates.family} title="Final Action Dates - Family" />
          <VisaTable data={vbData.dates_for_filing.family} title="Dates for Filing - Family" />
          <VisaTable data={vbData.final_action_dates.employment} title="Final Action Dates - Employment" />
          <VisaTable data={vbData.dates_for_filing.employment} title="Dates for Filing - Employment" />
        </Box>
      )}
    </Container>
  );
};

export default VisaTablePage;
