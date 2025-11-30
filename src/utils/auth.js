// Hardcoded admin accounts
const ADMIN_ACCOUNTS = [
  { username: 'admin', password: 'admin123', email: 'admin@pythonlearn.com' },
  { username: 'teacher', password: 'teacher123', email: 'teacher@pythonlearn.com' }
];

export const isAdmin = (username) => {
  return ADMIN_ACCOUNTS.some(acc => acc.username === username);
};

export const login = (username, password) => {
  // Check admin accounts
  const admin = ADMIN_ACCOUNTS.find(acc => acc.username === username && acc.password === password);
  if (admin) {
    const userData = {
      username: admin.username,
      email: admin.email,
      isAdmin: true,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('user', JSON.stringify(userData));
    return { success: true, user: userData };
  }

  // Check regular users from localStorage
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    const userData = {
      username: user.username,
      email: user.email,
      isAdmin: false,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('user', JSON.stringify(userData));
    return { success: true, user: userData };
  }

  return { success: false, message: 'Invalid username or password' };
};

export const register = (username, email, password) => {
  // Check if username already exists in admin accounts
  if (ADMIN_ACCOUNTS.some(acc => acc.username === username)) {
    return { success: false, message: 'Username already taken' };
  }

  // Check if username exists in regular users
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.some(u => u.username === username)) {
    return { success: false, message: 'Username already taken' };
  }

  // Add new user
  const newUser = {
    username,
    email,
    password,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  // Auto login
  const userData = {
    username: newUser.username,
    email: newUser.email,
    isAdmin: false,
    loginTime: new Date().toISOString()
  };
  localStorage.setItem('user', JSON.stringify(userData));

  return { success: true, user: userData };
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return !!getCurrentUser();
};

