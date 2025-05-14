export interface VisaBulletinData {
  final_action_dates: {
    employment: Record<string, Record<string, string>>;
    family: Record<string, Record<string, string>>;
  };
  dates_for_filing: {
    employment: Record<string, Record<string, string>>;
    family: Record<string, Record<string, string>>;
  };
}

export const categoryMapEmployment: Record<string, string> = {
  EB1: '1st',
  EB2: '2nd',
  EB3: '3rd',
  EB4: '4th',
  EB5: '5thUnreserved(includingC5,T5,I5,R5,NU,RU)',
};

export const categoryMapFamily: Record<string, string> = {
  F1: 'F1',
  F2A: 'F2A',
  F2B: 'F2B',
  F3: 'F3',
  F4: 'F4',
};

export const countryMap: Record<string, string> = {
  'All Chargeability Areas': 'AllChargeabilityAreasExceptThoseListed',
  'China (mainland born)': 'CHINA-mainlandborn',
  India: 'INDIA',
  Mexico: 'MEXICO',
  Philippines: 'PHILIPPINES',
}; 