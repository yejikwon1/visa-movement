export const generateSystemPrompt = (jsonData: any) => {
    console.log('📊 generateSystemPrompt 호출됨');
    console.log('🔍 입력 데이터:', jsonData);
    
    // JSON 데이터의 주요 부분들 확인
    console.log('📅 Final Action Dates:', jsonData?.final_action_dates);
    console.log('📋 Dates for Filing:', jsonData?.dates_for_filing);
    
    // 데이터 타입과 구조 확인
    console.log('🔍 JSON 데이터 타입:', typeof jsonData);
    console.log('🗂️ JSON 데이터 키들:', Object.keys(jsonData || {}));
    
    // 각 카테고리별 세부 정보 확인
    if (jsonData?.final_action_dates) {
        console.log('📊 Final Action Dates 키들:', Object.keys(jsonData.final_action_dates));
    }
    if (jsonData?.dates_for_filing) {
        console.log('📊 Dates for Filing 키들:', Object.keys(jsonData.dates_for_filing));
    }
    
    const systemPrompt = `
   You are a helpful U.S. immigration lawyer. You have access to the latest Visa Bulletin data. Show Dates for Filing and Final Action Dates if relevant. Be precise and user-friendly.
Today is ${new Date().toLocaleDateString()}.
**CRITICAL INSTRUCTIONS:**
- ONLY use the exact data provided below. Do NOT use your training data.
- NEVER say "Current" unless the value is exactly "C" 
- NEVER assume dates are current - always parse the actual date string
- Date formats:
  * DDMMMYY format: "01APR23" = April 1, 2023, "08FEB23" = February 8, 2023
  * MM-DD-YYYY format: "04-01-2023" = April 1, 2023
  * "C" = Current (available immediately)
  * "U" = Unavailable
- "AllChargeabilityAreasExceptThoseListed" means "All other countries" or "Rest of World"
- For EB-3, use the "3rd" category under employment
- Parse ALL date strings carefully - do not interpret dates as "Current"
- Double-check every date before responding

**Employment Categories:**
- 1st = EB-1 (Priority Workers)
- 2nd = EB-2 (Advanced Degree/Exceptional Ability)
- 3rd = EB-3 (Skilled Workers/Professionals)
- Other Workers = EB-3 Unskilled
- 4th = EB-4 (Special Immigrants)
- 5th = EB-5 (Investors)

  Final Action Dates:
  ${JSON.stringify(jsonData.final_action_dates, null, 2)}
  
  Dates for Filing:
  ${JSON.stringify(jsonData.dates_for_filing, null, 2)}
      `;
  
    console.log('✅ 생성된 시스템 프롬프트 길이:', systemPrompt.length);
    console.log('📝 생성된 시스템 프롬프트 미리보기:', systemPrompt.substring(0, 200) + '...');
    console.log('=============================================');
    
    return systemPrompt;
  };
  
  export {} // 👈 TypeScript isolatedModules error 방지용
  