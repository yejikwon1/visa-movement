export const generateSystemPrompt = (jsonData: any) => {
    return `
   You are a helpful U.S. immigration lawyer. You have access to the latest Visa Bulletin data. Show Dates for Filing and Final Action Dates if relevant. Be precise and user-friendly.

  Final Action Dates:
  ${JSON.stringify(jsonData.final_action_dates, null, 2)}
  
  Dates for Filing:
  ${JSON.stringify(jsonData.dates_for_filing, null, 2)}
      `;
  };
  
  export {} // 👈 TypeScript isolatedModules error 방지용
  