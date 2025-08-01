// Enhanced classification system for diverse immigration questions
import { callOpenAI } from './directOpenAI';
import { getRelevantKnowledge } from './immigrationKnowledgeBase';

export type QuestionCategory = 
  | 'visa_bulletin'       // Requires current visa bulletin data
  | 'process_guidance'    // General process information
  | 'form_help'          // Form-specific questions
  | 'timeline_estimate'   // Processing time questions
  | 'eligibility'        // Qualification questions
  | 'legal_concept'      // Definition/explanation questions
  | 'document_prep'      // Documentation questions
  | 'strategy_advice'    // Case strategy questions
  | 'general_info';      // General immigration information

export interface ClassificationResult {
  category: QuestionCategory;
  confidence: number;
  requiresVisaBulletin: boolean;
  requiresKnowledgeBase: boolean;
  suggestedContext: string[];
}

export async function classifyImmigrationQuestion(
  message: string, 
  conversationHistory?: { role: "user" | "assistant"; content: string }[]
): Promise<ClassificationResult> {
  
  // Quick keyword-based pre-classification for efficiency
  const quickClassification = quickClassify(message);
  if (quickClassification.confidence > 0.8) {
    return quickClassification;
  }

  // Use AI for more complex classification
  return await aiClassifyQuestion(message, conversationHistory);
}

function quickClassify(message: string): ClassificationResult {
  const msgLower = message.toLowerCase();
  
  // High confidence patterns
  const visaBulletinKeywords = [
    'current', 'priority date', 'cutoff', 'bulletin', 'retrogression', 
    'when will', 'eb2 india', 'eb3 china', 'f2a', 'f1', 'dates for filing'
  ];
  
  const formKeywords = [
    'i-485', 'i-140', 'i-130', 'i-765', 'i-131', 'n-400', 'form', 
    'application', 'petition', 'ead', 'advance parole'
  ];
  
  const processKeywords = [
    'adjustment of status', 'perm', 'naturalization', 'green card process',
    'how to apply', 'steps', 'procedure', 'process'
  ];
  
  const eligibilityKeywords = [
    'qualify', 'eligible', 'requirements', 'criteria', 'can i', 'am i'
  ];

  // Check for visa bulletin indicators
  if (visaBulletinKeywords.some(keyword => msgLower.includes(keyword))) {
    return {
      category: 'visa_bulletin',
      confidence: 0.9,
      requiresVisaBulletin: true,
      requiresKnowledgeBase: false,
      suggestedContext: ['priority_dates', 'visa_availability']
    };
  }

  // Check for form questions
  if (formKeywords.some(keyword => msgLower.includes(keyword))) {
    return {
      category: 'form_help',
      confidence: 0.85,
      requiresVisaBulletin: false,
      requiresKnowledgeBase: true,
      suggestedContext: ['forms', 'documentation']
    };
  }

  // Check for process questions
  if (processKeywords.some(keyword => msgLower.includes(keyword))) {
    return {
      category: 'process_guidance',
      confidence: 0.8,
      requiresVisaBulletin: false,
      requiresKnowledgeBase: true,
      suggestedContext: ['processes', 'timelines']
    };
  }

  // Check for eligibility questions
  if (eligibilityKeywords.some(keyword => msgLower.includes(keyword))) {
    return {
      category: 'eligibility',
      confidence: 0.75,
      requiresVisaBulletin: false,
      requiresKnowledgeBase: true,
      suggestedContext: ['requirements', 'qualifications']
    };
  }

  // Low confidence - needs AI classification
  return {
    category: 'general_info',
    confidence: 0.3,
    requiresVisaBulletin: false,
    requiresKnowledgeBase: true,
    suggestedContext: []
  };
}

