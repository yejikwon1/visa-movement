import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import { parse, format } from 'date-fns';
import { CheckCircle, Cancel, Warning } from '@mui/icons-material';

interface VisaTableProps {
  data: Record<string, Record<string, string>>;
  title: string;
}

const formatToMonthYearDate = (raw: string) => {
  if (!raw || raw === 'C' || raw === 'U') return raw;
  try {
    const parsed = parse(raw, 'ddMMMyy', new Date());
    return format(parsed, 'dd-LLL-yyyy').toUpperCase(); // 03-MAR-2016
  } catch {
    return raw;
  }
};

const displayCountryName = (countryCode: string) => {
  const normalized = countryCode.replace(/\s/g, '');

  if (normalized === 'AllChargeabilityAreasExceptThoseListed') {
    return (
      <>
        All Chargeability<br />
        Areas Except<br />
        Those Listed
      </>
    );
  }

  if (normalized === 'CHINA-mainlandborn') return 'CHINA';
  if (normalized === 'ELSALVADORGUATEMALAHONDURAS') return 'EL SALVADOR GUATEMALA HONDURAS';

  return countryCode.toUpperCase();
};

const StatusCell: React.FC<{ value: string }> = ({ value }) => {
  const theme = useTheme();

  if (value === 'C') {
    return (
      <Chip
        icon={<CheckCircle />}
        label="Current"
        size="small"
        sx={{
          backgroundColor: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.main,
          borderColor: alpha(theme.palette.success.main, 0.3),
          border: '1px solid',
          fontWeight: 600,
          '& .MuiChip-icon': {
            color: theme.palette.success.main,
          },
        }}
      />
    );
  }

  if (value === 'U') {
    return (
      <Chip
        icon={<Cancel />}
        label="Unavailable"
        size="small"
        sx={{
          backgroundColor: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.main,
          borderColor: alpha(theme.palette.error.main, 0.3),
          border: '1px solid',
          fontWeight: 600,
          '& .MuiChip-icon': {
            color: theme.palette.error.main,
          },
        }}
      />
    );
  }

  // Date value
  return (
    <Typography
      variant="body2"
      sx={{
        fontWeight: 500,
        color: '#475569',
        fontSize: '0.875rem',
        fontFamily: 'monospace',
      }}
    >
      {formatToMonthYearDate(value)}
    </Typography>
  );
};

const VisaTable: React.FC<VisaTableProps> = ({ data, title }) => {
  const theme = useTheme();
  const categories = Object.keys(data);
  const countries = Object.keys(data[categories[0]]);

  return (
    <Box sx={{ width: '100%' }}>
      {title && (
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            color: '#1E293B',
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          {title}
        </Typography>
      )}
      
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'auto', // Changed from 'hidden' to 'auto' for proper horizontal scrolling
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          maxHeight: '600px', // Add max height to prevent very tall tables
        }}
      >
        <Table
          sx={{
            minWidth: Math.max(800, (countries.length + 1) * 150), // Dynamic minimum width based on column count
            '& .MuiTableCell-root': {
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              padding: '12px 16px',
            },
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.05), rgba(59, 130, 246, 0.05))',
              }}
            >
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: '#1E293B',
                  textAlign: 'center',
                  position: 'sticky',
                  left: 0,
                  zIndex: 2, // Higher z-index for sticky header
                  background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.05), rgba(59, 130, 246, 0.05))',
                  backdropFilter: 'blur(10px)',
                  borderRight: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                  minWidth: '120px',
                  width: '120px',
                }}
              >
                Category
              </TableCell>
              {countries.map((country, index) => (
                <TableCell
                  key={country}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: '#1E293B',
                    textAlign: 'center',
                    minWidth: '140px',
                    width: '140px',
                    whiteSpace: 'nowrap',
                    ...(index === 0 && {
                      borderLeft: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                    }),
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      lineHeight: 1.3,
                      color: '#64748B',
                    }}
                  >
                    {displayCountryName(country)}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category, rowIndex) => (
              <TableRow
                key={category}
                sx={{
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  },
                  '&:nth-of-type(even)': {
                    backgroundColor: alpha(theme.palette.grey[100], 0.3),
                  },
                }}
              >
                <TableCell
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#374151',
                    textAlign: 'center',
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                    background: rowIndex % 2 === 0 
                      ? alpha(theme.palette.grey[100], 0.3)
                      : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRight: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                    minWidth: '120px',
                    width: '120px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {category}
                </TableCell>
                {countries.map((country, colIndex) => {
                  const normalizedCountry = country.replace(/\s/g, '');
                  const rawDate = data[category][normalizedCountry] || data[category][country];
                  return (
                    <TableCell
                      key={country}
                      sx={{
                        textAlign: 'center',
                        minWidth: '140px',
                        width: '140px',
                        whiteSpace: 'nowrap',
                        ...(colIndex === 0 && {
                          borderLeft: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                        }),
                      }}
                    >
                      <StatusCell value={rawDate} />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default VisaTable;