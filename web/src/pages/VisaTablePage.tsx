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
  Paper,
  Fade,
  Slide,
  Grid,
  Card,
  CardContent,
  Divider,
  alpha,
  useTheme,
  Avatar,
} from '@mui/material';
import { CalendarMonth, TableView, TrendingUp } from '@mui/icons-material';
import VisaTable from '../components/VisaTable';
import { VisaBulletinData } from '../types/visa';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ✅ Fiscal Year 계산 함수
const getFiscalYear = (year: string, month: string): string => {
  const monthIndex = months.indexOf(month); // 0 = January, 9 = October
  return monthIndex >= 9 ? (parseInt(year) + 1).toString() : year;
};

interface AvailableData {
  [year: string]: string[]; // year -> available months for that year
}

const VisaTablePage = () => {
  const [year, setYear] = useState('2025');
  const [month, setMonth] = useState('');
  const [vbData, setVbData] = useState<VisaBulletinData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableData, setAvailableData] = useState<AvailableData>({});
  const [dataLoading, setDataLoading] = useState(true);
  const theme = useTheme();

  // Load available data from index.json
  useEffect(() => {
    const loadAvailableData = async () => {
      try {
        setDataLoading(true);
        const response = await fetch('/parsed_json/index.json');
        if (!response.ok) throw new Error('Failed to load index');
        
        const indexData: string[] = await response.json();
        const parsedData: AvailableData = {};
        
        indexData.forEach((entry) => {
          // Parse "FY2025/August-2025" format
          const match = entry.match(/FY\d{4}\/(.+)-(\d{4})/);
          if (match) {
            const [, month, year] = match;
            const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
            
            if (!parsedData[year]) {
              parsedData[year] = [];
            }
            parsedData[year].push(capitalizedMonth);
          }
        });
        
        setAvailableData(parsedData);
        
        // Set initial values to the most recent available data
        const availableYears = Object.keys(parsedData).sort((a, b) => parseInt(b) - parseInt(a));
        if (availableYears.length > 0) {
          const latestYear = availableYears[0];
          const availableMonthsForLatestYear = parsedData[latestYear];
          if (availableMonthsForLatestYear.length > 0) {
            // Sort months by order in the months array
            const sortedMonths = availableMonthsForLatestYear.sort((a, b) => {
              return months.indexOf(b) - months.indexOf(a); // Latest month first
            });
            setYear(latestYear);
            setMonth(sortedMonths[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load available data:', err);
        setError('Failed to load available data.');
      } finally {
        setDataLoading(false);
      }
    };

    loadAvailableData();
  }, []);

  const handleMonthChange = (e: SelectChangeEvent) => setMonth(e.target.value);
  
  const handleYearChange = (e: SelectChangeEvent) => {
    const newYear = e.target.value;
    setYear(newYear);
    
    // Reset month to first available month for the new year
    const availableMonthsForYear = availableData[newYear] || [];
    if (availableMonthsForYear.length > 0) {
      // Sort months by order in the months array and select the latest
      const sortedMonths = availableMonthsForYear.sort((a, b) => {
        return months.indexOf(b) - months.indexOf(a); // Latest month first
      });
      setMonth(sortedMonths[0]);
    } else {
      setMonth('');
    }
  };

  useEffect(() => {
    if (!month || !year || dataLoading) return;

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
  }, [month, year, dataLoading]);

  // Get available years and months for dropdowns
  const availableYears = Object.keys(availableData).sort((a, b) => parseInt(b) - parseInt(a));
  const availableMonthsForCurrentYear = availableData[year] || [];

  if (dataLoading) {
    return (
      <Box
        sx={{
          minHeight: 'calc(100vh - 70px)',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress
            size={60}
            sx={{ color: '#3B82F6', mb: 2 }}
          />
          <Typography variant="h6" sx={{ color: '#64748B' }}>
            Loading available data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 70px)',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="xl">
        <Fade in timeout={600}>
          <Box>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Slide direction="up" in mountOnEnter timeout={400}>
                <Box>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 3,
                      background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                      boxShadow: '0 8px 32px rgba(30, 58, 138, 0.3)',
                    }}
                  >
                    <TableView sx={{ fontSize: '2rem' }} />
                  </Avatar>
                  <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                      background: 'linear-gradient(135deg, #1E3A8A, #3B82F6, #7C3AED)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      mb: 2,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Visa Bulletin Tables
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#64748B',
                      fontWeight: 500,
                      maxWidth: '600px',
                      mx: 'auto',
                      lineHeight: 1.6,
                    }}
                  >
                    Browse historical visa bulletin data by month and year
                  </Typography>
                </Box>
              </Slide>
            </Box>

            {/* Date Selection Controls */}
            <Slide direction="up" in mountOnEnter timeout={600}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mb: 4,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CalendarMonth sx={{ mr: 2, color: '#3B82F6', fontSize: '1.5rem' }} />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: '#1E293B',
                    }}
                  >
                    Select Date
                  </Typography>
                </Box>

                <Grid container spacing={3} justifyContent="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel sx={{ color: '#64748B' }}>Year</InputLabel>
                      <Select
                        value={year}
                        onChange={handleYearChange}
                        label="Year"
                        sx={{
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        }}
                      >
                        {availableYears.map((y) => (
                          <MenuItem key={y} value={y}>{y}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel sx={{ color: '#64748B' }}>Month</InputLabel>
                      <Select
                        value={month}
                        onChange={handleMonthChange}
                        label="Month"
                        sx={{
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        }}
                      >
                        {availableMonthsForCurrentYear
                          .sort((a, b) => months.indexOf(b) - months.indexOf(a)) // Sort by month order, latest first
                          .map((m) => (
                            <MenuItem key={m} value={m}>{m}</MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {availableMonthsForCurrentYear.length === 0 && (
                  <Alert
                    severity="info"
                    sx={{
                      mt: 3,
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      No data available for {year}. Please select a different year.
                    </Typography>
                  </Alert>
                )}
              </Paper>
            </Slide>

            {/* Loading State */}
            {loading && (
              <Fade in timeout={300}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                  <CircularProgress
                    size={60}
                    sx={{
                      color: '#3B82F6',
                      mr: 3,
                    }}
                  />
                  <Typography variant="h6" sx={{ color: '#64748B' }}>
                    Loading visa bulletin data...
                  </Typography>
                </Box>
              </Fade>
            )}

            {/* Error State */}
            {error && (
              <Fade in timeout={300}>
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    mb: 4,
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {error}
                  </Typography>
                </Alert>
              </Fade>
            )}

            {/* Data Display */}
            {vbData && (
              <Slide direction="up" in mountOnEnter timeout={800}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <TrendingUp sx={{ mr: 2, color: '#3B82F6', fontSize: '1.5rem' }} />
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: '#1E293B',
                      }}
                    >
                      {month} {year} Visa Bulletin
                    </Typography>
                  </Box>

                  {/* Family-Based Categories - Full Width */}
                  <Card
                    elevation={0}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 4,
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                      overflow: 'hidden',
                      mb: 6,
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      <Box
                        sx={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(124, 58, 237, 0.1))',
                          p: 3,
                          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: '#1E293B',
                          }}
                        >
                          Family-Based Categories
                        </Typography>
                      </Box>
                      <Box sx={{ p: 3 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#475569',
                            mb: 2,
                          }}
                        >
                          Final Action Dates
                        </Typography>
                        <Box sx={{ mb: 4 }}>
                          <VisaTable data={vbData.final_action_dates.family} title="" />
                        </Box>
                        <Divider sx={{ my: 4 }} />
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#475569',
                            mb: 2,
                          }}
                        >
                          Dates for Filing
                        </Typography>
                        <VisaTable data={vbData.dates_for_filing.family} title="" />
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Employment-Based Categories - Full Width */}
                  <Card
                    elevation={0}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 4,
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                      overflow: 'hidden',
                      mb: 4,
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      <Box
                        sx={{
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
                          p: 3,
                          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: '#1E293B',
                          }}
                        >
                          Employment-Based Categories
                        </Typography>
                      </Box>
                      <Box sx={{ p: 3 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#475569',
                            mb: 2,
                          }}
                        >
                          Final Action Dates
                        </Typography>
                        <Box sx={{ mb: 4 }}>
                          <VisaTable data={vbData.final_action_dates.employment} title="" />
                        </Box>
                        <Divider sx={{ my: 4 }} />
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#475569',
                            mb: 2,
                          }}
                        >
                          Dates for Filing
                        </Typography>
                        <VisaTable data={vbData.dates_for_filing.employment} title="" />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Slide>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default VisaTablePage;