import React from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  alpha,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
} from '@mui/material';
import {
  Schedule,
  Assignment,
  Gavel,
  CardMembership,
  CheckCircle,
  RadioButtonUnchecked,
} from '@mui/icons-material';

interface AppResultsData {
  finalAction: ResultDetail | null;
  filing: ResultDetail | null;
  expectedPermDate: string | null;
  predictedFilingDate: string | null;
  predictedFinalActionDate: string | null;
  greenCardInHand: string | null;
  currentFilingCutoff: string | null;
  currentFinalActionCutoff: string | null;
}

interface ResultDetail {
  cutoffText: string;
  isCurrent: boolean;
  statusText: string;
  formattedDate?: string;
}

interface VisaTimelineProps {
  results: AppResultsData;
  visaType: string;
  priorityDate: Date | null;
}

interface TimelineStep {
  label: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming' | 'unavailable';
  description: string;
  icon: React.ReactNode;
}

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(95deg, #2E3B55 0%, #3B82F6 50%, #10B981 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(95deg, #10B981 0%, #059669 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.grey[300],
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled('div')<{
  ownerState: { completed: boolean; active: boolean; error: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: ownerState.error
    ? theme.palette.error.main
    : ownerState.completed
    ? '#10B981'
    : ownerState.active
    ? '#3B82F6'
    : theme.palette.grey[300],
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: ownerState.active || ownerState.completed
    ? '0 4px 10px 0 rgba(0,0,0,.25)'
    : 'none',
}));

function ColorlibStepIcon(props: any) {
  const { active, completed, className, icon, error } = props;

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active, error }} className={className}>
      {icon}
    </ColorlibStepIconRoot>
  );
}

