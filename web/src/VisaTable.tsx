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
} from '@mui/material';
import { parse, format } from 'date-fns';

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
  if (countryCode === 'AllChargeabilityAreasExceptThoseListed') {
    return (
      <>
        All Chargeability<br />
        Areas Except<br />
        Those Listed
      </>
    );
  }
  if (countryCode === 'CHINA-mainlandborn') {
    return 'CHINA';
  }
  return countryCode.toUpperCase();
};

const VisaTable: React.FC<VisaTableProps> = ({ data, title }) => {
  const categories = Object.keys(data);
  const countries = Object.keys(data[categories[0]]);

  return (
    <TableContainer component={Paper} sx={{ mb: 5, px: 3, py: 2 }}>
      <Typography variant="h5" align="center" sx={{ pt: 2, pb: 2 }}>
        {title}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', py: 1.5 }}>
              Category
            </TableCell>
            {countries.map((country) => (
              <TableCell
                key={country}
                sx={{
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  py: 1.5,
                  whiteSpace: 'nowrap',
                }}
              >
                {displayCountryName(country)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category}>
              <TableCell sx={{ fontSize: '1rem', py: 1.2 }}>{category}</TableCell>
              {countries.map((country) => (
                <TableCell
                  key={country}
                  sx={{ fontSize: '1rem', py: 1.2, whiteSpace: 'nowrap' }}
                >
                  {formatToMonthYearDate(data[category][country])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VisaTable;
