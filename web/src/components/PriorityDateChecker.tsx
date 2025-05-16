import React, { useState, useEffect } from 'react';
import {
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Card,
  CardContent,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { parse, format } from 'date-fns';
import { VisaBulletinData, categoryMapEmployment, categoryMapFamily, countryMap } from '../types/visa';

interface PriorityDateCheckerProps {
  vbData: VisaBulletinData | null;
  permDays: number | null;
}

const PriorityDateChecker: React.FC<PriorityDateCheckerProps> = ({ vbData, permDays }) => {
  const [visaType, setVisaType] = useState('Employment-Based');
  const [category, setCategory] = useState('EB3');
  const [categoryOptions, setCategoryOptions] = useState<string[]>(['EB1', 'EB2', 'EB3', 'EB4', 'EB5']);
  const [country, setCountry] = useState('All Chargeability Areas');
  const [priorityDate, setPriorityDate] = useState<Date | null>(null);
  const [finalActionResult, setFinalActionResult] = useState('');
  const [filingDateResult, setFilingDateResult] = useState('');
  const [expectedPermDate, setExpectedPermDate] = useState<string | null>(null);

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

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Disclaimer: This website is for informational purposes only and does not provide legal advice. The data presented, including visa bulletin dates and priority date tools, is based on publicly available information and is not guaranteed to be accurate, complete, or up to date. Use of this site does not create an attorney-client relationship. For legal advice specific to your case, please consult a licensed immigration attorney.
      </Typography>
    </Paper>
  );
};

export default PriorityDateChecker; 
