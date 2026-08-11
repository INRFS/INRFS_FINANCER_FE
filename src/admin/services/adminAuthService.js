export const adminAuthService = {
  login: async (email, password) => {
    // Mock login - accepts any valid-looking credentials
    if (email && password && password.length >= 4) {
      localStorage.setItem('inrfs_admin_authenticated', 'true');
      return Promise.resolve({ success: true, user: { name: 'Super Admin', role: 'Platform Operator' } });
    }
    return Promise.reject(new Error('Invalid credentials'));
  },
  logout: () => {
    localStorage.removeItem('inrfs_admin_authenticated');
  },
  isAuthenticated: () => localStorage.getItem('inrfs_admin_authenticated') === 'true',
};
