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
  
  ['employment', 'family'].forEach((type) => {
    Object.keys(rawRecord.dates_for_filing[type]).forEach((catKey) => {
      const categoryData = rawRecord.dates_for_filing[type][catKey];
      Object.keys(categoryData).forEach((key) => {
        const normalizedKey = key.replace(/\s/g, '');
        if (normalizedKey !== key) {
          categoryData[normalizedKey] = categoryData[key];
        }
      });
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