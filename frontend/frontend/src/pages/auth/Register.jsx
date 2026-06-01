import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Grid,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Phone, Business, Person } from '@mui/icons-material';
import { register, verifyOTP, resendOTP } from '../../store/slices/authSlice';

const steps = ['Registration', 'Email Verification'];

export default function Register() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    role: 'airline',
    phone_number: '',
    company_name: '',
  });
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const validateRegistration = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.email.includes('@')) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';
    if (formData.phone_number && formData.phone_number.length < 10) newErrors.phone_number = 'Invalid phone number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegistration()) return;

    const result = await dispatch(register(formData));
    if (!result.error) {
      setRegisteredEmail(formData.email);
      setActiveStep(1);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return;
    }

    const result = await dispatch(verifyOTP({ email: registeredEmail, otp_code: otpCode }));
    if (!result.error) {
      navigate('/dashboard');
    }
  };

  const handleResendOTP = async () => {
    await dispatch(resendOTP({ email: registeredEmail }));
  };

  const roles = [
    { value: 'airline', label: 'Airline' },
    { value: 'supplier', label: 'Fuel Supplier' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={24} sx={{ p: 5, borderRadius: 4 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="#1e3a8a">
              ✈️ Airport Fuel Management
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {activeStep === 0 ? 'Create your account' : 'Verify your email address'}
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </Alert>
          )}

          {activeStep === 0 ? (
            <form onSubmit={handleRegistrationSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    error={!!errors.username}
                    helperText={errors.username}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirm_password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirm_password}
                    onChange={handleChange}
                    error={!!errors.confirm_password}
                    helperText={errors.confirm_password}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    error={!!errors.phone_number}
                    helperText={errors.phone_number}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    {roles.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Register'}
              </Button>

              <Box textAlign="center">
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Button color="primary" onClick={() => navigate('/login')}>
                    Login here
                  </Button>
                </Typography>
              </Box>
            </form>
          ) : (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                We've sent a 6-digit verification code to {registeredEmail}. Please check your inbox (and spam folder).
              </Alert>
              
              <form onSubmit={handleVerifyOTP}>
                <TextField
                  fullWidth
                  label="Enter OTP Code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="000000"
                  error={!!errors.otp}
                  helperText={errors.otp}
                  sx={{ mb: 3 }}
                  autoFocus
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{ mb: 2, py: 1.5 }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Verify Email'}
                </Button>
                
                <Box textAlign="center">
                  <Typography variant="body2">
                    Didn't receive the code?{' '}
                    <Button color="primary" onClick={handleResendOTP} disabled={isLoading}>
                      Resend OTP
                    </Button>
                  </Typography>
                </Box>
              </form>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}