// Optimized Chat Service - Single API call with smart visa data integration
import { fetchVisaJson } from './fetchVisaJson';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OptimizedChatResponse {
  response: string;
  metadata: {
    usedVisaData: boolean;
    processingTime: number;
  };
}

// Cached visa data to avoid repeated fetching
let cachedVisaData: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

async function getCachedVisaData(): Promise<any> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedVisaData && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedVisaData;
  }
  
  // Fetch fresh data and cache it
  try {
    cachedVisaData = await fetchVisaJson();
    cacheTimestamp = now;
    return cachedVisaData;
  } catch (error) {
    console.error('❌ Failed to fetch visa data:', error);
    return null;
  }
}

function generateOptimizedSystemPrompt(visaData: any | null): string {
  const basePrompt = `You are a helpful U.S. immigration attorney. Provide accurate, concise immigration advice.

Today is ${new Date().toLocaleDateString()}.

**INSTRUCTIONS:**
- Be precise and user-friendly
- If the question requires current visa bulletin dates, use the provided data below
- For general immigration questions, provide helpful guidance without referencing visa dates
- Date formats: "01APR23" = April 1, 2023, "C" = Current, "U" = Unavailable
- Employment categories: 1st=EB-1, 2nd=EB-2, 3rd=EB-3, Other Workers=EB-3 Unskilled`;

  if (!visaData) {
    return basePrompt;
  }

  // Only include essential visa data, not the entire JSON
  const essentialData = {
    final_action_dates: visaData.final_action_dates,
    dates_for_filing: visaData.dates_for_filing
  };

  return `${basePrompt}

**CURRENT VISA BULLETIN DATA:**
${JSON.stringify(essentialData, null, 1)}`;
}

export async function optimizedChatCall(
  messages: ChatMessage[]
): Promise<OptimizedChatResponse> {
  const startTime = Date.now();
  
  try {
    // Get the user's latest message to analyze
    const userMessage = messages.filter(msg => msg.role === 'user').pop()?.content || '';
    
    // Smart detection: does this question likely need visa data?
    console.log('🔍 Visa Data Classification Request:');
    console.log('📝 Question:', userMessage);
    
    const visaKeywords = [
      'current', 'cutoff', 'priority date', 'pd', 'eb-1', 'eb-2', 'eb-3', 'eb1', 'eb2', 'eb3',
      'filing date', 'final action', 'bulletin', 'visa', 'green card timeline',
      'india', 'china', 'mexico', 'philippines', 'korea', 'when will', 'available'
    ];
    
    const needsVisaData = visaKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Log the decision with clear formatting
    if (needsVisaData) {
      console.log('✅ VISA BULLETIN REQUIRED: YES');
      console.log('📅 Matched keywords - fetching visa bulletin data');
    } else {
      console.log('❌ VISA BULLETIN REQUIRED: NO');
      console.log('💬 General immigration question - no specific visa data needed');
    }
    
    let visaData = null;
    if (needsVisaData) {
      visaData = await getCachedVisaData();
      console.log('📊 Visa data fetched:', visaData ? 'SUCCESS' : 'FAILED');
    }
    
    console.log('==========================================');
    
    // Build optimized system prompt
    const systemPrompt = generateOptimizedSystemPrompt(visaData);
    
    // Single API call with smart context
    const optimizedMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.filter(msg => msg.role !== 'system')
    ];
    
    // Call backend
    const response = await fetch(
      process.env.NODE_ENV === 'development' 
        ? "http://localhost:8000/chat" 
        : "https://visa-movement-backend.onrender.com/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: optimizedMessages }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || "❌ No response received";
    
    const processingTime = Date.now() - startTime;
    console.log(`⚡ Optimized chat completed in ${processingTime}ms`);
    
    return {
      response: responseText,
      metadata: {
        usedVisaData: !!visaData,
        processingTime
      }
    };
    
  } catch (error) {
    console.error('❌ Optimized chat error:', error);
    const processingTime = Date.now() - startTime;
    
    return {
      response: "❌ I'm having trouble connecting right now. Please try again.",
      metadata: {
        usedVisaData: false,
        processingTime
      }
    };
  }
}

// Clear cache function for manual refresh
export function clearVisaDataCache(): void {
  cachedVisaData = null;
  cacheTimestamp = 0;
}

export {} // TypeScript isolatedModules error prevention