const VisaTimeline: React.FC<VisaTimelineProps> = ({ results, visaType, priorityDate }) => {
  const theme = useTheme();

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'TBD';
    if (dateStr.includes('Current')) return 'Current';
    if (dateStr.includes('N/A') || dateStr.includes('Invalid')) return 'N/A';
    return dateStr;
  };

  const getStepStatus = (index: number, result: any): 'completed' | 'current' | 'upcoming' | 'unavailable' => {
    if (!result) return 'unavailable';
    
    if (index === 0) return 'completed'; // Priority Date is always completed
    if (index === 1 && visaType === 'employment') {
      // PERM step
      return results.expectedPermDate ? 'current' : 'upcoming';
    }
    
    // Filing step
    if ((visaType === 'employment' && index === 2) || (visaType === 'family' && index === 1)) {
      if (results.filing?.isCurrent) return 'current';
      if (results.predictedFilingDate?.includes('Current')) return 'current';
      return 'upcoming';
    }
    
    // Final Action step
    if ((visaType === 'employment' && index === 3) || (visaType === 'family' && index === 2)) {
      if (results.finalAction?.isCurrent && results.filing?.isCurrent) return 'current';
      if (results.predictedFinalActionDate?.includes('Current')) return 'current';
      return 'upcoming';
    }
    
    // Green Card step
    if ((visaType === 'employment' && index === 4) || (visaType === 'family' && index === 3)) {
      if (results.greenCardInHand?.includes('Already received') || results.greenCardInHand?.includes('imminent')) {
        return 'current';
      }
    }
    return 'upcoming';
  };

  const buildTimelineSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [];

    // Priority Date (always first)
    steps.push({
      label: 'Priority Date',
      date: priorityDate ? priorityDate.toLocaleDateString() : 'N/A',
      status: 'completed',
      description: 'Your place in line established',
      icon: <Schedule />,
    });

    // PERM Approval (employment only)
    if (visaType === 'employment') {
      steps.push({
        label: 'PERM Approval',
        date: formatDate(results.expectedPermDate),
        status: getStepStatus(1, results.expectedPermDate),
        description: 'Labor certification approved',
        icon: <Assignment />,
      });
    }

    // Filing Window
    steps.push({
      label: 'Filing Window',
      date: formatDate(results.predictedFilingDate),
      status: getStepStatus(visaType === 'employment' ? 2 : 1, results.predictedFilingDate),
      description: 'Can file I-485 or consular processing',
      icon: <Gavel />,
    });

    // Final Action
    steps.push({
      label: 'Final Action',
      date: formatDate(results.predictedFinalActionDate),
      status: getStepStatus(visaType === 'employment' ? 3 : 2, results.predictedFinalActionDate),
      description: 'Decision can be made on your case',
      icon: <CheckCircle />,
    });

    // Green Card in Hand
    steps.push({
      label: 'Green Card in Hand',
      date: formatDate(results.greenCardInHand),
      status: getStepStatus(visaType === 'employment' ? 4 : 3, results.greenCardInHand),
      description: 'Physical green card received',
      icon: <CardMembership />,
    });

    return steps;
  };

  const timelineSteps = buildTimelineSteps();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h5"
          fontWeight={700}
          gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #2E3B55 0%, #3B82F6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Expected Visa Journey Timeline
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your progress through the visa application process (forecasted dates)
        </Typography>
      </Box>

      <Box sx={{ width: '100%', mb: 4 }}>
        <Stepper
          alternativeLabel
          activeStep={-1}
          connector={<ColorlibConnector />}
          sx={{
            // Improve mobile layout
            '& .MuiStep-root': {
              px: { xs: 0.5, sm: 1 }, // Reduce padding on mobile
            },
            '& .MuiStepLabel-root': {
              '& .MuiStepLabel-labelContainer': {
                maxWidth: { xs: '80px', sm: 'none' }, // Limit width on mobile
              },
            },
          }}
        >
          {timelineSteps.map((step, index) => (
            <Step 
              key={step.label}
              completed={step.status === 'completed'}
              active={step.status === 'current'}
            >
              <StepLabel
                StepIconComponent={(props) => (
                  <ColorlibStepIcon
                    {...props}
                    icon={step.icon}
                    completed={step.status === 'completed'}
                    active={step.status === 'current'}
                    error={step.status === 'unavailable'}
                  />
                )}
              >
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{
                      color: step.status === 'completed' ? '#10B981' :
                             step.status === 'current' ? '#3B82F6' :
                             step.status === 'unavailable' ? theme.palette.error.main :
                             theme.palette.text.secondary,
                    }}
                  >
                    {step.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                      mt: 0.5,
                    }}
                  >
                    {step.description}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{
                      color: step.status === 'completed' ? '#10B981' :
                             step.status === 'current' ? '#3B82F6' :
                             theme.palette.text.primary,
                      mt: 1,
                      fontSize: '0.875rem',
                    }}
                  >
                    {step.date}
                  </Typography>
                </Box>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Status Legend */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 3,
          flexWrap: 'wrap',
          pt: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#10B981',
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Completed
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#3B82F6',
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Current/Active
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: theme.palette.grey[300],
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Upcoming
          </Typography>
        </Box>
      </Box>

      {/* Additional Status Information */}
      <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
          <strong>Current Status:</strong>{' '}
          {results.greenCardInHand?.includes('Already received') || results.greenCardInHand?.includes('imminent')
            ? '🎉 You likely already have your green card! (Historical priority date with current status)'
            : results.finalAction?.isCurrent && results.filing?.isCurrent
            ? 'Both Filing and Final Action are current - you can proceed!'
            : results.filing?.isCurrent
            ? 'Filing is current - you can file your application'
            : 'Waiting for priority date to become current'}
        </Typography>
        
        {/* Current Visa Bulletin Cutoff Dates */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: { xs: 2, sm: 4 }, // Smaller gap on mobile
          flexWrap: 'wrap',
          mt: 1,
          p: { xs: 1.5, sm: 2 }, // Less padding on mobile
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="primary" fontWeight={600}>
              Current Filing Cutoff
            </Typography>
            <Typography variant="body2" fontWeight={500} sx={{ color: theme.palette.text.primary }}>
              {results.currentFilingCutoff || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="primary" fontWeight={600}>
              Current Final Action Cutoff
            </Typography>
            <Typography variant="body2" fontWeight={500} sx={{ color: theme.palette.text.primary }}>
              {results.currentFinalActionCutoff || 'N/A'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default VisaTimeline; 