// Enhanced Immigration Service - Integrates all improvements for diverse question handling
import { callOpenAI } from './directOpenAI';
import { 
  classifyImmigrationQuestion, 
  generateEnhancedSystemPrompt, 
  getEnhancedContext,
  type ClassificationResult 
} from './enhancedClassifier';
import { 
  immigrationFunctions, 
  executeImmigrationFunction 
} from './immigrationFunctions';
import { fetchVisaJson } from './fetchVisaJson';

export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
  metadata?: {
    classification?: ClassificationResult;
    functionsUsed?: string[];
    visaBulletinUsed?: boolean;
  };
}

export interface ConversationContext {
  messages: ConversationMessage[];
  userProfile?: {
    categories?: string[];
    country?: string;
    priorityDate?: string;
    currentProcess?: string;
    interests?: string[];
  };
  sessionMetadata: {
    startTime: number;
    totalQuestions: number;
    categories: string[];
  };
}

class EnhancedImmigrationService {
  private conversations: Map<string, ConversationContext> = new Map();
  private maxContextLength = 10; // Keep last 10 messages for context
  
  constructor() {}

  async processQuestion(
    sessionId: string,
    userMessage: string,
    options: {
      useVisaBulletin?: boolean;
      enableFunctions?: boolean;
      maxTokens?: number;
    } = {}
  ): Promise<{
    response: string;
    classification: ClassificationResult;
    metadata: {
      functionsUsed: string[];
      visaBulletinUsed: boolean;
      processingTime: number;
    };
  }> {
    const startTime = Date.now();
    const { useVisaBulletin = true, enableFunctions = true, maxTokens = 1500 } = options;

    // Get or create conversation context
    let context = this.conversations.get(sessionId);
    if (!context) {
      context = this.initializeContext();
      this.conversations.set(sessionId, context);
    }

    // Add user message to context
    const userMsg: ConversationMessage = {
      role: "user",
      content: userMessage,
      timestamp: Date.now()
    };
    context.messages.push(userMsg);

    try {
      // Step 1: Classify the question
      const classification = await classifyImmigrationQuestion(
        userMessage, 
        this.getRecentHistory(context)
      );

      // Step 2: Gather required data
      let visaBulletinData = null;
      if (classification.requiresVisaBulletin && useVisaBulletin) {
        try {
          visaBulletinData = await fetchVisaJson();
        } catch (error) {
          console.warn('Could not fetch visa bulletin data:', error);
        }
      }

      // Step 3: Prepare enhanced context
      const enhancedContext = getEnhancedContext(userMessage, classification);
      
      // Step 4: Generate system prompt
      const systemPrompt = generateEnhancedSystemPrompt(classification, visaBulletinData);

      // Step 5: Prepare messages for AI
      const messages: ConversationMessage[] = [
        { role: "system", content: systemPrompt },
        ...this.getRelevantHistory(context, classification),
        userMsg
      ];

      // Step 6: Determine if function calling should be used
      const shouldUseFunctions = enableFunctions && this.shouldUseFunction(classification, userMessage);
      
      let response: string;
      let functionsUsed: string[] = [];

      if (shouldUseFunctions) {
        // Use function calling for specific queries
        const functionResult = await this.handleWithFunctions(messages, classification);
        response = functionResult.response;
        functionsUsed = functionResult.functionsUsed;
      } else {
        // Standard AI response
        response = await callOpenAI(messages);
      }

      // Step 7: Update conversation context
      const assistantMsg: ConversationMessage = {
        role: "assistant",
        content: response,
        timestamp: Date.now(),
        metadata: {
          classification,
          functionsUsed,
          visaBulletinUsed: !!visaBulletinData
        }
      };
      context.messages.push(assistantMsg);

      // Update user profile based on the conversation
      this.updateUserProfile(context, classification, userMessage);

      // Trim context if too long
      this.trimContext(context);

      const processingTime = Date.now() - startTime;

      return {
        response,
        classification,
        metadata: {
          functionsUsed,
          visaBulletinUsed: !!visaBulletinData,
          processingTime
        }
      };

    } catch (error) {
      console.error('Enhanced service error:', error);
      // Fallback to basic response
      const fallbackResponse = await this.getFallbackResponse(userMessage);
      
      const assistantMsg: ConversationMessage = {
        role: "assistant",
        content: fallbackResponse,
        timestamp: Date.now()
      };
      context.messages.push(assistantMsg);

      return {
        response: fallbackResponse,
        classification: {
          category: 'general_info',
          confidence: 0.5,
          requiresVisaBulletin: false,
          requiresKnowledgeBase: false,
          suggestedContext: []
        },
        metadata: {
          functionsUsed: [],
          visaBulletinUsed: false,
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  private initializeContext(): ConversationContext {
    return {
      messages: [],
      sessionMetadata: {
        startTime: Date.now(),
        totalQuestions: 0,
        categories: []
      }
    };
  }

  private getRecentHistory(context: ConversationContext): { role: "user" | "assistant"; content: string }[] {
    return context.messages
      .filter(msg => msg.role !== "system")
      .slice(-6) // Last 6 messages for classification context
      .map(msg => ({ role: msg.role as "user" | "assistant", content: msg.content }));
  }

  private getRelevantHistory(context: ConversationContext, classification: ClassificationResult): ConversationMessage[] {
    // Get messages relevant to current classification
    const relevantMessages = context.messages
      .filter(msg => {
        if (msg.role === "system") return false;
        if (!msg.metadata?.classification) return true; // Include unclassified messages
        
        // Include messages from the same category or related categories
        return msg.metadata.classification.category === classification.category ||
               this.areRelatedCategories(msg.metadata.classification.category, classification.category);
      })
      .slice(-this.maxContextLength);

    return relevantMessages;
  }

  private areRelatedCategories(cat1: string, cat2: string): boolean {
    const relatedGroups = [
      ['visa_bulletin', 'timeline_estimate'],
      ['process_guidance', 'form_help', 'document_prep'],
      ['eligibility', 'legal_concept'],
      ['strategy_advice', 'process_guidance']
    ];

    return relatedGroups.some(group => group.includes(cat1) && group.includes(cat2));
  }

  private shouldUseFunction(classification: ClassificationResult, message: string): boolean {
    const functionTriggers = [
      'how long', 'processing time', 'timeline', 'estimate',
      'requirements', 'qualify', 'eligible',
      'form', 'application', 'documents needed',
      'steps', 'process', 'how to'
    ];

    const msgLower = message.toLowerCase();
    return functionTriggers.some(trigger => msgLower.includes(trigger)) &&
           ['process_guidance', 'form_help', 'timeline_estimate', 'eligibility'].includes(classification.category);
  }

  private async handleWithFunctions(
    messages: ConversationMessage[], 
    classification: ClassificationResult
  ): Promise<{ response: string; functionsUsed: string[] }> {
    
    // Create function-enabled prompt
    const functionPrompt = `
You have access to specialized immigration functions. Use them when appropriate to provide accurate, specific information.

Available functions:
${immigrationFunctions.map(f => `- ${f.name}: ${f.description}`).join('\n')}

If the user's question can be better answered with specific data from these functions, call the appropriate function first, then provide a comprehensive answer using the function results.
`;

    const enhancedMessages = [
      { ...messages[0], content: messages[0].content + '\n\n' + functionPrompt },
      ...messages.slice(1)
    ];

    try {
      // For now, implement basic function detection and calling
      // In a full implementation, this would use OpenAI's function calling API
      const lastMessage = messages[messages.length - 1].content.toLowerCase();
      let functionsUsed: string[] = [];
      let functionResults = '';

      // Simple function detection based on keywords
      if ((lastMessage.includes('processing time') || lastMessage.includes('how long')) && 
          (lastMessage.includes('i-485') || lastMessage.includes('green card'))) {
        const result = await executeImmigrationFunction('calculateProcessingTime', { process: 'i485' });
        functionResults += `\n\n**Processing Time Analysis:**\n${result}`;
        functionsUsed.push('calculateProcessingTime');
      }

      if (lastMessage.includes('requirements') && lastMessage.includes('eb-1')) {
        const result = await executeImmigrationFunction('checkEligibilityRequirements', { category: 'eb1a' });
        functionResults += `\n\n**Eligibility Requirements:**\n${result}`;
        functionsUsed.push('checkEligibilityRequirements');
      }

      // Get AI response with function results included
      const finalMessages = enhancedMessages;
      if (functionResults) {
        finalMessages.push({
          role: "assistant",
          content: `Based on the specific data:\n${functionResults}\n\nLet me provide a comprehensive answer to your question.`
        });
      }

      const response = await callOpenAI(finalMessages);
      
      return {
        response: functionResults ? `${response}\n\n${functionResults}` : response,
        functionsUsed
      };

    } catch (error) {
      console.error('Function calling error:', error);
      // Fallback to regular response
      const response = await callOpenAI(messages);
      return { response, functionsUsed: [] };
    }
  }

  private updateUserProfile(
    context: ConversationContext, 
    classification: ClassificationResult, 
    userMessage: string
  ): void {
    if (!context.userProfile) {
      context.userProfile = {
        categories: [],
        interests: []
      };
    }

    // Track categories user is interested in
    if (!context.userProfile.categories!.includes(classification.category)) {
      context.userProfile.categories!.push(classification.category);
    }

    // Extract potential user information
    const msgLower = userMessage.toLowerCase();
    
    // Country detection
    const countries = ['india', 'china', 'mexico', 'philippines', 'korea', 'brazil'];
    const mentionedCountry = countries.find(country => msgLower.includes(country));
    if (mentionedCountry && !context.userProfile.country) {
      context.userProfile.country = mentionedCountry;
    }

    // Category detection
    const categories = ['eb-1', 'eb-2', 'eb-3', 'f-1', 'f-2', 'f-3', 'f-4'];
    const mentionedCategory = categories.find(cat => msgLower.includes(cat));
    if (mentionedCategory && !context.userProfile.interests!.includes(mentionedCategory)) {
      context.userProfile.interests!.push(mentionedCategory);
    }

    // Update session metadata
    context.sessionMetadata.totalQuestions++;
    if (!context.sessionMetadata.categories.includes(classification.category)) {
      context.sessionMetadata.categories.push(classification.category);
    }
  }

  private trimContext(context: ConversationContext): void {
    // Keep system messages and recent conversation
    const systemMessages = context.messages.filter(msg => msg.role === "system");
    const recentMessages = context.messages
      .filter(msg => msg.role !== "system")
      .slice(-this.maxContextLength);
    
    context.messages = [...systemMessages, ...recentMessages];
  }

  private async getFallbackResponse(userMessage: string): Promise<string> {
    try {
      return await callOpenAI([
        {
          role: "system",
          content: "You are a helpful U.S. immigration attorney. Provide accurate immigration advice."
        },
        {
          role: "user",
          content: userMessage
        }
      ]);
    } catch (error) {
      return "I apologize, but I'm having trouble processing your question right now. Please try again or consult with an immigration attorney for assistance.";
    }
  }

  // Public methods for managing conversations
  public getConversationHistory(sessionId: string): ConversationMessage[] {
    const context = this.conversations.get(sessionId);
    return context ? context.messages.filter(msg => msg.role !== "system") : [];
  }

  public getUserProfile(sessionId: string) {
    const context = this.conversations.get(sessionId);
    return context?.userProfile || null;
  }

  public clearConversation(sessionId: string): void {
    this.conversations.delete(sessionId);
  }

  public getSessionStats(sessionId: string) {
    const context = this.conversations.get(sessionId);
    return context?.sessionMetadata || null;
  }
}

// Export singleton instance
export const enhancedImmigrationService = new EnhancedImmigrationService();

export {} // TypeScript isolatedModules error prevention