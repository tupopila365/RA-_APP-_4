// Mock user database - in production this would come from a backend
const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    department: 'admin',
    name: 'System Administrator',
    role: 'Administrator'
  },
  {
    id: 2,
    username: 'comm_user',
    password: 'comm123',
    department: 'communications',
    name: 'Communications Manager',
    role: 'Manager'
  },
  {
    id: 3,
    username: 'frontdesk_user',
    password: 'front123',
    department: 'front_desk',
    name: 'Front Desk Officer',
    role: 'Officer'
  },
  {
    id: 4,
    username: 'proc_user',
    password: 'proc123',
    department: 'procurement',
    name: 'Procurement Officer',
    role: 'Officer'
  },
  {
    id: 5,
    username: 'hr_user',
    password: 'hr123',
    department: 'hr',
    name: 'HR Manager',
    role: 'Manager'
  }
];

const DEPARTMENTS = {
  communications: {
    name: 'Communications',
    description: 'Manage news, announcements, and public communications',
    icon: 'campaign',
    permissions: ['read_news', 'write_news', 'manage_announcements']
  },
  front_desk: {
    name: 'Front Desk',
    description: 'Handle customer inquiries and service requests',
    icon: 'support_agent',
    permissions: ['read_inquiries', 'respond_inquiries', 'manage_appointments']
  },
  procurement: {
    name: 'Procurement',
    description: 'Manage tenders, contracts, and procurement processes',
    icon: 'shopping_cart',
    permissions: ['read_tenders', 'write_tenders', 'manage_contracts']
  },
  hr: {
    name: 'Human Resources',
    description: 'Manage employee data, recruitment, and HR processes',
    icon: 'people',
    permissions: ['read_employees', 'write_employees', 'manage_recruitment']
  },
  admin: {
    name: 'Administration',
    description: 'Full system administration access',
    icon: 'admin_panel_settings',
    permissions: ['*'] // All permissions
  }
};

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  // Login with username and password
  async login(username, password) {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = MOCK_USERS.find(
        u => u.username === username && u.password === password
      );

      if (!user) {
        throw new Error('Invalid username or password');
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = user;

      this.currentUser = userWithoutPassword;
      this.isAuthenticated = true;

      // Store in localStorage for persistence
      localStorage.setItem('ra_admin_user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('ra_admin_authenticated', 'true');

      return {
        success: true,
        user: userWithoutPassword,
        department: DEPARTMENTS[user.department]
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Logout
  async logout() {
    this.currentUser = null;
    this.isAuthenticated = false;

    localStorage.removeItem('ra_admin_user');
    localStorage.removeItem('ra_admin_authenticated');

    return { success: true };
  }

  // Check if user is authenticated
  isUserAuthenticated() {
    if (this.isAuthenticated && this.currentUser) {
      return true;
    }

    // Check localStorage for persisted session
    const storedUser = localStorage.getItem('ra_admin_user');
    const isAuth = localStorage.getItem('ra_admin_authenticated') === 'true';

    if (storedUser && isAuth) {
      this.currentUser = JSON.parse(storedUser);
      this.isAuthenticated = true;
      return true;
    }

    return false;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user has permission
  hasPermission(permission) {
    if (!this.currentUser) return false;

    const userDepartment = DEPARTMENTS[this.currentUser.department];
    if (!userDepartment) return false;

    // Admin has all permissions
    if (userDepartment.permissions.includes('*')) return true;

    return userDepartment.permissions.includes(permission);
  }

  // Get user's department info
  getUserDepartment() {
    if (!this.currentUser) return null;
    return DEPARTMENTS[this.currentUser.department];
  }

  // Get all departments (for admin use)
  getAllDepartments() {
    return DEPARTMENTS;
  }

  // Get accessible departments for current user
  getAccessibleDepartments() {
    if (!this.currentUser) return [];

    // Admin can access all departments
    if (this.currentUser.department === 'admin') {
      return Object.entries(DEPARTMENTS).filter(([key]) => key !== 'admin');
    }

    // Other users can only access their own department
    const userDept = DEPARTMENTS[this.currentUser.department];
    return userDept ? [[this.currentUser.department, userDept]] : [];
  }
}

// Export singleton instance
export const authService = new AuthService();
export { DEPARTMENTS };