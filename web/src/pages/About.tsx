// src/pages/About.tsx
import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  Fade,
  Slide,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  Security,
  Speed,
  Support,
  Update,
  Verified,
  Timeline,
} from '@mui/icons-material';

const About: React.FC = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <Analytics />,
      title: 'Advanced Analytics',
      description: 'AI-powered forecasting models analyze historical visa bulletin data to predict future trends.',
    },
    {
      icon: <TrendingUp />,
      title: 'Real-time Updates',
      description: 'Live data integration ensures you always have the most current visa bulletin information.',
    },

    {
      icon: <Speed />,
      title: 'Fast & Accurate',
      description: 'Get instant results with our optimized processing algorithms and reliable data sources.',
    },
  ];



  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 70px)',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Box>
            {/* Hero Section */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Slide direction="up" in mountOnEnter timeout={600}>
                <Box>
                  <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                      background: 'linear-gradient(135deg, #1E3A8A, #3B82F6, #7C3AED)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      mb: 2,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    About Visa Tracker
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#64748B',
                      fontWeight: 500,
                      maxWidth: '600px',
                      mx: 'auto',
                      lineHeight: 1.6,
                    }}
                  >
                    Empowering immigrants with AI-driven visa bulletin analysis and forecasting
                  </Typography>
                </Box>
              </Slide>
            </Box>

            {/* Mission Statement */}
            <Slide direction="up" in mountOnEnter timeout={700}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  mb: 6,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #1E3A8A, #3B82F6, #7C3AED)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      mr: 2,
                      width: 56,
                      height: 56,
                      background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                    }}
                  >
                    <Timeline sx={{ fontSize: '1.5rem' }} />
                  </Avatar>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#1E293B',
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    Our Mission
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#475569',
                    lineHeight: 1.8,
                    fontSize: '1.1rem',
                  }}
                >
                  We believe that navigating the U.S. immigration system should be transparent and accessible.
                  Our platform combines cutting-edge AI technology with comprehensive visa bulletin data to
                  provide accurate forecasts and real-time updates, helping thousands of immigrants make
                  informed decisions about their future.
                </Typography>
              </Paper>
            </Slide>

            {/* Features Grid */}
            <Slide direction="up" in mountOnEnter timeout={800}>
              <Grid container spacing={4} sx={{ mb: 6 }}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
                          background: 'rgba(255, 255, 255, 0.95)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              mr: 2,
                              width: 48,
                              height: 48,
                              background: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                            }}
                          >
                            {feature.icon}
                          </Avatar>
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#1E293B',
                            mb: 1,
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#64748B',
                            lineHeight: 1.6,
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Slide>



            {/* Technology Stack */}
            <Slide direction="up" in mountOnEnter timeout={1000}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      mr: 2,
                      width: 56,
                      height: 56,
                      background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                    }}
                  >
                    <Verified sx={{ fontSize: '1.5rem' }} />
                  </Avatar>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#1E293B',
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    Built with Modern Technology
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#475569',
                    lineHeight: 1.8,
                    fontSize: '1.1rem',
                    mb: 3,
                  }}
                >
                  Our platform leverages state-of-the-art technologies including React, TypeScript, Material-UI,
                  and advanced machine learning algorithms to deliver accurate predictions and an exceptional user experience.
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  {['React', 'TypeScript', 'Material-UI', 'AI/ML', 'Real-time Data', 'Responsive Design'].map((tech) => (
                    <Chip
                      key={tech}
                      label={tech}
                      variant="outlined"
                      sx={{
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        color: theme.palette.primary.main,
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Paper>
            </Slide>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default About;
