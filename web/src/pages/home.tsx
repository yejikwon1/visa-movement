// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Fade,
  Slide,
  alpha,
} from '@mui/material';
import { 
  SupportAgent, 
  AutoAwesome, 
  QuestionAnswer, 
  TrendingUp,
  Lightbulb,
  Schedule,
  CheckCircle
} from '@mui/icons-material';
import { fetchVisaBulletinData, fetchPermDays } from '../services/visaService';
import { VisaBulletinData } from '../types/visa';
import PriorityDateChecker from '../components/PriorityDateChecker';
import VisaTable from '../components/VisaTable';
import ChatbotPreview from '../components/ChatbotPreview';
import SEO from '../components/SEO';

const Home = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [vbData, setVbData] = useState<VisaBulletinData | null>(null);
  const [permDays, setPermDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChatPreview, setShowChatPreview] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [visaData, permData] = await Promise.all([
          fetchVisaBulletinData(),
          fetchPermDays(),
        ]);
        setVbData(visaData);
        setPermDays(permData);
        setError(null);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load visa bulletin data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Visa Bulletin Priority Date Checker",
    "description": "Track your visa bulletin priority date and immigration status with real-time updates for family and employment-based visas.",
    "url": "https://trackusvisa.com",
    "mainEntity": {
      "@type": "WebApplication",
      "name": "Visa Bulletin Tracker",
      "description": "Free tool to check priority dates and track visa bulletin updates",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Priority Date Checker",
        "Visa Bulletin Tracker", 
        "Family Visa Status",
        "Employment Visa Status",
        "Real-time Updates"
      ]
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://trackusvisa.com"
        }
      ]
    }
  };

  if (loading) {
    return (
      <>
        <SEO 
          title="Loading - Visa Bulletin Priority Date Checker"
          description="Loading visa bulletin data..."
          noIndex={true}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO 
          title="Error - Visa Bulletin Priority Date Checker"
          description="Error loading visa bulletin data"
          noIndex={true}
        />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        </Container>
      </>
    );
  }

  const chatbotFeatures = [
    {
      icon: <QuestionAnswer sx={{ fontSize: 40, color: '#3B82F6' }} />,
      title: "Interactive Q&A",
      description: "Ask any immigration question and get instant, accurate answers"
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: '#10B981' }} />,
      title: "Real-time Updates",
      description: "Get the latest visa bulletin data and processing times"
    },
    {
      icon: <Lightbulb sx={{ fontSize: 40, color: '#F59E0B' }} />,
      title: "Smart Guidance",
      description: "Personalized advice based on your specific situation"
    },
    {
      icon: <Schedule sx={{ fontSize: 40, color: '#7C3AED' }} />,
      title: "Timeline Estimates",
      description: "Calculate processing times and priority date predictions"
    }
  ];

  const exampleQuestions = [
    "How long does EB-2 processing take for Indian applicants?",
    "What documents do I need for I-485 filing?",
    "When will my priority date become current?",
    "Can I change jobs while my I-485 is pending?"
  ];

  return (
    <>
      <SEO 
        title="AI Immigration Assistant | Visa Bulletin Tracker & Priority Date Checker"
        description="Get instant answers to immigration questions with our AI assistant. Track priority dates, understand processes, and get personalized guidance. Free visa bulletin tracker and priority date calculator."
        keywords="AI immigration assistant, visa bulletin, priority date, immigration help, green card, family visa, employment visa, visa tracker, priority date checker, immigration calculator, visa bulletin dates, immigration chatbot"
        structuredData={structuredData}
      />
      
      {/* Hero Section with Chatbot Promotion */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #7C3AED 100%)',
          color: 'white',
          py: { xs: 6, md: 8 },
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Fade in timeout={800}>
                <Box>
                  <Typography 
                    variant="h2" 
                    component="h1" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '2rem', md: '3rem' },
                      lineHeight: 1.2,
                      mb: 2
                    }}
                  >
                    Your AI Immigration Assistant
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 3,
                      opacity: 0.9,
                      fontWeight: 400,
                      lineHeight: 1.4
                    }}
                  >
                    Get instant answers to all your immigration questions with our advanced AI chatbot. 
                    Track priority dates, understand processes, and get personalized guidance.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<SupportAgent />}
                      sx={{
                        backgroundColor: 'white',
                        color: '#1E3A8A',
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        '&:hover': {
                          backgroundColor: alpha('#ffffff', 0.9),
                          transform: 'translateY(-2px)',
                        },
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      }}
                    >
                      Start Chatting Now
                    </Button>
                                         <Button
                       variant="outlined"
                       size="large"
                       startIcon={<AutoAwesome />}
                       onClick={() => setShowChatPreview(!showChatPreview)}
                       sx={{
                         borderColor: 'white',
                         color: 'white',
                         px: 4,
                         py: 1.5,
                         borderRadius: 3,
                         fontWeight: 600,
                         fontSize: '1.1rem',
                         '&:hover': {
                           backgroundColor: alpha('#ffffff', 0.1),
                           borderColor: 'white',
                         },
                       }}
                     >
                       See Examples
                     </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Slide direction="left" in timeout={1000}>
                <Paper
                  elevation={0}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    p: 3,
                    color: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SupportAgent sx={{ fontSize: 40, color: '#3B82F6', mr: 2 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        AI Assistant Ready
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ask me anything about immigration
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Try asking:
                    </Typography>
                    {exampleQuestions.map((question, index) => (
                      <Chip
                        key={index}
                        label={question}
                        size="small"
                        sx={{
                          m: 0.5,
                          backgroundColor: alpha('#3B82F6', 0.1),
                          color: '#1E3A8A',
                          '&:hover': {
                            backgroundColor: alpha('#3B82F6', 0.2),
                          },
                        }}
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: 20, color: '#10B981' }} />
                    <Typography variant="body2" color="text.secondary">
                      Powered by GPT-4 with real-time visa data
                    </Typography>
                  </Box>
                </Paper>
              </Slide>
            </Grid>
          </Grid>
        </Container>
              </Box>

        {/* Chatbot Preview Section */}
        {showChatPreview && (
          <Container maxWidth="lg">
            <ChatbotPreview onStartChat={() => {
              // This will be handled by the parent component
              console.log('Start chat clicked');
            }} />
          </Container>
        )}

        <Container maxWidth="lg">
          {/* Chatbot Features Section */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            sx={{ 
              textAlign: 'center',
              fontWeight: 600,
              mb: 4
            }}
          >
            Why Choose Our AI Assistant?
          </Typography>
          
          <Grid container spacing={3}>
            {chatbotFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Fade in timeout={600 + index * 200}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(148, 163, 184, 0.1)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Box sx={{ mb: 2 }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Visa Bulletin Tracker
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
            Track your priority date and stay informed about visa bulletin updates. Our tool helps you estimate when your priority date may become current.
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Tabs
            value={tabIndex}
            onChange={(e, val) => setTabIndex(val)}
            centered
            sx={{
              mb: 4,
              '& .MuiTabs-indicator': {
                height: 3,
              },
            }}
          >
            <Tab label="Priority Date Checker" />
            <Tab label="Visa Bulletin Table" />
            <Tab label="About Us" />
          </Tabs>

          {tabIndex === 0 && <PriorityDateChecker />}
          {tabIndex === 1 && vbData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <VisaTable data={vbData.final_action_dates.family} title="Final Action Dates - Family" />
              <VisaTable data={vbData.dates_for_filing.family} title="Dates for Filing - Family" />
              <VisaTable data={vbData.final_action_dates.employment} title="Final Action Dates - Employment" />
              <VisaTable data={vbData.dates_for_filing.employment} title="Dates for Filing - Employment" />
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default Home;
