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
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, PersonAdd as RegisterIcon } from '@mui/icons-material';
import { login } from '../../store/slices/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!email.includes('@')) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await dispatch(login({ email, password }));
    if (!result.error) {
      navigate('/dashboard');
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={24} sx={{ p: 5, borderRadius: 4 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="#1e3a8a">
              ✈️ Airport Fuel Management
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Login to access the fuel management system
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              autoFocus
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={24} /> : <><LoginIcon sx={{ mr: 1 }} /> Login</>}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleRegisterClick}
              sx={{ py: 1.5 }}
              startIcon={<RegisterIcon />}
            >
              Create New Account
            </Button>

            <Box mt={2} textAlign="center">
              <Typography variant="body2" color="textSecondary">
                New to the platform?{' '}
                <Button 
                  color="primary" 
                  onClick={handleRegisterClick}
                  sx={{ textTransform: 'none', fontWeight: 'bold' }}
                >
                  Register here
                </Button>
              </Typography>
            </Box>
          </form>

          <Box mt={3} textAlign="center">
            <Typography variant="caption" color="textSecondary">
              Demo Credentials: admin@example.com / admin123
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}