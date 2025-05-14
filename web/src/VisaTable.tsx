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
    return format(parsed, 'MM-LLL-yyyy').toUpperCase(); // 01-JAN-2022
  } catch {
    return raw;
  }
};

const VisaTable: React.FC<VisaTableProps> = ({ data, title }) => {
  const categories = Object.keys(data);
  const countries = Object.keys(data[categories[0]]);

  return (
    <TableContainer component={Paper} sx={{ mb: 4 }}>
      <Typography variant="h6" align="center" sx={{ pt: 2 }}>
        {title}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Category</TableCell>
            {countries.map((country) => (
              <TableCell key={country}>{country}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category}>
              <TableCell>{category}</TableCell>
              {countries.map((country) => (
                <TableCell key={country}>
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
