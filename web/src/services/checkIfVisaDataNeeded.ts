// Use localhost for development, deployed URL for production
const BACKEND_URL = process.env.NODE_ENV === 'development' 
  ? "http://localhost:8000" 
  : "https://visa-movement-backend.onrender.com";

export async function checkIfVisaDataNeeded(message: string): Promise<'yes' | 'no'> {
  try {
    const response = await fetch(`${BACKEND_URL}/shouldIncludeVisaData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      console.error("❌ Classification error:", data.error);
      return 'no'; // Default to no visa data needed if classification fails
    }
    
    // Normalize the response
    const result = data.includeVisaData?.toLowerCase().trim();
    return result === 'yes' ? 'yes' : 'no';
  } catch (error) {
    console.error("❌ Visa data classification error:", error);
    return 'no'; // Default to no visa data needed if service fails
  }
}

// ✅ 이 한 줄 추가로 에러 해결
export {};
  