import { PrismaClient }  from '@prisma/client';
import argon2  from 'argon2';
import { v4 as uuidv4 }  from 'uuid';

const prisma = new PrismaClient();

// Helper functions
const hashPassword = async (password) => {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 4096,
    timeCost: 3,
    parallelism: 1,
  });
};

async function main() {
  console.log('🌱 Starting database seeding...');

  // ==================== ROLES & PERMISSIONS ====================
  console.log('📋 Creating roles...');
  
  await prisma.role.createMany({
    data: [
      { name: 'SUPER_ADMIN', description: 'Full system access with all permissions' },
      { name: 'ADMIN', description: 'Admin dashboard and content management access' },
      { name: 'MODERATOR', description: 'Content moderation and user management' },
      { name: 'ORGANIZATION_ADMIN', description: 'Manage organization profile and jobs' },
      { name: 'USER', description: 'Regular user with basic access' },
    ],
    skipDuplicates: true,
  });

  // Get role IDs
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const moderatorRole = await prisma.role.findUnique({ where: { name: 'MODERATOR' } });
  const userRole = await prisma.role.findUnique({ where: { name: 'USER' } });

  // ==================== PERMISSIONS ====================
  console.log('🔐 Creating permissions...');
  
  const permissions = [
    { name: 'user:create', module: 'users', action: 'create', description: 'Create new users' },
    { name: 'user:read', module: 'users', action: 'read', description: 'View users' },
    { name: 'user:update', module: 'users', action: 'update', description: 'Update users' },
    { name: 'user:delete', module: 'users', action: 'delete', description: 'Delete users' },
    { name: 'user:ban', module: 'users', action: 'ban', description: 'Ban users' },
    { name: 'post:create', module: 'posts', action: 'create', description: 'Create posts' },
    { name: 'post:read', module: 'posts', action: 'read', description: 'Read posts' },
    { name: 'post:update', module: 'posts', action: 'update', description: 'Update posts' },
    { name: 'post:delete', module: 'posts', action: 'delete', description: 'Delete posts' },
    { name: 'post:moderate', module: 'posts', action: 'moderate', description: 'Moderate posts' },
    { name: 'forum:create', module: 'forums', action: 'create', description: 'Create forums' },
    { name: 'forum:moderate', module: 'forums', action: 'moderate', description: 'Moderate forums' },
    { name: 'topic:pin', module: 'topics', action: 'pin', description: 'Pin topics' },
    { name: 'topic:close', module: 'topics', action: 'close', description: 'Close topics' },
    { name: 'job:create', module: 'jobs', action: 'create', description: 'Create jobs' },
    { name: 'job:moderate', module: 'jobs', action: 'moderate', description: 'Moderate jobs' },
    { name: 'admin:access', module: 'admin', action: 'access', description: 'Access admin panel' },
    { name: 'admin:settings', module: 'admin', action: 'settings', description: 'Modify system settings' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  // Assign permissions to roles
  console.log('👥 Assigning permissions to roles...');
  
  const allPermissions = await prisma.permission.findMany();
  
  if (superAdminRole) {
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      });
    }
  }
  
  if (adminRole) {
    const adminPermissions = allPermissions.filter(p => 
      !p.name.includes('super') && p.name !== 'admin:settings'
    );
    for (const permission of adminPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }
  }
  
  if (moderatorRole) {
    const moderatorPermissions = allPermissions.filter(p => 
      p.name.includes('moderate') || p.name.includes('ban')
    );
    for (const permission of moderatorPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: moderatorRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: moderatorRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // ==================== USERS ====================
  console.log('👤 Creating users...');
  
  const hashedPassword = await hashPassword('Password123!');
  
  const adminUser = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'admin@youthplatform.com',
      phone: '+237612345678',
      pwd_hash: hashedPassword,
      codeuser: uuidv4(),
      unom: 'System',
      uprenom: 'Admin',
      username: 'superadmin',
      display_name: 'Super Admin',
      accountType: 'INDIVIDUAL',
      status: 'ACTIVE',
      email_verified_at: new Date(),
      phone_verified_at: new Date(),
      registration_date: new Date(),
    },
  });

  await prisma.userPreference.create({
    data: {
      preference_id: uuidv4(),
      userId: adminUser.id,
      language: 'en',
      notifyNewContent: true,
    },
  });

  const johnUser = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'john.doe@example.com',
      phone: '+237612345679',
      pwd_hash: hashedPassword,
      codeuser: uuidv4(),
      unom: 'John',
      uprenom: 'Doe',
      username: 'johndoe',
      display_name: 'John Doe',
      bio: 'Passionate about technology and community building',
      location: 'Douala, Cameroon',
      accountType: 'INDIVIDUAL',
      status: 'ACTIVE',
      email_verified_at: new Date(),
      phone_verified_at: new Date(),
      registration_date: new Date(),
    },
  });

  await prisma.userPreference.create({
    data: {
      preference_id: uuidv4(),
      userId: johnUser.id,
      language: 'en',
      notifyNewContent: true,
    },
  });

  const janeUser = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'jane.smith@example.com',
      phone: '+237612345680',
      pwd_hash: hashedPassword,
      codeuser: uuidv4(),
      unom: 'Jane',
      uprenom: 'Smith',
      username: 'janesmith',
      display_name: 'Jane Smith',
      bio: 'Creative writer and content creator',
      location: 'Yaoundé, Cameroon',
      accountType: 'INDIVIDUAL',
      status: 'ACTIVE',
      email_verified_at: new Date(),
      phone_verified_at: new Date(),
      registration_date: new Date(),
    },
  });

  await prisma.userPreference.create({
    data: {
      preference_id: uuidv4(),
      userId: janeUser.id,
      language: 'en',
      notifyNewContent: true,
    },
  });

  const mikeUser = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'mike@techcorp.com',
      phone: '+237612345681',
      pwd_hash: hashedPassword,
      codeuser: uuidv4(),
      unom: 'Mike',
      uprenom: 'Johnson',
      username: 'mikejohnson',
      display_name: 'Mike Johnson',
      bio: 'Tech entrepreneur and job creator',
      location: 'London, UK',
      accountType: 'COMPANY',
      status: 'ACTIVE',
      email_verified_at: new Date(),
      phone_verified_at: new Date(),
      registration_date: new Date(),
    },
  });

  await prisma.userPreference.create({
    data: {
      preference_id: uuidv4(),
      userId: mikeUser.id,
      language: 'en',
      notifyNewContent: true,
    },
  });

  const sarahUser = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'sarah@university.edu',
      phone: '+237612345682',
      pwd_hash: hashedPassword,
      codeuser: uuidv4(),
      unom: 'Sarah',
      uprenom: 'Williams',
      username: 'sarahwilliams',
      display_name: 'Dr. Sarah Williams',
      bio: 'Professor of Computer Science',
      location: 'Paris, France',
      accountType: 'UNIVERSITY',
      status: 'ACTIVE',
      email_verified_at: new Date(),
      phone_verified_at: new Date(),
      registration_date: new Date(),
    },
  });

  await prisma.userPreference.create({
    data: {
      preference_id: uuidv4(),
      userId: sarahUser.id,
      language: 'en',
      notifyNewContent: true,
    },
  });

  const users = [adminUser, johnUser, janeUser, mikeUser, sarahUser];

  // Assign roles to users
  if (superAdminRole) {
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    });
  }
  
  if (adminRole) {
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
  }
  
  if (userRole) {
    await prisma.userRole.createMany({
      data: [
        { userId: johnUser.id, roleId: userRole.id },
        { userId: janeUser.id, roleId: userRole.id },
        { userId: mikeUser.id, roleId: userRole.id },
        { userId: sarahUser.id, roleId: userRole.id },
      ],
      skipDuplicates: true,
    });
  }

  // ==================== ORGANIZATIONS ====================
  console.log('🏢 Creating organizations...');
  
  const techCorp = await prisma.organization.create({
    data: {
      id: uuidv4(),
      name: 'TechCorp Solutions',
      slug: 'techcorp-solutions',
      email: 'contact@techcorp.com',
      phone: '+237612345690',
      type: 'COMPANY',
      description: 'Leading technology solutions provider',
      website: 'https://techcorp.com',
      address: '123 Tech Street',
      city: 'Douala',
      country: 'Cameroon',
      status: 'ACTIVE',
      verifiedAt: new Date(),
    },
  });

  const university = await prisma.organization.create({
    data: {
      id: uuidv4(),
      name: 'University of Excellence',
      slug: 'university-excellence',
      email: 'info@university.edu',
      phone: '+237612345691',
      type: 'UNIVERSITY',
      description: 'Premier institution for higher education',
      website: 'https://university.edu',
      address: '456 Education Ave',
      city: 'Yaoundé',
      country: 'Cameroon',
      status: 'ACTIVE',
      verifiedAt: new Date(),
    },
  });

  const ngo = await prisma.organization.create({
    data: {
      id: uuidv4(),
      name: 'Youth Empowerment NGO',
      slug: 'youth-empowerment-ngo',
      email: 'contact@youthngo.org',
      phone: '+237612345692',
      type: 'NGO',
      description: 'Empowering youth through education and skills',
      website: 'https://youthngo.org',
      address: '789 Hope Street',
      city: 'Buea',
      country: 'Cameroon',
      status: 'ACTIVE',
      verifiedAt: new Date(),
    },
  });

  // Link users to organizations
  await prisma.organizationUser.createMany({
    data: [
      { userId: mikeUser.id, organizationId: techCorp.id, role: 'OWNER', isPrimaryContact: true },
      { userId: sarahUser.id, organizationId: university.id, role: 'ADMIN', isPrimaryContact: true },
      { userId: johnUser.id, organizationId: ngo.id, role: 'MEMBER', isPrimaryContact: false },
    ],
    skipDuplicates: true,
  });

  // ==================== BLOG CATEGORIES & TAGS ====================
  console.log('📝 Creating blog categories and tags...');
  
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        category_id: uuidv4(),
        name: 'Technology',
        slug: 'technology',
        description: 'Latest tech trends and innovations',
      },
    }),
    prisma.category.create({
      data: {
        category_id: uuidv4(),
        name: 'Career Development',
        slug: 'career-development',
        description: 'Career advice and professional growth',
      },
    }),
    prisma.category.create({
      data: {
        category_id: uuidv4(),
        name: 'Education',
        slug: 'education',
        description: 'Learning resources and educational content',
      },
    }),
    prisma.category.create({
      data: {
        category_id: uuidv4(),
        name: 'Entrepreneurship',
        slug: 'entrepreneurship',
        description: 'Startup advice and business insights',
      },
    }),
  ]);

  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        tag_id: uuidv4(),
        name: 'JavaScript',
        slug: 'javascript',
        description: 'JavaScript programming language',
      },
    }),
    prisma.tag.create({
      data: {
        tag_id: uuidv4(),
        name: 'React',
        slug: 'react',
        description: 'React framework',
      },
    }),
    prisma.tag.create({
      data: {
        tag_id: uuidv4(),
        name: 'Career Tips',
        slug: 'career-tips',
        description: 'Career advice',
      },
    }),
    prisma.tag.create({
      data: {
        tag_id: uuidv4(),
        name: 'Startup',
        slug: 'startup',
        description: 'Startup advice',
      },
    }),
  ]);

  // ==================== BLOG POSTS ====================
  console.log('📄 Creating blog posts...');
  
  const post1 = await prisma.post.create({
    data: {
      post_id: uuidv4(),
      authorId: johnUser.id,
      title: 'Getting Started with Web Development in 2024',
      slug: 'getting-started-web-development-2024',
      content: 'Web development has evolved significantly over the years. This comprehensive guide will help you navigate the modern web development landscape...',
      excerpt: 'A complete guide to starting your web development journey',
      status: 'PUBLISHED',
      published_date: new Date(),
      view_count: 150,
    },
  });

  await prisma.postCategory.create({
    data: {
      postId: post1.post_id,
      categoryId: categories[0].category_id,
    },
  });

  await prisma.postTag.createMany({
    data: [
      { postId: post1.post_id, tagId: tags[0].tag_id },
      { postId: post1.post_id, tagId: tags[1].tag_id },
    ],
  });

  const post2 = await prisma.post.create({
    data: {
      post_id: uuidv4(),
      authorId: janeUser.id,
      title: '10 Tips for a Successful Tech Career',
      slug: '10-tips-successful-tech-career',
      content: 'Building a successful career in technology requires more than just technical skills. Here are 10 essential tips to help you thrive...',
      excerpt: 'Essential advice for advancing your tech career',
      status: 'PUBLISHED',
      published_date: new Date(),
      view_count: 250,
    },
  });

  await prisma.postCategory.create({
    data: {
      postId: post2.post_id,
      categoryId: categories[1].category_id,
    },
  });

  await prisma.postTag.create({
    data: {
      postId: post2.post_id,
      tagId: tags[2].tag_id,
    },
  });

  // ==================== FORUMS ====================
  console.log('💬 Creating forums...');
  
  const forums = await Promise.all([
    prisma.forum.create({
      data: {
        forum_id: uuidv4(),
        name: 'General Discussion',
        slug: 'general-discussion',
        description: 'Talk about anything related to youth development',
        displayOrder: 1,
      },
    }),
    prisma.forum.create({
      data: {
        forum_id: uuidv4(),
        name: 'Tech & Programming',
        slug: 'tech-programming',
        description: 'Discuss programming, web development, and technology',
        displayOrder: 2,
      },
    }),
    prisma.forum.create({
      data: {
        forum_id: uuidv4(),
        name: 'Career & Jobs',
        slug: 'career-jobs',
        description: 'Share job opportunities and career advice',
        displayOrder: 3,
      },
    }),
  ]);

  // ==================== TOPICS & REPLIES ====================
  console.log('📌 Creating forum topics and replies...');
  
  const topic1 = await prisma.topic.create({
    data: {
      topic_id: uuidv4(),
      forumId: forums[0].forum_id,
      authorId: johnUser.id,
      title: 'Welcome to the Youth Platform Community!',
      slug: 'welcome-youth-platform-community',
      content: 'Welcome everyone! This is a space for young people to connect, learn, and grow together.',
      status: 'PINNED',
      view_count: 500,
    },
  });

  const topic2 = await prisma.topic.create({
    data: {
      topic_id: uuidv4(),
      forumId: forums[1].forum_id,
      authorId: janeUser.id,
      title: 'Best Resources for Learning React in 2024',
      slug: 'best-resources-learning-react-2024',
      content: 'I\'ve compiled a list of the best free and paid resources for learning React. What are your favorites?',
      status: 'OPEN',
      view_count: 320,
    },
  });

  const topic3 = await prisma.topic.create({
    data: {
      topic_id: uuidv4(),
      forumId: forums[2].forum_id,
      authorId: mikeUser.id,
      title: 'Hiring Junior Developers at TechCorp',
      slug: 'hiring-junior-developers-techcorp',
      content: 'We are looking for passionate junior developers to join our team. Send your applications!',
      status: 'OPEN',
      view_count: 450,
    },
  });

  // Add replies to topics
  await prisma.reply.createMany({
    data: [
      {
        reply_id: uuidv4(),
        topicId: topic1.topic_id,
        authorId: janeUser.id,
        content: 'Thank you for creating this platform! Looking forward to engaging with the community.',
        createdAt: new Date(),
      },
      {
        reply_id: uuidv4(),
        topicId: topic1.topic_id,
        authorId: mikeUser.id,
        content: 'This is exactly what young people need. Great initiative!',
        createdAt: new Date(),
      },
      {
        reply_id: uuidv4(),
        topicId: topic2.topic_id,
        authorId: sarahUser.id,
        content: 'The official React documentation is excellent. Also, check out Frontend Masters!',
        createdAt: new Date(),
      },
    ],
  });

  // ==================== JOB CATEGORIES & SKILLS ====================
  console.log('💼 Creating job categories and skills...');
  
  const jobCategories = await Promise.all([
    prisma.categorie.create({
      data: {
        cat_id: uuidv4(),
        name: 'Software Development',
        slug: 'software-development',
      },
    }),
    prisma.categorie.create({
      data: {
        cat_id: uuidv4(),
        name: 'Design',
        slug: 'design',
      },
    }),
    prisma.categorie.create({
      data: {
        cat_id: uuidv4(),
        name: 'Marketing',
        slug: 'marketing',
      },
    }),
  ]);

  const skills = await Promise.all([
    prisma.skill.create({
      data: {
        skill_id: uuidv4(),
        name: 'JavaScript',
        slug: 'javascript',
      },
    }),
    prisma.skill.create({
      data: {
        skill_id: uuidv4(),
        name: 'React',
        slug: 'react',
      },
    }),
    prisma.skill.create({
      data: {
        skill_id: uuidv4(),
        name: 'Node.js',
        slug: 'nodejs',
      },
    }),
    prisma.skill.create({
      data: {
        skill_id: uuidv4(),
        name: 'Python',
        slug: 'python',
      },
    }),
  ]);

  // ==================== JOBS ====================
  console.log('📢 Creating job listings...');
  
  const job1 = await prisma.job.create({
    data: {
      job_id: uuidv4(),
      title: 'Full Stack Developer',
      description: 'We are looking for a skilled Full Stack Developer to join our team...',
      jobType: 'FULL_TIME',
      location: 'Douala, Cameroon',
      remote: true,
      salaryMin: 500000,
      salaryMax: 800000,
      salaryCurrency: 'XAF',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      employerId: mikeUser.id,
      sponsoredById: techCorp.id,
      isPromoted: true,
    },
  });

  await prisma.jobCategory.create({
    data: {
      jobId: job1.job_id,
      categorieId: jobCategories[0].cat_id,
    },
  });

  await prisma.jobSkill.createMany({
    data: [
      { jobId: job1.job_id, skillId: skills[0].skill_id },
      { jobId: job1.job_id, skillId: skills[1].skill_id },
      { jobId: job1.job_id, skillId: skills[2].skill_id },
    ],
  });

  // ==================== PODCASTS ====================
  console.log('🎙️ Creating podcasts...');
  
  const podcast = await prisma.podcast.create({
    data: {
      podcast_id: uuidv4(),
      title: 'Youth Tech Talk',
      description: 'Discussing technology trends and career advice for young people',
      coverImage: 'https://example.com/cover.jpg',
      authorId: johnUser.id,
      language: 'en',
      categories: ['Technology', 'Career'],
    },
  });

  await prisma.episode.createMany({
    data: [
      {
        episode_id: uuidv4(),
        podcastId: podcast.podcast_id,
        title: 'Getting Started in Tech',
        description: 'Tips for beginners entering the tech industry',
        audioUrl: 'https://example.com/episode1.mp3',
        duration: 1800,
        publishDate: new Date(),
      },
      {
        episode_id: uuidv4(),
        podcastId: podcast.podcast_id,
        title: 'Remote Work Success',
        description: 'How to thrive in a remote work environment',
        audioUrl: 'https://example.com/episode2.mp3',
        duration: 2100,
        publishDate: new Date(),
      },
    ],
  });

  // ==================== BOOKS ====================
  console.log('📚 Creating books...');
  
  const bookCategoriesData = await Promise.all([
    prisma.bookCategory.create({
      data: {
        bookcat_id: uuidv4(),
        name: 'Programming',
        slug: 'programming',
      },
    }),
    prisma.bookCategory.create({
      data: {
        bookcat_id: uuidv4(),
        name: 'Career Development',
        slug: 'career-development',
      },
    }),
  ]);

  const book1 = await prisma.book.create({
    data: {
      book_id: uuidv4(),
      title: 'JavaScript: The Good Parts',
      description: 'A comprehensive guide to JavaScript best practices',
      author: 'Douglas Crockford',
      price: 29.99,
      pages: 176,
      isbn: '9780596517748',
      publisher: 'O\'Reilly Media',
      language: 'en',
      categories: {
        connect: [{ bookcat_id: bookCategoriesData[0].bookcat_id }],
      },
    },
  });

  // ==================== TUTORIALS ====================
  console.log('🎓 Creating tutorials...');
  
  const tutorialCategoriesData = await Promise.all([
    prisma.tutorialCategory.create({
      data: {
        tutcat_id: uuidv4(),
        name: 'Web Development',
        slug: 'web-development',
      },
    }),
    prisma.tutorialCategory.create({
      data: {
        tutcat_id: uuidv4(),
        name: 'Data Science',
        slug: 'data-science',
      },
    }),
  ]);

  const tutorial = await prisma.tutorial.create({
    data: {
      tutorial_id: uuidv4(),
      title: 'Complete React Course',
      description: 'Learn React from scratch with projects',
      thumbnail: 'https://example.com/react-thumb.jpg',
      authorId: johnUser.id,
      difficulty: 'intermediate',
      duration: 360,
      prerequisites: ['JavaScript', 'HTML', 'CSS'],
      learningOutcomes: ['Build React apps', 'Understand hooks', 'State management'],
      price: 49.99,
      categories: {
        connect: [{ tutcat_id: tutorialCategoriesData[0].tutcat_id }],
      },
    },
  });

  await prisma.tutorialSection.createMany({
    data: [
      {
        tutsection_id: uuidv4(),
        tutorialId: tutorial.tutorial_id,
        title: 'Introduction to React',
        content: 'What is React and why use it?',
        order: 1,
      },
      {
        tutsection_id: uuidv4(),
        tutorialId: tutorial.tutorial_id,
        title: 'Components and Props',
        content: 'Understanding React components',
        order: 2,
      },
    ],
  });

  // ==================== USER LIBRARY & PROGRESS ====================
  console.log('📖 Adding books to user libraries...');
  
  await prisma.userBook.createMany({
    data: [
      {
        userbook_id: uuidv4(),
        userId: johnUser.id,
        bookId: book1.book_id,
        progress: 45,
      },
    ],
    skipDuplicates: true,
  });

  // ==================== NOTIFICATIONS ====================
  console.log('🔔 Creating notifications...');
  
  await prisma.notification.createMany({
    data: [
      {
        notification_id: uuidv4(),
        userId: johnUser.id,
        type: 'SYSTEM_ALERT',
        title: 'Welcome to Youth Platform!',
        message: 'Thank you for joining our community. Start exploring!',
      },
      {
        notification_id: uuidv4(),
        userId: janeUser.id,
        type: 'JOB_ALERT',
        title: 'New Job Matching Your Skills',
        message: 'A new developer position has been posted',
        data: { jobId: job1.job_id },
      },
    ],
  });

  // ==================== ACHIEVEMENTS ====================
  console.log('🏆 Creating achievements...');
  
  await prisma.achievement.createMany({
    data: [
      {
        name: 'First Post',
        description: 'Create your first blog post',
        badgeImage: '/badges/first-post.png',
        points: 10,
        category: 'content',
        requirementType: 'posts_created',
        requirementValue: 1,
      },
      {
        name: 'Community Helper',
        description: 'Answer 10 questions in the forum',
        badgeImage: '/badges/community-helper.png',
        points: 50,
        category: 'engagement',
        requirementType: 'replies_created',
        requirementValue: 10,
      },
      {
        name: 'Job Seeker',
        description: 'Apply to your first job',
        badgeImage: '/badges/job-seeker.png',
        points: 20,
        category: 'career',
        requirementType: 'job_applications',
        requirementValue: 1,
      },
    ],
    skipDuplicates: true,
  });

  // ==================== USER POINTS ====================
  console.log('⭐ Setting up user points...');
  
  await prisma.userPoints.createMany({
    data: [
      {
        userId: johnUser.id,
        totalPoints: 150,
        experiencePoints: 150,
        level: 2,
      },
      {
        userId: janeUser.id,
        totalPoints: 80,
        experiencePoints: 80,
        level: 1,
      },
      {
        userId: mikeUser.id,
        totalPoints: 200,
        experiencePoints: 200,
        level: 3,
      },
    ],
    skipDuplicates: true,
  });

  // ==================== CHAT ROOMS ====================
  console.log('💬 Creating chat rooms...');
  
  const chatRoom = await prisma.chatRoom.create({
    data: {
      room_id: uuidv4(),
      name: 'General Chat',
      isGroup: true,
      description: 'Welcome to the general discussion room!',
    },
  });

  await prisma.chatParticipant.createMany({
    data: [
      { participant_id: uuidv4(), roomId: chatRoom.room_id, userId: adminUser.id, role: 'OWNER' },
      { participant_id: uuidv4(), roomId: chatRoom.room_id, userId: johnUser.id, role: 'ADMIN' },
      { participant_id: uuidv4(), roomId: chatRoom.room_id, userId: janeUser.id, role: 'MEMBER' },
      { participant_id: uuidv4(), roomId: chatRoom.room_id, userId: mikeUser.id, role: 'MEMBER' },
      { participant_id: uuidv4(), roomId: chatRoom.room_id, userId: sarahUser.id, role: 'MEMBER' },
    ],
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        message_id: uuidv4(),
        roomId: chatRoom.room_id,
        senderId: adminUser.id,
        content: 'Welcome everyone to the Youth Platform chat!',
      },
      {
        message_id: uuidv4(),
        roomId: chatRoom.room_id,
        senderId: johnUser.id,
        content: 'Excited to be here!',
      },
      {
        message_id: uuidv4(),
        roomId: chatRoom.room_id,
        senderId: janeUser.id,
        content: 'This is awesome!',
      },
    ],
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('📊 Summary:');
  console.log(`   - ${await prisma.user.count()} users created`);
  console.log(`   - ${await prisma.post.count()} blog posts created`);
  console.log(`   - ${await prisma.topic.count()} forum topics created`);
  console.log(`   - ${await prisma.job.count()} job listings created`);
  console.log(`   - ${await prisma.podcast.count()} podcasts created`);
  console.log(`   - ${await prisma.book.count()} books created`);
  console.log(`   - ${await prisma.tutorial.count()} tutorials created`);
  console.log(`   - ${await prisma.chatRoom.count()} chat rooms created`);
}

// Run the seed function
main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });