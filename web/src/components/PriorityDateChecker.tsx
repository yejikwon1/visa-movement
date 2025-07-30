// src/components/PriorityDateChecker.tsx
import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Box, Button, Alert,
  Card, CardContent, SelectChangeEvent, Divider, CssBaseline, Grid, CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { parse, format, isValid, addMonths, max, startOfMonth } from 'date-fns';

import employmentForecastData from '../employment_forecast.json';
import familyForecastData from '../family_forecast.json';
import VisaTimeline from './VisaTimeline';


interface ForecastEntry {
  cutoff_date: string;
  ordinal: number;
}

interface ForecastByCategory {
  [categoryKey: string]: {
    [monthYear: string]: ForecastEntry;
  };
}

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

interface ResultDetail {
  cutoffText: string;
  isCurrent: boolean;
  statusText: string;
  formattedDate?: string;
}

interface AppResultsData {
  finalAction: ResultDetail | null;
  filing: ResultDetail | null;
  expectedPermDate: string | null;
  predictedFilingDate: string | null;
  predictedFinalActionDate: string | null;
  greenCardInHand: string | null;
}

interface OptionType {
  value: string;
  label: string;
}

const categoriesMap: Record<'family' | 'employment', OptionType[]> = {
  'employment': [
    { value: 'EB1', label: 'EB-1 (Priority Workers)' },
    { value: 'EB2', label: 'EB-2 (Advanced Degree/Exceptional Ability)' },
    { value: 'EB3', label: 'EB-3 (Skilled Workers, Professionals)' },
    { value: 'Other Workers', label: 'EB-3 Other Workers (Unskilled)' },
    { value: 'EB4', label: 'EB-4 (Certain Special Immigrants)' },
    { value: 'EB5', label: 'EB-5 (Investors - Unreserved)' },
  ],
  'family': [
    { value: 'F1', label: 'F1 (Unmarried Sons/Daughters of U.S. Citizens)' },
    { value: 'F2A', label: 'F2A (Spouses/Children of LPRs)' },
    { value: 'F2B', label: 'F2B (Unmarried Sons/Daughters (21+) of LPRs)' },
    { value: 'F3', label: 'F3 (Married Sons/Daughters of U.S. Citizens)' },
    { value: 'F4', label: 'F4 (Brothers/Sisters of Adult U.S. Citizens)' },
  ],
};

const chargeabilityAreas: OptionType[] = [
  { value: 'All Chargeability Areas', label: 'allchargeabilityareasexceptthoselisted' },
  { value: 'China (mainland born)', label: 'china-mainlandborn' },
  { value: 'India', label: 'india' },
  { value: 'Mexico', label: 'mexico' },
  { value: 'Philippines', label: 'philippines' },
];

const APP_CATEGORY_TO_VB_DATA_KEY_MAP: Record<string, Record<string, string>> = {
  'employment': {
    'EB1': '1st', 'EB2': '2nd', 'EB3': '3rd',
    'Other Workers': 'Other Workers', 'EB4': '4th',
    'EB5': '5th Unreserved (including C5, T5, I5, R5, NU, RU)',
  },
  'family': {
    'F1': 'F1', 'F2A': 'F2A', 'F2B': 'F2B', 'F3': 'F3', 'F4': 'F4',
  }
};

const normalizeJsKey = (key: string): string => {
  if (typeof key !== 'string') return '';
  return key.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s\u00A0]+/g, '')
    .toLowerCase();
};

// Define Props interface for PriorityDateChecker if it's meant to receive props
// If it fetches its own data (as per the previous full App code), it doesn't need vbData/permDays as props.
// The error "Property 'vbData' does not exist on type 'IntrinsicAttributes'" suggests
// that in your App.tsx (or wherever PriorityDateChecker is used), you are trying to pass props to it,
// but the PriorityDateChecker component (as defined from your last full code paste)
// did NOT declare that it accepts these props because it fetched its own data.

// If PriorityDateChecker is meant to be self-contained (fetches its own data):
// const PriorityDateChecker: React.FC = () => { ... internal data fetching ... }