async function aiClassifyQuestion(
  message: string, 
  conversationHistory?: { role: "user" | "assistant"; content: string }[]
): Promise<ClassificationResult> {
  
  let contextString = "";
  if (conversationHistory && conversationHistory.length > 0) {
    const lastFewMessages = conversationHistory.slice(-4);
    contextString = "\n\nRecent conversation context:\n" + 
      lastFewMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  }

  const classificationPrompt = `
You are an expert immigration question classifier. Classify this question into exactly one category and determine what resources are needed.

Categories:
- visa_bulletin: Questions about current visa availability, priority dates, cutoffs, retrogression
- process_guidance: Questions about immigration processes, procedures, steps
- form_help: Questions about specific forms, applications, petitions
- timeline_estimate: Questions about processing times, how long things take
- eligibility: Questions about qualifications, requirements, whether someone qualifies
- legal_concept: Questions asking for definitions or explanations of immigration terms
- document_prep: Questions about what documents are needed, evidence requirements
- strategy_advice: Questions about case strategy, best approaches, recommendations
- general_info: General immigration information not fitting other categories

Question: "${message}"${contextString}

Respond in JSON format:
{
  "category": "one_of_the_categories_above",
  "confidence": 0.0-1.0,
  "requiresVisaBulletin": true/false,
  "requiresKnowledgeBase": true/false,
  "reasoning": "brief explanation",
  "suggestedContext": ["relevant", "context", "areas"]
}`;

  try {
    const response = await callOpenAI([
      { role: "system", content: "You are a precise classification system. Always respond with valid JSON." },
      { role: "user", content: classificationPrompt }
    ]);

    const result = JSON.parse(response);
    return {
      category: result.category,
      confidence: result.confidence,
      requiresVisaBulletin: result.requiresVisaBulletin,
      requiresKnowledgeBase: result.requiresKnowledgeBase,
      suggestedContext: result.suggestedContext || []
    };
  } catch (error) {
    console.error('AI classification failed:', error);
    // Fallback to simple classification
    return quickClassify(message);
  }
}

export function generateEnhancedSystemPrompt(
  classification: ClassificationResult,
  visaBulletinData?: any
): string {
  let prompt = `You are an expert U.S. immigration attorney. `;
  
  // Add category-specific instructions
  switch (classification.category) {
    case 'visa_bulletin':
      prompt += `Focus on providing accurate visa bulletin analysis using the current data provided. `;
      break;
    case 'process_guidance':
      prompt += `Provide comprehensive step-by-step guidance on immigration processes. `;
      break;
    case 'form_help':
      prompt += `Give detailed form preparation guidance including requirements, common mistakes, and tips. `;
      break;
    case 'timeline_estimate':
      prompt += `Provide realistic timeline estimates with factors that can affect processing times. `;
      break;
    case 'eligibility':
      prompt += `Analyze eligibility requirements thoroughly and provide clear qualification assessments. `;
      break;
    case 'legal_concept':
      prompt += `Provide clear, comprehensive explanations of immigration legal concepts with practical examples. `;
      break;
    case 'document_prep':
      prompt += `Give specific guidance on document preparation, evidence requirements, and organization. `;
      break;
    case 'strategy_advice':
      prompt += `Provide strategic immigration advice considering various options and potential outcomes. `;
      break;
    default:
      prompt += `Answer the immigration question comprehensively with practical guidance. `;
  }

  prompt += `

**ANSWER GUIDELINES:**
1. Be comprehensive and address all aspects of the question
2. Provide practical, actionable steps when applicable
3. Include relevant timeframes and processing times
4. Mention when attorney consultation is recommended
5. Use clear, non-legal language while being precise
6. Include relevant context and background information

`;

  // Add visa bulletin data if needed
  if (classification.requiresVisaBulletin && visaBulletinData) {
    prompt += `
**CURRENT VISA BULLETIN DATA:**
- ONLY use the exact data provided below
- NEVER say "Current" unless the value is exactly "C"
- Parse ALL date strings carefully

Final Action Dates:
${JSON.stringify(visaBulletinData.final_action_dates, null, 2)}

Dates for Filing:
${JSON.stringify(visaBulletinData.dates_for_filing, null, 2)}
`;
  }

  // Add knowledge base context if relevant
  if (classification.requiresKnowledgeBase) {
    prompt += `
**ADDITIONAL CONTEXT:**
Use your comprehensive knowledge of immigration law, processes, forms, and requirements to provide thorough answers.
Consider related concepts, alternatives, and practical implications.
`;
  }

  return prompt;
}

// Helper function to get enhanced context based on classification
export function getEnhancedContext(message: string, classification: ClassificationResult) {
  const relevantKnowledge = getRelevantKnowledge(message);
  
  return {
    processes: relevantKnowledge.processes,
    forms: relevantKnowledge.forms,
    concepts: relevantKnowledge.concepts,
    classification: classification
  };
}

export {} // TypeScript isolatedModules error prevention