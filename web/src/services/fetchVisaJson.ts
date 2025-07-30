// src/services/fetchVisaJson.ts
const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/6822940a8a456b79669c86e9/latest';
const JSONBIN_API_KEY = '$2a$10$chnGp34LEzygcMi0MZX3Lez0oi8NoWGnrfskj9TjdapYXh8nou2sC';

export const fetchVisaJson = async () => {
    const res = await fetch(JSONBIN_URL, {
        headers: {
          'X-Master-Key': JSONBIN_API_KEY,
        },
      }
    );
  
    if (!res.ok) {
      throw new Error(`JSONBin API error: ${res.status} - ${res.statusText}`);
    }

    const data = await res.json();
    console.log('🗂️ JSONBin Visa Bulletin Data:', data.record); // ✅ 여기
    return data.record; // ✅ 여기서 visa bulletin JSON 반환됨
  };
  