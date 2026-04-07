// User fixtures
const userFixtures = {
  validUser: {
    email: 'test@example.com',
    phone: '+237612345678',
    password: 'Password123!',
    unom: 'John',
    uprenom: 'Doe',
    username: 'johndoe',
  },
  
  adminUser: {
    id: 'admin-123',
    email: 'admin@example.com',
    phone: '+237612345679',
    password: 'Admin123!',
    unom: 'Admin',
    uprenom: 'User',
    username: 'admin',
  },
  
  superAdmin: {
    id: 'super-admin-123',
    email: 'super@example.com',
    phone: '+237612345680',
    password: 'Super123!',
    unom: 'Super',
    uprenom: 'Admin',
    username: 'superadmin',
  },
  
  organizationUser: {
    id: 'org-user-123',
    email: 'org@company.com',
    phone: '+237612345681',
    password: 'Org123!',
    unom: 'Org',
    uprenom: 'Admin',
    username: 'orgadmin',
  },
};

// Organization fixtures
const organizationFixtures = {
  validOrganization: {
    name: 'Tech Corp',
    email: 'contact@techcorp.com',
    phone: '+237612345690',
    type: 'COMPANY',
    description: 'Leading tech company',
    website: 'https://techcorp.com',
    address: '123 Tech Street',
    city: 'Douala',
    country: 'Cameroon',
  },
  
  university: {
    name: 'University of Excellence',
    email: 'info@university.edu',
    phone: '+237612345691',
    type: 'UNIVERSITY',
    description: 'Premier university',
    website: 'https://university.edu',
    address: '456 Education Ave',
    city: 'Yaoundé',
    country: 'Cameroon',
  },
};

// Post fixtures
const postFixtures = {
  validPost: {
    title: 'Getting Started with Web Development',
    content: 'This is a comprehensive guide to web development...',
    excerpt: 'Learn web development basics',
    status: 'PUBLISHED',
    categoryIds: [],
    tagIds: [],
  },
  
  draftPost: {
    title: 'Draft Post',
    content: 'This is a draft post...',
    status: 'DRAFT',
  },
};

// Job fixtures
const jobFixtures = {
  validJob: {
    title: 'Full Stack Developer',
    description: 'We are looking for a skilled developer...',
    jobType: 'FULL_TIME',
    location: 'Douala, Cameroon',
    remote: true,
    salaryMin: 500000,
    salaryMax: 800000,
    salaryCurrency: 'XAF',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    categoryIds: [],
    skillIds: [],
  },
};

// Token fixtures
const tokenFixtures = {
  validAccessToken: 'valid-access-token',
  validRefreshToken: 'valid-refresh-token',
  expiredToken: 'expired-token',
};

export {
  userFixtures,
  organizationFixtures,
  postFixtures,
  jobFixtures,
  tokenFixtures,
};