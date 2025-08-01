// Historical Visa Data Service
export interface VisaData {
  final_action_dates: {
    family: Record<string, Record<string, string>>;
    employment: Record<string, Record<string, string>>;
  };
  dates_for_filing: {
    family: Record<string, Record<string, string>>;
    employment: Record<string, Record<string, string>>;
  };
  bulletin_date?: string;
  fiscal_year?: string;
  month?: string;
}

export interface HistoricalComparison {
  category: string;
  country: string;
  dateType: 'final_action_dates' | 'dates_for_filing';
  currentDate: string;
  historicalDates: Array<{
    date: string;
    bulletin_date: string;
    fiscal_year: string;
    month: string;
  }>;
  trend: 'advancing' | 'retrogressing' | 'unchanged' | 'mixed';
  monthsMovement: number;
}

// Fetch historical data for a specific time period
export async function fetchHistoricalData(fiscalYear: string, month: string): Promise<VisaData | null> {
  try {
    console.log(`📚 Fetching historical data for FY${fiscalYear}/${month}`);
    const response = await fetch(`/parsed_json/FY${fiscalYear}/${month}.json`);
    
    if (!response.ok) {
      console.warn(`⚠️ No data found for FY${fiscalYear}/${month}`);
      return null;
    }
    
    const data = await response.json();
    data.fiscal_year = fiscalYear;
    data.month = month;
    data.bulletin_date = `${month} ${fiscalYear}`;
    
    console.log(`✅ Successfully fetched FY${fiscalYear}/${month} data`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching FY${fiscalYear}/${month}:`, error);
    return null;
  }
}

// Fetch multiple historical data points
export async function fetchHistoricalRange(
  startYear: number, 
  endYear: number, 
  months?: string[]
): Promise<VisaData[]> {
  const historicalData: VisaData[] = [];
  const monthsToFetch = months || [
    'october', 'november', 'december', 'january', 'february', 'march',
    'april', 'may', 'june', 'july', 'august', 'september'
  ];

  console.log(`📈 Fetching historical range: FY${startYear} to FY${endYear}`);
  
  for (let year = startYear; year <= endYear; year++) {
    for (const month of monthsToFetch) {
      const data = await fetchHistoricalData(year.toString(), month);
      if (data) {
        historicalData.push(data);
      }
    }
  }
  
  console.log(`📊 Fetched ${historicalData.length} historical data points`);
  return historicalData;
}

// Parse date string to comparable format
function parseVisaDate(dateStr: string): Date | null {
  if (dateStr === 'C' || dateStr === 'U' || !dateStr) return null;
  
  // Handle DDMMMYY format (e.g., "01APR23")
  if (dateStr.match(/^\d{2}[A-Z]{3}\d{2}$/)) {
    const day = dateStr.substring(0, 2);
    const monthStr = dateStr.substring(2, 5);
    const year = '20' + dateStr.substring(5, 7);
    
    const monthMap: Record<string, string> = {
      'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
      'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
      'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
    };
    
    const month = monthMap[monthStr];
    if (month) {
      return new Date(`${year}-${month}-${day}`);
    }
  }
  
  return null;
}

// Calculate months difference between two dates
function calculateMonthsDifference(date1: Date, date2: Date): number {
  const years = date2.getFullYear() - date1.getFullYear();
  const months = date2.getMonth() - date1.getMonth();
  return years * 12 + months;
}

// Compare visa dates across time periods
export async function compareHistoricalDates(
  category: string, // e.g., "3rd" for EB-3
  country: string, // e.g., "INDIA"
  dateType: 'final_action_dates' | 'dates_for_filing',
  currentData: VisaData,
  monthsBack: number = 12
): Promise<HistoricalComparison> {
  console.log(`🔍 Comparing ${category}-${country} ${dateType} over ${monthsBack} months`);
  
  const currentYear = new Date().getFullYear();
  const startYear = Math.max(2016, currentYear - 2); // Look back max 2 years or to 2016
  
  const historicalData = await fetchHistoricalRange(startYear, currentYear);
  
  // Get current date
  const currentDate = currentData[dateType]?.employment?.[category]?.[country] || 
                     currentData[dateType]?.family?.[category]?.[country] || 'N/A';
  
  // Extract historical dates for the same category/country
  const historicalDates = historicalData
    .map(data => {
      const date = data[dateType]?.employment?.[category]?.[country] || 
                  data[dateType]?.family?.[category]?.[country];
      return {
        date: date || 'N/A',
        bulletin_date: data.bulletin_date || '',
        fiscal_year: data.fiscal_year || '',
        month: data.month || ''
      };
    })
    .filter(item => item.date !== 'N/A')
    .slice(-monthsBack); // Get last N months
  
  // Analyze trend
  let trend: 'advancing' | 'retrogressing' | 'unchanged' | 'mixed' = 'unchanged';
  let monthsMovement = 0;
  
  if (historicalDates.length >= 2) {
    const firstDate = parseVisaDate(historicalDates[0].date);
    const lastDate = parseVisaDate(currentDate);
    
    if (firstDate && lastDate) {
      monthsMovement = calculateMonthsDifference(firstDate, lastDate);
      
      if (monthsMovement > 0) {
        trend = 'advancing';
      } else if (monthsMovement < 0) {
        trend = 'retrogressing';
      } else {
        trend = 'unchanged';
      }
    }
  }
  
  console.log(`📈 Analysis complete: ${trend}, ${monthsMovement} months movement`);
  
  return {
    category,
    country,
    dateType,
    currentDate,
    historicalDates,
    trend,
    monthsMovement
  };
}

// Get recent trends for multiple categories
export async function getRecentTrends(
  categories: string[] = ['1st', '2nd', '3rd'],
  countries: string[] = ['INDIA', 'CHINA', 'AllChargeabilityAreasExceptThoseListed'],
  currentData: VisaData
): Promise<HistoricalComparison[]> {
  console.log('📊 Generating recent trends analysis...');
  
  const comparisons: HistoricalComparison[] = [];
  
  for (const category of categories) {
    for (const country of countries) {
      // Check both final action dates and dates for filing
      for (const dateType of ['final_action_dates', 'dates_for_filing'] as const) {
        const comparison = await compareHistoricalDates(
          category, 
          country, 
          dateType, 
          currentData, 
          6 // Look back 6 months
        );
        comparisons.push(comparison);
      }
    }
  }
  
  console.log(`✅ Generated ${comparisons.length} trend analyses`);
  return comparisons;
}

// Generate historical summary text
// Compare multiple categories and countries
export async function compareMultipleCategories(
  categoryRequests: Array<{
    category: string;
    country: string;
    type: 'employment' | 'family';
  }>,
  currentData: VisaData,
  monthsBack: number = 12
): Promise<HistoricalComparison[]> {
  console.log(`🔍 Comparing ${categoryRequests.length} categories over ${monthsBack} months`);
  
  const comparisons: HistoricalComparison[] = [];
  
  for (const request of categoryRequests) {
    // Check both final action dates and dates for filing
    for (const dateType of ['final_action_dates', 'dates_for_filing'] as const) {
      const comparison = await compareHistoricalDates(
        request.category,
        request.country,
        dateType,
        currentData,
        monthsBack
      );
      comparisons.push(comparison);
    }
  }
  
  console.log(`✅ Generated ${comparisons.length} comparisons`);
  return comparisons;
}

export function generateHistoricalSummary(comparisons: HistoricalComparison[]): string {
  const summaryParts: string[] = [];
  
  const advancingCategories = comparisons.filter(c => c.trend === 'advancing');
  const retrogressingCategories = comparisons.filter(c => c.trend === 'retrogressing');
  const unchangedCategories = comparisons.filter(c => c.trend === 'unchanged');
  
  if (advancingCategories.length > 0) {
    summaryParts.push(`📈 ADVANCING: ${advancingCategories.length} categories are moving forward`);
  }
  
  if (retrogressingCategories.length > 0) {
    summaryParts.push(`📉 RETROGRESSING: ${retrogressingCategories.length} categories are moving backward`);
  }
  
  if (unchangedCategories.length > 0) {
    summaryParts.push(`📊 STABLE: ${unchangedCategories.length} categories remain unchanged`);
  }
  
  return summaryParts.join('\n');
}

export {};