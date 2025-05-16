// src/pages/About.tsx
import React from 'react';
import { Container, Typography, Box, Paper, Grid, Tabs, Tab } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import TimelineIcon from '@mui/icons-material/Timeline';
import SecurityIcon from '@mui/icons-material/Security';

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      borderRadius: 2,
      backgroundColor: 'background.paper',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
      },
    }}
  >
    <Icon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  </Paper>
);

const About = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          About MYVISATRACKER.COM
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
          Your trusted companion in navigating the complex world of visa priority dates and immigration timelines.
        </Typography>
      </Box>

      <Tabs value={value} onChange={handleChange} centered>
        <Tab label="Features" />
        <Tab label="Mission" />
      </Tabs>

      {value === 0 && (
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={InfoIcon}
              title="Accurate Information"
              description="Access real-time visa bulletin data and priority date information directly from official sources."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={TimelineIcon}
              title="Smart Tracking"
              description="Get personalized estimates and track your priority date progress with our advanced analytics."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={SecurityIcon}
              title="Reliable Service"
              description="Trust in our secure and reliable platform to help you plan your immigration journey."
            />
          </Grid>
        </Grid>
      )}

      {value === 1 && (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph>
            MYVISATRACKER.COM is dedicated to simplifying the visa bulletin tracking process for immigrants, lawyers, and HR professionals. We understand the importance of accurate and timely information in immigration planning.
          </Typography>
          <Typography variant="body1" paragraph>
            Our platform provides comprehensive tools and resources to help you stay informed about visa bulletin updates and make informed decisions about your immigration journey.
          </Typography>
          <Typography variant="body1">
            Whether you're an individual tracking your priority date or a professional managing multiple cases, our service is designed to make the process more efficient and less stressful.
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default About;
