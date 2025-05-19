// src/services/fetchVisaJson.ts
export const fetchVisaJson = async () => {
    const res = await fetch(
      'https://api.jsonbin.io/v3/b/6822940a8a456b79669c86e9/latest',
      {
        headers: {
          'X-Master-Key': process.env.REACT_APP_JSONBIN_API_KEY!,
        },
      }
    );
  
    const data = await res.json();
    console.log('🗂️ JSONBin Visa Bulletin Data:', data.record); // ✅ 여기
    return data.record; // ✅ 여기서 visa bulletin JSON 반환됨
  };
  