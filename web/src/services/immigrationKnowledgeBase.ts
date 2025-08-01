// Immigration Knowledge Base for diverse question handling
export interface ImmigrationKnowledge {
  processes: Record<string, ProcessInfo>;
  forms: Record<string, FormInfo>;
  concepts: Record<string, ConceptInfo>;
  timelines: Record<string, TimelineInfo>;
  requirements: Record<string, RequirementInfo>;
}

export interface ProcessInfo {
  name: string;
  description: string;
  steps: string[];
  timeframe: string;
  requirements: string[];
  relatedForms: string[];
  commonQuestions: string[];
}

export interface FormInfo {
  name: string;
  purpose: string;
  whoCanFile: string[];
  processingTime: string;
  fee: string;
  requiredDocuments: string[];
  commonMistakes: string[];
}

export interface ConceptInfo {
  term: string;
  definition: string;
  examples: string[];
  relatedConcepts: string[];
}

export interface TimelineInfo {
  process: string;
  typicalDuration: string;
  factors: string[];
  expediteOptions?: string[];
}

export interface RequirementInfo {
  category: string;
  requirements: string[];
  exceptions: string[];
  notes: string[];
}

export const immigrationKnowledgeBase: ImmigrationKnowledge = {
  processes: {
    "adjustment_of_status": {
      name: "Adjustment of Status (I-485)",
      description: "Process to become a permanent resident while in the U.S.",
      steps: [
        "Determine eligibility based on immigrant petition",
        "File Form I-485 with supporting documents",
        "Attend biometrics appointment",
        "Attend interview (if required)",
        "Receive decision"
      ],
      timeframe: "8-24 months depending on field office and case complexity",
      requirements: [
        "Approved immigrant petition (I-140, I-130, etc.)",
        "Current priority date (if applicable)",
        "Lawful status in the U.S.",
        "Medical examination",
        "No disqualifying criminal history"
      ],
      relatedForms: ["I-485", "I-765", "I-131", "I-693"],
      commonQuestions: [
        "Can I travel while I-485 is pending?",
        "Can I change jobs after filing I-485?",
        "What happens if my priority date retrogresses?"
      ]
    },
    
    "perm_labor_certification": {
      name: "PERM Labor Certification",
      description: "Process to test the U.S. labor market for available workers",
      steps: [
        "Conduct prevailing wage determination",
        "Complete recruitment process",
        "File ETA Form 9089 with DOL",
        "Await DOL decision"
      ],
      timeframe: "6-12 months",
      requirements: [
        "Permanent, full-time job offer",
        "Employer sponsorship",
        "Minimum qualifications met",
        "No qualified U.S. workers available"
      ],
      relatedForms: ["ETA-9089", "ETA-9141"],
      commonQuestions: [
        "What happens if PERM is audited?",
        "Can I change jobs during PERM process?",
        "What if there are qualified U.S. workers?"
      ]
    },

    "naturalization": {
      name: "Naturalization (N-400)",
      description: "Process to become a U.S. citizen",
      steps: [
        "Determine eligibility",
        "Complete Form N-400",
        "Submit application and fees",
        "Attend biometrics appointment",
        "Complete interview and exam",
        "Receive decision",
        "Take oath of allegiance"
      ],
      timeframe: "12-18 months",
      requirements: [
        "Permanent resident for required period",
        "Continuous residence in U.S.",
        "Physical presence requirements",
        "English and civics knowledge",
        "Good moral character"
      ],
      relatedForms: ["N-400"],
      commonQuestions: [
        "How long must I be a permanent resident?",
        "What is the English requirement?",
        "What disqualifies someone from naturalization?"
      ]
    }
  },

  forms: {
    "I-485": {
      name: "Application to Register Permanent Residence or Adjust Status",
      purpose: "Apply for permanent residence while in the U.S.",
      whoCanFile: ["Beneficiaries of approved immigrant petitions", "Certain special categories"],
      processingTime: "8-24 months",
      fee: "$1,140-$1,760 depending on age and category",
      requiredDocuments: [
        "Birth certificate",
        "Marriage certificate (if applicable)",
        "Medical examination (I-693)",
        "Tax returns",
        "Employment authorization documents"
      ],
      commonMistakes: [
        "Filing without current priority date",
        "Incomplete medical examination",
        "Missing supporting documents",
        "Incorrect fee calculation"
      ]
    },

    "I-140": {
      name: "Immigrant Petition for Alien Worker",
      purpose: "Petition for permanent residence based on employment",
      whoCanFile: ["U.S. employers", "Self-petitioners (EB-1A, EB-2 NIW)"],
      processingTime: "4-12 months (premium processing available for some categories)",
      fee: "$715 + premium processing fee if applicable",
      requiredDocuments: [
        "Labor certification (if required)",
        "Evidence of job offer",
        "Proof of qualifications",
        "Company financial documents"
      ],
      commonMistakes: [
        "Insufficient evidence of qualifications",
        "Incorrect job description",
        "Missing labor certification",
        "Inadequate proof of ability to pay"
      ]
    },

    "I-765": {
      name: "Application for Employment Authorization",
      purpose: "Apply for work authorization in the U.S.",
      whoCanFile: ["Various categories including I-485 applicants", "F-1 students", "Asylum applicants"],
      processingTime: "3-5 months",
      fee: "$410 (free for some categories)",
      requiredDocuments: [
        "Copy of I-94",
        "Evidence of eligibility category",
        "Passport-style photos"
      ],
      commonMistakes: [
        "Wrong eligibility category",
        "Timing issues with application",
        "Missing required evidence"
      ]
    }
  },

  concepts: {
    "priority_date": {
      term: "Priority Date",
      definition: "The date that establishes a person's place in line for an immigrant visa",
      examples: [
        "For family-based cases: date I-130 was filed",
        "For employment-based with PERM: date labor certification was filed",
        "For EB-1/EB-2 NIW: date I-140 was filed"
      ],
      relatedConcepts: ["visa_bulletin", "retrogression", "current"]
    },

    "retrogression": {
      term: "Retrogression",
      definition: "When priority dates move backwards in the visa bulletin",
      examples: [
        "Priority dates for China EB-2 moving from 2018 to 2017",
        "Dates becoming 'unavailable' after being current"
      ],
      relatedConcepts: ["priority_date", "visa_bulletin", "demand"]
    },

    "current": {
      term: "Current",
      definition: "When all priority dates are eligible for visa processing",
      examples: [
        "Shown as 'C' in visa bulletin",
        "No waiting period for visa availability"
      ],
      relatedConcepts: ["priority_date", "visa_bulletin"]
    },

    "portability": {
      term: "AC21 Portability",
      definition: "Ability to change jobs after I-485 pending for 180+ days",
      examples: [
        "Changing to same/similar job after 6 months",
        "Maintaining valid I-485 application"
      ],
      relatedConcepts: ["adjustment_of_status", "job_change"]
    }
  },

  timelines: {
    "eb2_india": {
      process: "EB-2 India Green Card Process",
      typicalDuration: "8-15+ years total",
      factors: [
        "PERM processing: 6-12 months",
        "I-140 processing: 4-12 months",
        "Priority date wait: 5-10+ years",
        "I-485 processing: 8-24 months"
      ]
    },

    "eb1": {
      process: "EB-1 Green Card Process",
      typicalDuration: "1-3 years",
      factors: [
        "I-140 processing: 4-12 months",
        "I-485 processing: 8-24 months (can be filed concurrently)"
      ],
      expediteOptions: ["Premium processing for I-140"]
    },

    "family_based": {
      process: "Family-Based Green Card",
      typicalDuration: "1-20+ years depending on category and country",
      factors: [
        "Relationship category (immediate relative vs. preference)",
        "Country of birth",
        "Current demand and visa availability"
      ]
    }
  },

  requirements: {
    "eb1a": {
      category: "EB-1A (Extraordinary Ability)",
      requirements: [
        "Extraordinary ability in sciences, arts, education, business, or athletics",
        "Evidence of sustained national or international acclaim",
        "Meet at least 3 of 10 criteria or provide comparable evidence",
        "Plan to continue work in area of extraordinary ability"
      ],
      exceptions: ["One-time achievement (major international award) may suffice"],
      notes: ["Self-petitioning allowed", "No labor certification required"]
    },

    "eb2_niw": {
      category: "EB-2 National Interest Waiver",
      requirements: [
        "Advanced degree or exceptional ability",
        "Proposed endeavor has substantial merit and national importance",
        "Well positioned to advance the proposed endeavor",
        "Beneficial to waive labor certification requirement"
      ],
      exceptions: ["Bachelor's + 5 years experience = advanced degree equivalent"],
      notes: ["Self-petitioning allowed", "No labor certification required"]
    }
  }
};

