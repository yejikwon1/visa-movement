import { VisaBulletinData } from '../types/visa';

const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/6822940a8a456b79669c86e9/latest';
const PERM_JSONBIN_URL = 'https://api.jsonbin.io/v3/b/68229ba28a456b79669c8a65/latest';
const JSONBIN_API_KEY = '$2a$10$chnGp34LEzygcMi0MZX3Lez0oi8NoWGnrfskj9TjdapYXh8nou2sC';

export const fetchVisaBulletinData = async (): Promise<VisaBulletinData> => {
  const response = await fetch(JSONBIN_URL, {
    headers: { 'X-Master-Key': JSONBIN_API_KEY },
  });
  const data = await response.json();
  const rawRecord = data.record;
  
  // Normalize space characters in both final_action_dates and dates_for_filing
  ['employment', 'family'].forEach((type) => {
    // Process both date sections
    ['final_action_dates', 'dates_for_filing'].forEach((dateSection) => {
      if (rawRecord[dateSection] && rawRecord[dateSection][type]) {
        Object.keys(rawRecord[dateSection][type]).forEach((catKey) => {
          const categoryData = rawRecord[dateSection][type][catKey];
          Object.keys(categoryData).forEach((key) => {
            // Handle both regular spaces and non-breaking spaces (\u00a0)
            const normalizedKey = key.replace(/[\s\u00a0]+/g, '');
            if (normalizedKey !== key) {
              categoryData[normalizedKey] = categoryData[key];
              // Also add a version without spaces but keeping the word separation
              categoryData['AllChargeabilityAreasExceptThoseListed'] = categoryData[key];
            }
          });
        });
      }
    });
  });
  
  return rawRecord;
};

export const fetchPermDays = async (): Promise<number | null> => {
  const response = await fetch(PERM_JSONBIN_URL, {
    headers: { 'X-Master-Key': JSONBIN_API_KEY },
  });
  const data = await response.json();
  const days = data.record?.record?.calendar_days;
  return typeof days === 'number' ? days : null;
}; 