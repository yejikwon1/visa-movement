import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Button,
  Fade,
  Slide,
  alpha,
} from '@mui/material';
import {
  SupportAgent,
  Person,
  AutoAwesome,
  TrendingUp,
  Schedule,
  Lightbulb,
} from '@mui/icons-material';

interface ChatbotPreviewProps {
  onStartChat: () => void;
}

const exampleConversations = [
  {
    id: 1,
    user: "How long does EB-2 processing take for Indian applicants?",
    assistant: "For EB-2 India, the current processing time varies by stage:\n\n• PERM Labor Certification: 6-12 months\n• I-140 Petition: 6-8 months (premium processing available)\n• I-485 Adjustment: Currently retrogressed\n\nBased on current visa bulletin data, EB-2 India priority dates are moving slowly. You can check your specific priority date using our tracker above.",
    category: "Timeline",
    icon: <Schedule sx={{ fontSize: 20 }} />,
    color: "#7C3AED"
  },
  {
    id: 2,
    user: "What documents do I need for I-485 filing?",
    assistant: "For I-485 filing, you'll need:\n\n📋 Required Documents:\n• Form I-485 (Application for Adjustment of Status)\n• Form I-864 (Affidavit of Support)\n• Form I-693 (Medical Examination)\n• Birth certificate with translation\n• Passport-style photos\n• Copy of passport and visa\n• Employment authorization (if applicable)\n\n💡 Pro Tips:\n• Ensure all documents are properly translated\n• Medical exam must be from a USCIS-approved doctor\n• Keep copies of everything you submit",
    category: "Documentation",
    icon: <Lightbulb sx={{ fontSize: 20 }} />,
    color: "#F59E0B"
  },
  {
    id: 3,
    user: "When will my priority date become current?",
    assistant: "To predict when your priority date becomes current, I need:\n\n📅 Your specific priority date\n🌍 Your country of birth\n📋 Your visa category (EB-1, EB-2, EB-3, etc.)\n\nBased on current visa bulletin trends:\n• EB-1: Generally current for most countries\n• EB-2 India: Moving ~1-2 months per bulletin\n• EB-3: Varies significantly by country\n\nUse our priority date checker above to get a personalized estimate!",
    category: "Priority Date",
    icon: <TrendingUp sx={{ fontSize: 20 }} />,
    color: "#10B981"
  }
];

const ChatbotPreview: React.FC<ChatbotPreviewProps> = ({ onStartChat }) => {
  const [activeConversation, setActiveConversation] = useState(0);

  return (
    <Box sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            mb: 2
          }}
        >
          See Summer.AI in Action
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ 
            maxWidth: '600px', 
            mx: 'auto',
            mb: 4
          }}
        >
          Watch how our AI assistant provides instant, accurate answers to real immigration questions
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Conversation Preview */}
        <Box sx={{ flex: 1, minWidth: 300, maxWidth: 500 }}>
          <Paper
            elevation={0}
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              p: 3,
              border: '1px solid rgba(148, 163, 184, 0.1)',
              height: 'fit-content',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: '#3B82F6',
                  mr: 2,
                }}
              >
                <SupportAgent />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Summer.AI
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  AI Immigration Assistant
                </Typography>
              </Box>
              <AutoAwesome sx={{ ml: 'auto', color: '#7C3AED', fontSize: 20 }} />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: '#64748B',
                    mr: 2,
                    mt: 0.5,
                  }}
                >
                  <Person />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: '#1E293B' }}>
                    {exampleConversations[activeConversation].user}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: '#3B82F6',
                    mr: 2,
                    mt: 0.5,
                  }}
                >
                  <SupportAgent />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#374151',
                      whiteSpace: 'pre-line',
                      lineHeight: 1.6
                    }}
                  >
                    {exampleConversations[activeConversation].assistant}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={onStartChat}
              startIcon={<SupportAgent />}
              sx={{
                background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                color: 'white',
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Start Your Own Conversation
            </Button>
          </Paper>
        </Box>

        {/* Conversation Selector */}
        <Box sx={{ flex: 1, minWidth: 300, maxWidth: 400 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Example Questions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click on any question to see how Summer.AI responds
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {exampleConversations.map((conversation, index) => (
              <Fade in timeout={300 + index * 100} key={conversation.id}>
                <Paper
                  elevation={0}
                  onClick={() => setActiveConversation(index)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: activeConversation === index ? conversation.color : 'transparent',
                    backgroundColor: activeConversation === index 
                      ? alpha(conversation.color, 0.05) 
                      : 'rgba(255, 255, 255, 0.7)',
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: alpha(conversation.color, 0.1),
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ color: conversation.color, mr: 1 }}>
                      {conversation.icon}
                    </Box>
                    <Chip
                      label={conversation.category}
                      size="small"
                      sx={{
                        backgroundColor: alpha(conversation.color, 0.1),
                        color: conversation.color,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#374151' }}>
                    {conversation.user}
                  </Typography>
                </Paper>
              </Fade>
            ))}
          </Box>

          <Box sx={{ mt: 4, p: 3, backgroundColor: alpha('#3B82F6', 0.05), borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              💡 Pro Tip
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Summer.AI remembers your conversation context, so you can ask follow-up questions and get personalized responses based on your specific situation.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatbotPreview; 