// Helper functions to query the knowledge base
export const getProcessInfo = (processName: string): ProcessInfo | null => {
  return immigrationKnowledgeBase.processes[processName] || null;
};

export const getFormInfo = (formName: string): FormInfo | null => {
  return immigrationKnowledgeBase.forms[formName] || null;
};

export const searchConcepts = (searchTerm: string): ConceptInfo[] => {
  return Object.values(immigrationKnowledgeBase.concepts).filter(
    concept => 
      concept.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concept.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const getRelevantKnowledge = (query: string): {
  processes: ProcessInfo[];
  forms: FormInfo[];
  concepts: ConceptInfo[];
} => {
  const queryLower = query.toLowerCase();
  
  const relevantProcesses = Object.values(immigrationKnowledgeBase.processes).filter(
    process => 
      process.name.toLowerCase().includes(queryLower) ||
      process.description.toLowerCase().includes(queryLower) ||
      process.commonQuestions.some(q => q.toLowerCase().includes(queryLower))
  );

  const relevantForms = Object.values(immigrationKnowledgeBase.forms).filter(
    form => 
      form.name.toLowerCase().includes(queryLower) ||
      form.purpose.toLowerCase().includes(queryLower)
  );

  const relevantConcepts = Object.values(immigrationKnowledgeBase.concepts).filter(
    concept => 
      concept.term.toLowerCase().includes(queryLower) ||
      concept.definition.toLowerCase().includes(queryLower)
  );

  return {
    processes: relevantProcesses,
    forms: relevantForms,
    concepts: relevantConcepts
  };
};

export {} // TypeScript isolatedModules error prevention