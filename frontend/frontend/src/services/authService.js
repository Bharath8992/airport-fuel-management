import api from './api';

const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login/', {
      email: credentials.email,
      password: credentials.password
    });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register/', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      confirm_password: userData.confirm_password,
      role: userData.role || 'airline',
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      phone_number: userData.phone_number || '',
      company_name: userData.company_name || ''
    });
    return response.data;
  },
  
  verifyOTP: async (email, otp_code) => {
    const response = await api.post('/auth/verify-otp/', {
      email: email,
      otp_code: otp_code
    });
    return response.data;
  },
  
  resendOTP: async (email) => {
    const response = await api.post('/auth/resend-otp/', {
      email: email
    });
    return response.data;
  },
  
  logout: async (refreshToken) => {
    const response = await api.post('/auth/logout/', { refresh: refreshToken });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },
  
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password/', {
      old_password: passwordData.old_password,
      new_password: passwordData.new_password,
      confirm_password: passwordData.confirm_password
    });
    return response.data;
  }
};

export default authService;