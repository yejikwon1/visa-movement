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
  const theme = useTheme();

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
                        {years.map((y) => (
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
                        {months.map((m) => (
                          <MenuItem key={m} value={m}>{m}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
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

                  <Grid container spacing={4}>
                    <Grid item xs={12} lg={6}>
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
                              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(124, 58, 237, 0.1))',
                              p: 3,
                              borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                            }}
                          >
                            <Typography
                              variant="h6"
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
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                color: '#475569',
                                mb: 2,
                              }}
                            >
                              Final Action Dates
                            </Typography>
                            <VisaTable data={vbData.final_action_dates.family} title="" />
                            <Divider sx={{ my: 3 }} />
                            <Typography
                              variant="subtitle1"
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
                    </Grid>

                    <Grid item xs={12} lg={6}>
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
                              variant="h6"
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
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                color: '#475569',
                                mb: 2,
                              }}
                            >
                              Final Action Dates
                            </Typography>
                            <VisaTable data={vbData.final_action_dates.employment} title="" />
                            <Divider sx={{ my: 3 }} />
                            <Typography
                              variant="subtitle1"
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
                    </Grid>
                  </Grid>
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