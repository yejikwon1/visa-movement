// Function calling capabilities for specific immigration queries and calculations
import { immigrationKnowledgeBase } from './immigrationKnowledgeBase';

export interface ImmigrationFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

// Function definitions for OpenAI function calling
export const immigrationFunctions: ImmigrationFunction[] = [
  {
    name: "calculateProcessingTime",
    description: "Calculate estimated processing time for immigration processes",
    parameters: {
      type: "object",
      properties: {
        process: {
          type: "string",
          enum: ["perm", "i140", "i485", "naturalization", "i765", "i131"],
          description: "The immigration process to calculate timing for"
        },
        category: {
          type: "string",
          description: "Specific category (e.g., EB-1, EB-2, EB-3)"
        },
        country: {
          type: "string",
          description: "Country of birth (affects priority date wait times)"
        },
        currentStep: {
          type: "string",
          description: "Current stage in the process"
        }
      },
      required: ["process"]
    }
  },
  
  {
    name: "checkEligibilityRequirements",
    description: "Check eligibility requirements for specific immigration categories",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["eb1a", "eb1b", "eb1c", "eb2", "eb2_niw", "eb3", "eb4", "eb5"],
          description: "Immigration category to check requirements for"
        },
        userProfile: {
          type: "object",
          properties: {
            education: { type: "string" },
            experience: { type: "string" },
            achievements: { type: "array", items: { type: "string" } },
            jobOffer: { type: "boolean" }
          }
        }
      },
      required: ["category"]
    }
  },

  {
    name: "getFormInformation",
    description: "Get detailed information about immigration forms",
    parameters: {
      type: "object",
      properties: {
        formNumber: {
          type: "string",
          enum: ["I-485", "I-140", "I-130", "I-765", "I-131", "N-400", "I-693"],
          description: "Form number to get information about"
        },
        infoType: {
          type: "string",
          enum: ["requirements", "timeline", "fees", "documents", "common_mistakes"],
          description: "Type of information requested"
        }
      },
      required: ["formNumber"]
    }
  },

  {
    name: "analyzePriorityDateMovement",
    description: "Analyze priority date movement and predict future trends",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Visa category (e.g., 'EB-2', 'EB-3', 'F-1')"
        },
        country: {
          type: "string",
          description: "Country of chargeability"
        },
        userPriorityDate: {
          type: "string",
          description: "User's priority date in MM-DD-YYYY format"
        },
        analysisType: {
          type: "string",
          enum: ["current_status", "wait_estimate", "historical_trend"],
          description: "Type of analysis to perform"
        }
      },
      required: ["category", "country"]
    }
  },

  {
    name: "getProcessSteps",
    description: "Get detailed steps for immigration processes",
    parameters: {
      type: "object",
      properties: {
        process: {
          type: "string",
          enum: ["green_card_eb", "green_card_family", "naturalization", "work_visa"],
          description: "Immigration process to get steps for"
        },
        category: {
          type: "string",
          description: "Specific category within the process"
        },
        currentStatus: {
          type: "string",
          description: "Current status in the process"
        }
      },
      required: ["process"]
    }
  }
];

// Function implementations
export async function calculateProcessingTime(args: {
  process: string;
  category?: string;
  country?: string;
  currentStep?: string;
}): Promise<string> {
  const { process, category, country, currentStep } = args;
  
  // Base processing times (in months)
  const baseTimes: Record<string, number> = {
    'perm': 8,
    'i140': 6,
    'i485': 12,
    'naturalization': 14,
    'i765': 4,
    'i131': 4
  };

  let baseTime = baseTimes[process] || 12;
  let explanation = `Base processing time for ${process.toUpperCase()}: ${baseTime} months\n\n`;

  // Adjust for category
  if (category) {
    if (category.includes('EB-1')) {
      baseTime *= 0.8; // EB-1 typically faster
      explanation += "EB-1 adjustment: -20% (priority category)\n";
    } else if (category.includes('EB-2') && country === 'India') {
      baseTime *= 1.3; // Higher volume
      explanation += "EB-2 India adjustment: +30% (high volume)\n";
    }
  }

  // Adjust for country-specific factors
  if (country) {
    const highVolumeCountries = ['India', 'China', 'Philippines', 'Mexico'];
    if (highVolumeCountries.includes(country)) {
      baseTime *= 1.2;
      explanation += `${country} adjustment: +20% (high volume country)\n`;
    }
  }

  // Current step adjustments
  if (currentStep) {
    if (currentStep.includes('interview')) {
      baseTime *= 0.7; // Nearing completion
      explanation += "Interview stage: -30% (near completion)\n";
    } else if (currentStep.includes('review')) {
      baseTime *= 0.9;
      explanation += "Under review: -10% (active processing)\n";
    }
  }

  const finalTime = Math.round(baseTime);
  explanation += `\nEstimated total time: ${finalTime} months`;
  explanation += `\nRange: ${Math.round(finalTime * 0.7)}-${Math.round(finalTime * 1.4)} months`;
  explanation += `\n\nNote: Processing times vary by service center and case complexity.`;

  return explanation;
}