// If PriorityDateChecker is meant to receive vbData and permDays as props:
interface PriorityDateCheckerProps {
  vbData: VisaBulletinData | null;
  permDays: number | null;
}
// Then use: const PriorityDateChecker: React.FC<PriorityDateCheckerProps> = ({ vbData, permDays }) => {
// And remove the internal data fetching logic from THIS component.

// For now, I'm assuming you want to keep the data fetching INSIDE PriorityDateChecker
// as per the full App code you provided that I refactored.
// So, it does not take props.
const PriorityDateChecker: React.FC = () => {
  const [visaType, setVisaType] = useState<'family' | 'employment'>('employment');
  const [category, setCategory] = useState(categoriesMap[visaType][0]?.value || '');
  const [chargeabilityArea, setChargeabilityArea] = useState(chargeabilityAreas[0].value);
  const [priorityDate, setPriorityDate] = useState<Date | null>(null);
  const [vbData, setVbData] = useState<VisaBulletinData | null>(null); // Internal state for fetched data
  const [permDays, setPermDays] = useState<number | null>(null);       // Internal state for fetched data
  const [results, setResults] = useState<AppResultsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/6822940a8a456b79669c86e9/latest';
  const PERM_JSONBIN_URL = 'https://api.jsonbin.io/v3/b/68229ba28a456b79669c8a65/latest';
  const JSONBIN_API_KEY = '$2a$10$chnGp34LEzygcMi0MZX3Lez0oi8NoWGnrfskj9TjdapYXh8nou2sC';

  useEffect(() => {
    setLoading(true); setError(null);
    Promise.all([
      fetch(JSONBIN_URL, { headers: { 'X-Master-Key': JSONBIN_API_KEY } })
        .then(res => {
          if (!res.ok) return res.text().then(text => { throw new Error(`Visa Bulletin Data: HTTP error ${res.status} - ${text || res.statusText}. Check JSONBin URL/Key.`) });
          return res.json();
        }),
      fetch(PERM_JSONBIN_URL, { headers: { 'X-Master-Key': JSONBIN_API_KEY } })
        .then(res => {
          if (!res.ok) return res.text().then(text => { throw new Error(`PERM Data: HTTP error ${res.status} - ${text || res.statusText}. Check JSONBin URL/Key.`) });
          return res.json();
        })
    ]).then(([vbJsonData, permJsonData]) => {
      const rawVbRecord = vbJsonData.record;
      if (!rawVbRecord || typeof rawVbRecord !== 'object' || !rawVbRecord.final_action_dates || !rawVbRecord.dates_for_filing) {
        throw new Error("Fetched Visa Bulletin data is not in the expected format or is missing key fields. Please check the content of your JSONBin bin.");
      }
      (['employment', 'family'] as const).forEach(type => {
        (['dates_for_filing', 'final_action_dates'] as const).forEach(dateField => {
          if (rawVbRecord[dateField]?.[type]) {
            Object.keys(rawVbRecord[dateField][type]).forEach(catKey => {
              const categoryLevelData = rawVbRecord[dateField][type][catKey];
              if (typeof categoryLevelData === 'object' && categoryLevelData !== null) {
                const newCountryData: Record<string, string> = {};
                Object.entries(categoryLevelData).forEach(([countryKey, countryValue]) => {
                  const normalizedKey = normalizeJsKey(countryKey);
                  newCountryData[normalizedKey] = countryValue as string;
                  // Also ensure standard key is available for AllChargeabilityAreas
                  if (countryKey.includes('AllChargeabilityAreas')) {
                    newCountryData['AllChargeabilityAreasExceptThoseListed'] = countryValue as string;
                  }
                });
                rawVbRecord[dateField][type][catKey] = newCountryData;
              }
            });
          }
        });
      });
      setVbData(rawVbRecord);
      const days = permJsonData.record?.record?.calendar_days;
      if (typeof days === 'number') setPermDays(days); else {
        console.warn("PERM days not found or not a number in fetched data.");
        setPermDays(null);
      }
    }).catch(err => {
      console.error("Error fetching initial data from JSONBin:", err);
      setError(`Failed to load critical data: ${err.message}. Please verify JSONBin IDs, API Key, and data structure. Also check network connectivity.`);
    }).finally(() => setLoading(false));
  }, [JSONBIN_URL, PERM_JSONBIN_URL, JSONBIN_API_KEY]);

  useEffect(() => {
    const currentVisaTypeCategories = categoriesMap[visaType];
    if (currentVisaTypeCategories?.[0]) {
      setCategory(currentVisaTypeCategories[0].value);
    } else {
      setCategory('');
    }
    setResults(null); setError(null);
  }, [visaType]);

  const handleCheckStatus = () => {
    if (!vbData) { setError("Visa Bulletin data not loaded. Refresh."); return; }
    if (!priorityDate || !isValid(priorityDate)) { setError("Select valid Priority Date."); setResults(null); return; }

    // 미래 날짜 입력 시 경고
    const currentDate = new Date();
    if (priorityDate > currentDate) {
      setError("Priority Date cannot be in the future");
      setResults(null);
      return;
    }

    setLoadingAction(true); setError(null); setResults(null);

    setTimeout(() => {
      try {
        // Check if Priority Date is significantly in the past (likely already received Green Card)
        const currentDate = new Date();
        const yearsFromPriorityDate = (currentDate.getTime() - priorityDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        const isVeryOldPriorityDate = yearsFromPriorityDate > 4; // More than 4 years ago

        const newResultsData: AppResultsData = {
          finalAction: null, filing: null, expectedPermDate: null,
          predictedFilingDate: null, predictedFinalActionDate: null, greenCardInHand: null,
        };
        const currentVisaTypeKey = visaType;
        const vbDataCategoryKey = APP_CATEGORY_TO_VB_DATA_KEY_MAP[currentVisaTypeKey]?.[category];
        
        const selectedCountryOption = chargeabilityAreas.find(ca => ca.value === chargeabilityArea);
        const countryKeyForVbData = selectedCountryOption ? selectedCountryOption.label : normalizeJsKey(chargeabilityArea);

        if (!vbDataCategoryKey) {
          throw new Error(`Config error: VB key map missing for category '${category}'.`);
        }

        const pdString = format(priorityDate, 'yyyyMMdd');
        const getCutoffResultDetail = (cutoffRawValue: string | undefined, dateTypeName: string): ResultDetail | null => {
          if (cutoffRawValue === undefined) return { cutoffText: 'N/A', isCurrent: false, statusText: `Data not found for ${dateTypeName} (Cat: ${vbDataCategoryKey}, Country: ${countryKeyForVbData})` };
          const upperCutoff = cutoffRawValue.toUpperCase();
          if (upperCutoff === 'C') return { cutoffText: 'Current', isCurrent: true, statusText: '✓ Current' };
          if (upperCutoff === 'U') return { cutoffText: 'Unavailable', isCurrent: false, statusText: '⚠ Unavailable' };
          try {
            const parsedCutoff = parse(cutoffRawValue, 'ddMMMyy', new Date());
            if (!isValid(parsedCutoff)) throw new Error("Invalid date from VB parse");
            const formattedCutoff = format(parsedCutoff, 'MM/dd/yyyy');
            const isPdActuallyCurrent = parseInt(pdString, 10) <= parseInt(format(parsedCutoff, 'yyyyMMdd'), 10);
            return { cutoffText: formattedCutoff, isCurrent: isPdActuallyCurrent, statusText: isPdActuallyCurrent ? `✓ Current (${formattedCutoff})` : `✗ Not Current (${formattedCutoff})`, formattedDate: formattedCutoff };
          } catch (e) { return { cutoffText: `Invalid Date Format (${cutoffRawValue})`, isCurrent: false, statusText: `⚠ Invalid Date Format in VB (${cutoffRawValue})` }; }
        };
        newResultsData.finalAction = getCutoffResultDetail(vbData.final_action_dates[currentVisaTypeKey]?.[vbDataCategoryKey]?.[countryKeyForVbData], "Final Action");
        newResultsData.filing = getCutoffResultDetail(vbData.dates_for_filing[currentVisaTypeKey]?.[vbDataCategoryKey]?.[countryKeyForVbData], "Dates for Filing");

        // Special handling for very old Priority Dates
        if (isVeryOldPriorityDate) {
          // For very old priority dates, likely already received Green Card
          const estimatedCompletionDate = new Date(priorityDate);
          
          if (visaType === 'employment') {
            // Estimate PERM was approved 1.5 years after Priority Date
            const estimatedPermDate = new Date(priorityDate);
            estimatedPermDate.setFullYear(estimatedPermDate.getFullYear() + 1);
            estimatedPermDate.setMonth(estimatedPermDate.getMonth() + 6);
            newResultsData.expectedPermDate = format(estimatedPermDate, 'MM/dd/yyyy');
            
            // Estimate filing was possible 2 years after Priority Date
            estimatedCompletionDate.setFullYear(estimatedCompletionDate.getFullYear() + 2);
          } else {
            // For family-based, estimate filing was possible 1 year after Priority Date
            estimatedCompletionDate.setFullYear(estimatedCompletionDate.getFullYear() + 1);
          }
          
          const estimatedFinalActionDate = addMonths(estimatedCompletionDate, 9);
          const estimatedGreenCardDate = addMonths(estimatedFinalActionDate, 4);
          
          newResultsData.predictedFilingDate = `Likely completed by ${format(estimatedCompletionDate, 'MM/dd/yyyy')}`;
          newResultsData.predictedFinalActionDate = format(estimatedFinalActionDate, 'MM/dd/yyyy');
          newResultsData.greenCardInHand = format(estimatedGreenCardDate, 'MM/dd/yyyy');
          
          setResults(newResultsData);
          setError(`⚠️ Your Priority Date (${format(priorityDate, 'MM/dd/yyyy')}) is from ${Math.floor(yearsFromPriorityDate)} years ago. You likely already received your Green Card or are very close to receiving it. The dates shown are historical estimates. Please check your current immigration status or consult with an immigration attorney.`);
          return;
        }

        let permApprovalDateObj: Date | null = null;
        if (visaType === 'employment' && permDays && priorityDate && isValid(priorityDate)) {
          const expectedPermDt = new Date(priorityDate);
          expectedPermDt.setDate(expectedPermDt.getDate() + permDays);
          if (isValid(expectedPermDt)) {
            newResultsData.expectedPermDate = format(expectedPermDt, 'MM/dd/yyyy');
            permApprovalDateObj = startOfMonth(expectedPermDt);
          } else { newResultsData.expectedPermDate = "Invalid PERM date calculation"; }
        } else { newResultsData.expectedPermDate = null; }

        const todayStartOfMonth = startOfMonth(new Date());
        let earliestActionStartDate = todayStartOfMonth;
        if (permApprovalDateObj && isValid(permApprovalDateObj)) {
            earliestActionStartDate = max([todayStartOfMonth, permApprovalDateObj]);
        } else if (priorityDate && isValid(priorityDate)) {
            earliestActionStartDate = max([todayStartOfMonth, startOfMonth(priorityDate)]);
        }
        
        const BUFFER_MONTHS_FILING_TO_FINAL_ACTION = 9;
        const BUFFER_MONTHS_FINAL_ACTION_TO_GC = 4;
        const CONSERVATISM_BUFFER_MONTHS_FOR_PROPHET_FILING = 7;

        if (newResultsData.filing) {
          const currentForecastFile = visaType === 'employment' ? employmentForecastData : familyForecastData;
          const typedForecastData = currentForecastFile as ForecastByCategory;
          const categorySpecificForecast = typedForecastData[category];

          if (newResultsData.filing.isCurrent) {
            newResultsData.predictedFilingDate = `Dates for Filing: Current${visaType === 'employment' ? ' (actual filing subject to PERM approval)' : ''}.`;
            const actualFilingPossibleMonth = earliestActionStartDate;
            const finalActionEstimate = addMonths(actualFilingPossibleMonth, BUFFER_MONTHS_FILING_TO_FINAL_ACTION);
            newResultsData.predictedFinalActionDate = format(finalActionEstimate, 'MM/dd/yyyy');
            const gcEstimate = addMonths(finalActionEstimate, BUFFER_MONTHS_FINAL_ACTION_TO_GC);
            newResultsData.greenCardInHand = format(gcEstimate, 'MM/dd/yyyy');
          } else if (newResultsData.filing.cutoffText !== 'Unavailable' &&
                     !newResultsData.filing.cutoffText.startsWith('Invalid Date') &&
                     !newResultsData.filing.cutoffText.startsWith('N/A')) {
            
            if (categorySpecificForecast && Object.keys(categorySpecificForecast).length > 0) {
              const pdOrdinal = Math.floor(priorityDate.getTime() / 86400000) + 719163;

              const knownForecastEntries = Object.entries(categorySpecificForecast)
                .map(([monthYear, entry]) => ({
                  monthYearDate: parse(monthYear + '-01', 'yyyy-MM-dd', new Date()),
                  ordinal: entry.ordinal,
                  forecastCutoffDate: parse(entry.cutoff_date, 'yyyy-MM-dd', new Date())
                }))
                .filter(item => isValid(item.monthYearDate) && isValid(item.forecastCutoffDate) && item.ordinal !== undefined)
                .sort((a, b) => a.monthYearDate.getTime() - b.monthYearDate.getTime());

              if (knownForecastEntries.length > 0) {
                const recentForecasts = knownForecastEntries.slice(-12);
                const deltasInDays = recentForecasts.map((e, i, arr) => i > 0 ? e.ordinal - arr[i-1].ordinal : 0).slice(1).filter(d => d > 0 && d < 730);
                let averageMonthlyAdvanceInDays = (deltasInDays.length >= 1) ? (deltasInDays.reduce((a, b) => a + b, 0) / deltasInDays.length) : 30;
                averageMonthlyAdvanceInDays = Math.max(15, Math.min(averageMonthlyAdvanceInDays, 180));
                const lastKnownForecastPoint = knownForecastEntries[knownForecastEntries.length - 1];
                let actualFilingPossibleMonth: Date;
                let filingWindowMessageSuffix = "";

                if (pdOrdinal > lastKnownForecastPoint.ordinal && averageMonthlyAdvanceInDays > 0) {
                  const remainingDaysToAdvance = pdOrdinal - lastKnownForecastPoint.ordinal;
                  const monthsToReachPdForFiling = Math.ceil(remainingDaysToAdvance / averageMonthlyAdvanceInDays);
                  let baseProjectionDate = startOfMonth(addMonths(new Date(lastKnownForecastPoint.monthYearDate), 1));
                  const prophetPredictedFilingMonth = addMonths(baseProjectionDate, monthsToReachPdForFiling);
                  actualFilingPossibleMonth = max([prophetPredictedFilingMonth, earliestActionStartDate]);
                                      newResultsData.predictedFilingDate = format(actualFilingPossibleMonth, 'MM/dd/yyyy') + filingWindowMessageSuffix;
                } else if (pdOrdinal <= lastKnownForecastPoint.ordinal) {
                  let prophetForecastMonthForPD = lastKnownForecastPoint.monthYearDate;
                  for (const entry of knownForecastEntries) {
                    if (pdOrdinal <= entry.ordinal) { prophetForecastMonthForPD = entry.monthYearDate; break; }
                  }
                  prophetForecastMonthForPD = startOfMonth(prophetForecastMonthForPD);
                  const adjustedProphetFilingMonth = addMonths(prophetForecastMonthForPD, CONSERVATISM_BUFFER_MONTHS_FOR_PROPHET_FILING);
                  actualFilingPossibleMonth = max([adjustedProphetFilingMonth, earliestActionStartDate]);
                  newResultsData.predictedFilingDate = format(actualFilingPossibleMonth, 'MM/dd/yyyy');
                } else {
                  newResultsData.predictedFilingDate = "Prediction N/A (no positive trend/PD too far).";
                  actualFilingPossibleMonth = earliestActionStartDate;
                }
                
                if (newResultsData.predictedFilingDate && !newResultsData.predictedFilingDate.toLowerCase().includes("n/a")) {
                  const finalActionDateReached = addMonths(actualFilingPossibleMonth, BUFFER_MONTHS_FILING_TO_FINAL_ACTION);
                  newResultsData.predictedFinalActionDate = format(finalActionDateReached, 'MM/dd/yyyy');
                  const greenCardDateReached = addMonths(finalActionDateReached, BUFFER_MONTHS_FINAL_ACTION_TO_GC);
                  newResultsData.greenCardInHand = format(greenCardDateReached, 'MM/dd/yyyy');
                } else {
                    newResultsData.predictedFinalActionDate = "N/A due to filing date prediction.";
                    newResultsData.greenCardInHand = "N/A due to filing date prediction.";
                }
              } else { newResultsData.predictedFilingDate = "Not enough valid forecast entries for trend calculation."; }
            } else { newResultsData.predictedFilingDate = `No forecast data found for category: ${category} in ${visaType}_forecast.json.`; }
          } else {
            newResultsData.predictedFilingDate = `Forecasting N/A (Current Filing status: ${newResultsData.filing.cutoffText}).`;
            newResultsData.predictedFinalActionDate = "N/A";
            newResultsData.greenCardInHand = "N/A";
          }
        } else {
            newResultsData.predictedFilingDate = "Filing status could not be determined.";
            newResultsData.predictedFinalActionDate = "N/A";
            newResultsData.greenCardInHand = "N/A";
        }
        setResults(newResultsData);
      } catch (e: any) {
          console.error("Error in handleCheckStatus logic:", e);
          setError(`An unexpected error occurred: ${e.message}`);
          setResults(null);
      } finally {
          setLoadingAction(false);
      }
    }, 100);
  };

  const currentCategories = categoriesMap[visaType] || [];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ml:2}}>Loading Visa Data & Forecaster...</Typography>
      </Box>
    );
  }
  if (error && !vbData && !loading) {
    return (
      <Box sx={{mt:5}}>
        <Alert severity="error" sx={{whiteSpace:'pre-wrap'}}>
          <Typography fontWeight="bold">Critical Data Load Failure:</Typography>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%' }}>
        {/* Header Section */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 4,
            py: 2,
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '200%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              animation: 'shimmer 3s infinite',
              '@keyframes shimmer': {
                '0%': { transform: 'translateX(-100%)' },
                '100%': { transform: 'translateX(100%)' },
              },
            },
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2.5rem' },
              background: 'linear-gradient(135deg, #1E3A8A, #3B82F6, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 1,
              letterSpacing: '-0.02em',
            }}
          >
            Visa Bulletin Analyzer
          </Typography>

        </Box>



        {/* Main Content */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
          }}
        >
          <Box p={{ xs: 3, sm: 4 }}>
              <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="vt-lbl" sx={{ color: '#2E3B55' }}>Visa Type</InputLabel>
                      <Select 
                        labelId="vt-lbl" 
                        value={visaType} 
                        label="Visa Type" 
                        onChange={e=>setVisaType(e.target.value as 'family'|'employment')}
                        sx={{
                          color: '#2E3B55',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(46, 59, 85, 0.2)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(46, 59, 85, 0.3)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#2E3B55',
                          },
                        }}
                      >
                        <MenuItem value="employment">Employment-Based</MenuItem>
                        <MenuItem value="family">Family-Based</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth variant="outlined" disabled={!currentCategories||currentCategories.length===0}>
                      <InputLabel id="cat-lbl" sx={{ color: '#2E3B55' }}>Category</InputLabel>
                      <Select 
                        labelId="cat-lbl" 
                        value={category} 
                        label="Category" 
                        onChange={e=>setCategory(e.target.value)}
                        sx={{
                          color: '#2E3B55',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(46, 59, 85, 0.2)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(46, 59, 85, 0.3)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#2E3B55',
                          },
                        }}
                      >
                        {currentCategories.map(ci=>(<MenuItem key={ci.value} value={ci.value}>{ci.label}</MenuItem>))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="ca-lbl" sx={{ color: '#2E3B55' }}>Country</InputLabel>
                      <Select 
                        labelId="ca-lbl" 
                        value={chargeabilityArea} 
                        label="Country" 
                        onChange={e=>setChargeabilityArea(e.target.value)}
                        sx={{
                          color: '#2E3B55',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(46, 59, 85, 0.2)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(46, 59, 85, 0.3)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#2E3B55',
                          },
                        }}
                      >
                        {chargeabilityAreas.map(ai=>(<MenuItem key={ai.value} value={ai.value}>{ai.value}</MenuItem>))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <DatePicker
                        label="Your Priority Date"
                        value={priorityDate}
                        onChange={nv=>{setPriorityDate(nv);setResults(null);setError(null);}}
                        slotProps={{
                          textField:{
                            fullWidth:true,
                            variant:'outlined', 
                            helperText: visaType === 'employment' && permDays ? "Enter PERM filing date if applicable" : "Enter your I-130/I-140 Priority Date",
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                color: '#2E3B55',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(46, 59, 85, 0.2)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(46, 59, 85, 0.3)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#2E3B55',
                                },
                              },
                              '& .MuiInputLabel-root': {
                                color: '#2E3B55',
                              },
                              '& .MuiFormHelperText-root': {
                                color: '#465B82',
                              },
                            }
                          }
                        }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{
                          fontWeight: 600,
                          mt: 1,
                          py: 1.5,
                          bgcolor: '#2E3B55',
                          color: 'white',
                          '&:hover': {
                            bgcolor: '#1A2438',
                          },
                          '&:disabled': {
                            bgcolor: 'rgba(46, 59, 85, 0.12)',
                            color: 'rgba(255, 255, 255, 0.7)',
                          },
                        }}
                        onClick={handleCheckStatus}
                        disabled={loadingAction || !priorityDate || !vbData}
                    >
                      {loadingAction?<CircularProgress size={24} sx={{mr:1, color: 'white'}}/>:null}
                      <Typography sx={{ color: 'white' }}>Check Status & Forecast</Typography>
                    </Button>
                  </Grid>
                  {error && !loadingAction && (
                    <Grid item xs={12}><Alert severity="error" sx={{mt:2,whiteSpace:'pre-wrap'}}>{error}</Alert></Grid>
                  )}
                  {results && !loadingAction && (
                    <Grid item xs={12} sx={{mt:2}}>
                      <VisaTimeline 
                        results={results} 
                        visaType={visaType} 
                        priorityDate={priorityDate} 
                      />
                    </Grid>
                  )}

                  <Typography variant="h6" gutterBottom fontWeight={500} sx={{mt:2, color: '#2E3B55'}}>Disclaimer:</Typography>
                  <Alert severity="warning" sx={{mt:1}}>
                    <Typography fontWeight="bold" component="span" color="#2E3B55">EXPERIMENTAL FORECASTS: </Typography>
                    <Typography component="span" color="#465B82">
                      All forecasts are for informational and illustrative purposes only, and ARE NOT legal or immigration advice. Visa Bulletin movements are highly complex and subject to change due to various factors including demand, visa availability, and policy shifts.
                    </Typography>
                    <Typography fontWeight="bold" component="span" display="block" sx={{mt:1, color: '#2E3B55'}}>DO NOT MAKE CRITICAL LIFE DECISIONS BASED SOLELY ON THESE FORECASTS.</Typography>
                    <Typography component="span" color="#465B82">
                      Always consult a qualified immigration attorney for advice specific to your situation. Data accuracy or completeness is not guaranteed.
                    </Typography>
                                    </Alert>
                </Grid>
              </Box>
          </Paper>
        </Box>
      </LocalizationProvider>
    );
  };

export default PriorityDateChecker;