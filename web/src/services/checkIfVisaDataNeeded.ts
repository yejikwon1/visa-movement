export async function checkIfVisaDataNeeded(userInput: string): Promise<'yes' | 'no'> {
    const res = await fetch('https://visa-movement-backend.onrender.com/shouldIncludeVisaData', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userInput }),
    });
  
    const json = await res.json();
    return json.includeVisaData || 'yes';
  }
  
  // ✅ 이 한 줄 추가로 에러 해결
  export {};
  