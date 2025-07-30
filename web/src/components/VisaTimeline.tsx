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
    
    const currentDate = new Date();
    const yearsFromPriorityDate = priorityDate ? (currentDate.getTime() - priorityDate.getTime()) / (1000 * 60 * 60 * 24 * 365) : 0;
    const isVeryOldPriorityDate = yearsFromPriorityDate > 4;
    
    if (index === 0) return 'completed'; // Priority Date is always completed
    
    // For very old priority dates, mark more steps as completed
    if (isVeryOldPriorityDate) {
      if (index === 1 && visaType === 'employment') {
        // PERM step - likely completed for old priority dates
        return 'completed';
      }
      
      // Filing step
      if ((visaType === 'employment' && index === 2) || (visaType === 'family' && index === 1)) {
        return 'completed';
      }
      
      // Final Action step
      if ((visaType === 'employment' && index === 3) || (visaType === 'family' && index === 2)) {
        return 'completed';
      }
      
      // Green Card step - likely completed for very old priority dates
      if ((visaType === 'employment' && index === 4) || (visaType === 'family' && index === 3)) {
        return 'completed';
      }
    }
    
    if (index === 1 && visaType === 'employment') {
      // PERM step
      return results.expectedPermDate ? 'current' : 'upcoming';
    }
    
    // Filing step
    if ((visaType === 'employment' && index === 2) || (visaType === 'family' && index === 1)) {
      if (results.filing?.isCurrent) return 'current';
      if (results.predictedFilingDate?.includes('Current')) return 'current';
      if (results.predictedFilingDate?.includes('Likely completed by')) return 'completed';
      return 'upcoming';
    }
    
    // Final Action step
    if ((visaType === 'employment' && index === 3) || (visaType === 'family' && index === 2)) {
      if (results.finalAction?.isCurrent && results.filing?.isCurrent) return 'current';
      return 'upcoming';
    }
    
    // Green Card step
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
    const filingDate = results.filing?.isCurrent 
      ? 'Current'  // JSONBin 실제 데이터가 Current인 경우
      : results.predictedFilingDate;  // Current가 아니면 머신러닝 예측 사용
    
    steps.push({
      label: 'Filing Window',
      date: formatDate(filingDate),
      status: getStepStatus(visaType === 'employment' ? 2 : 1, filingDate),
      description: 'Can file I-485 or consular processing',
      icon: <Gavel />,
    });

    // Final Action
    const finalActionDate = results.finalAction?.isCurrent 
      ? 'Current'  // JSONBin 실제 데이터가 Current인 경우
      : results.predictedFinalActionDate;  // Current가 아니면 머신러닝 예측 사용
    
    steps.push({
      label: 'Final Action',
      date: formatDate(finalActionDate),
      status: getStepStatus(visaType === 'employment' ? 3 : 2, finalActionDate),
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
  const activeStep = timelineSteps.findIndex(step => step.status === 'current');

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
          activeStep={activeStep}
          connector={<ColorlibConnector />}
        >
          {timelineSteps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={(props) => (
                  <ColorlibStepIcon
                    {...props}
                    icon={step.icon}
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
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          <strong>Current Status:</strong>{' '}
          {(() => {
            const yearsFromPriorityDate = priorityDate ? (new Date().getTime() - priorityDate.getTime()) / (1000 * 60 * 60 * 24 * 365) : 0;
            const isVeryOldPriorityDate = yearsFromPriorityDate > 4;

            if (isVeryOldPriorityDate) {
              return `Your Priority Date is from ${Math.floor(yearsFromPriorityDate)} years ago - you likely already received your Green Card or are very close to receiving it. Please verify your current immigration status.`;
            }

            if (results.finalAction?.isCurrent && results.filing?.isCurrent) {
              return 'Both Filing and Final Action are current - you can proceed!';
            } else if (results.filing?.isCurrent) {
              return 'Filing is current - you can file your application';
            } else {
              return 'Waiting for priority date to become current';
            }
          })()}
        </Typography>
      </Box>
    </Paper>
  );
};

export default VisaTimeline; 