export async function checkEligibilityRequirements(args: {
  category: string;
  userProfile?: any;
}): Promise<string> {
  const { category, userProfile } = args;
  
  const requirements = immigrationKnowledgeBase.requirements[category];
  if (!requirements) {
    return `Requirements information not available for ${category}`;
  }

  let result = `**${requirements.category} Requirements:**\n\n`;
  
  // List requirements
  result += "**Required Qualifications:**\n";
  requirements.requirements.forEach((req, index) => {
    result += `${index + 1}. ${req}\n`;
  });

  // Add exceptions if any
  if (requirements.exceptions.length > 0) {
    result += "\n**Exceptions:**\n";
    requirements.exceptions.forEach(exception => {
      result += `• ${exception}\n`;
    });
  }

  // Add notes
  if (requirements.notes.length > 0) {
    result += "\n**Important Notes:**\n";
    requirements.notes.forEach(note => {
      result += `• ${note}\n`;
    });
  }

  // Analyze user profile if provided
  if (userProfile) {
    result += "\n**Your Profile Analysis:**\n";
    // Add basic analysis based on profile
    if (userProfile.education) {
      result += `Education: ${userProfile.education}\n`;
    }
    if (userProfile.experience) {
      result += `Experience: ${userProfile.experience}\n`;
    }
    result += "\n*For detailed eligibility assessment, consult with an immigration attorney.*";
  }

  return result;
}

export async function getFormInformation(args: {
  formNumber: string;
  infoType?: string;
}): Promise<string> {
  const { formNumber, infoType } = args;
  
  const formInfo = immigrationKnowledgeBase.forms[formNumber];
  if (!formInfo) {
    return `Information not available for form ${formNumber}`;
  }

  if (infoType) {
    switch (infoType) {
      case 'requirements':
        return `**${formNumber} Requirements:**\n\nWho can file: ${formInfo.whoCanFile.join(', ')}\n\nPurpose: ${formInfo.purpose}`;
      
      case 'timeline':
        return `**${formNumber} Processing Time:**\n\n${formInfo.processingTime}`;
      
      case 'fees':
        return `**${formNumber} Filing Fee:**\n\n${formInfo.fee}`;
      
      case 'documents':
        return `**${formNumber} Required Documents:**\n\n${formInfo.requiredDocuments.map((doc, i) => `${i + 1}. ${doc}`).join('\n')}`;
      
      case 'common_mistakes':
        return `**${formNumber} Common Mistakes to Avoid:**\n\n${formInfo.commonMistakes.map((mistake, i) => `${i + 1}. ${mistake}`).join('\n')}`;
      
      default:
        return getCompleteFormInfo(formInfo, formNumber);
    }
  }

  return getCompleteFormInfo(formInfo, formNumber);
}

function getCompleteFormInfo(formInfo: any, formNumber: string): string {
  return `**${formNumber}: ${formInfo.name}**

**Purpose:** ${formInfo.purpose}

**Who Can File:** ${formInfo.whoCanFile.join(', ')}

**Processing Time:** ${formInfo.processingTime}

**Filing Fee:** ${formInfo.fee}

**Required Documents:**
${formInfo.requiredDocuments.map((doc: string, i: number) => `${i + 1}. ${doc}`).join('\n')}

**Common Mistakes to Avoid:**
${formInfo.commonMistakes.map((mistake: string, i: number) => `${i + 1}. ${mistake}`).join('\n')}`;
}

export async function analyzePriorityDateMovement(args: {
  category: string;
  country: string;
  userPriorityDate?: string;
  analysisType?: string;
}): Promise<string> {
  const { category, country, userPriorityDate, analysisType } = args;
  
  let result = `**Priority Date Analysis for ${category} - ${country}**\n\n`;
  
  // This would typically connect to actual visa bulletin data
  result += `Analysis type: ${analysisType || 'current_status'}\n\n`;
  
  if (userPriorityDate) {
    result += `Your Priority Date: ${userPriorityDate}\n`;
    result += `Current Cutoff: [Would be retrieved from visa bulletin data]\n`;
    result += `Status: [Current/Not Current based on comparison]\n\n`;
  }

  result += "**Historical Trends:**\n";
  result += "• Priority date movement varies based on visa demand and country-specific limits\n";
  result += "• Retrogression can occur when demand exceeds supply\n";
  result += "• Movement is generally faster for less oversubscribed categories\n\n";

  result += "*Note: For current cutoff dates, please check the latest visa bulletin data.*";
  
  return result;
}

export async function getProcessSteps(args: {
  process: string;
  category?: string;
  currentStatus?: string;
}): Promise<string> {
  const { process, category, currentStatus } = args;
  
  let processKey = '';
  
  // Map process names to knowledge base keys
  switch (process) {
    case 'green_card_eb':
      processKey = 'adjustment_of_status';
      break;
    case 'naturalization':
      processKey = 'naturalization';
      break;
    default:
      processKey = process;
  }
  
  const processInfo = immigrationKnowledgeBase.processes[processKey];
  if (!processInfo) {
    return `Process information not available for ${process}`;
  }

  let result = `**${processInfo.name}**\n\n`;
  result += `${processInfo.description}\n\n`;
  
  result += "**Process Steps:**\n";
  processInfo.steps.forEach((step, index) => {
    const marker = currentStatus && step.toLowerCase().includes(currentStatus.toLowerCase()) ? '👉 ' : '';
    result += `${marker}${index + 1}. ${step}\n`;
  });

  result += `\n**Typical Timeframe:** ${processInfo.timeframe}\n\n`;
  
  result += "**Requirements:**\n";
  processInfo.requirements.forEach(req => {
    result += `• ${req}\n`;
  });

  if (processInfo.relatedForms.length > 0) {
    result += `\n**Related Forms:** ${processInfo.relatedForms.join(', ')}`;
  }

  return result;
}

// Function dispatcher
export async function executeImmigrationFunction(
  functionName: string, 
  args: any
): Promise<string> {
  switch (functionName) {
    case 'calculateProcessingTime':
      return await calculateProcessingTime(args);
    case 'checkEligibilityRequirements':
      return await checkEligibilityRequirements(args);
    case 'getFormInformation':
      return await getFormInformation(args);
    case 'analyzePriorityDateMovement':
      return await analyzePriorityDateMovement(args);
    case 'getProcessSteps':
      return await getProcessSteps(args);
    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}

export {} // TypeScript isolatedModules error prevention