import prisma  from '../config/database.js';
import redis  from '../config/redis.js';
import { v4 as uuidv4 }  from 'uuid';

class BookService {
  // ==================== BOOK CRUD OPERATIONS ====================
  
  static async createBook(bookData) {
    const { categoryIds, ...data } = bookData;
    
    // Generate slug from title
    let slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Ensure unique slug
    let existingBook = await prisma.book.findFirst({
      where: { slug, isDeleted: false },
    });
    let counter = 1;
    while (existingBook) {
      slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${counter}`;
      existingBook = await prisma.book.findFirst({
        where: { slug, isDeleted: false },
      });
      counter++;
    }
    
    const book = await prisma.book.create({
      data: {
        book_id: uuidv4(),
        slug,
        title: data.title,
        description: data.description,
        coverImage: data.coverImage,
        author: data.author,
        price: data.price || 0,
        fileUrl: data.fileUrl,
        pages: data.pages,
        isbn: data.isbn,
        publisher: data.publisher,
        publishedDate: data.publishedDate ? new Date(data.publishedDate) : null,
        language: data.language || 'en',
        categories: {
          create: categoryIds.map(categoryId => ({
            bookCategory: { connect: { bookcat_id: categoryId } }
          }))
        },
      },
      include: {
        categories: {
          include: {
            bookCategory: true,
          },
        },
      },
    });
    
    await redis.del('books:list:*');
    await redis.del('books:featured');
    
    return book;
  }
  
  static async getBookById(bookId) {
    const cacheKey = `book:${bookId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const book = await prisma.book.findUnique({
      where: { book_id: bookId, isDeleted: false },
      include: {
        categories: {
          include: {
            bookCategory: true,
          },
        },
        UserBook: {
          select: {
            progress: true,
            userId: true,
          },
        },
        _count: {
          select: {
            UserBook: true,
          },
        },
      },
    });
    
    if (!book) return null;
    
    // Calculate average rating from reviews
    const reviews = await prisma.bookReview.aggregate({
      where: { bookId, isApproved: true },
      _avg: { rating: true },
      _count: true,
    });
    
    book.averageRating = reviews._avg.rating || 0;
    book.reviewCount = reviews._count;
    book.readersCount = book._count.UserBook;
    
    delete book._count;
    
    await redis.setex(cacheKey, 300, JSON.stringify(book));
    
    return book;
  }
  
  static async getBookBySlug(slug) {
    const book = await prisma.book.findFirst({
      where: { slug, isDeleted: false },
      include: {
        categories: {
          include: {
            bookCategory: true,
          },
        },
        _count: {
          select: {
            UserBook: true,
          },
        },
      },
    });
    
    if (!book) return null;
    
    const reviews = await prisma.bookReview.aggregate({
      where: { bookId: book.book_id, isApproved: true },
      _avg: { rating: true },
      _count: true,
    });
    
    book.averageRating = reviews._avg.rating || 0;
    book.reviewCount = reviews._count;
    book.readersCount = book._count.UserBook;
    
    delete book._count;
    
    return book;
  }
  
  static async updateBook(bookId, updateData, isAdmin = false) {
    const book = await prisma.book.findUnique({
      where: { book_id: bookId },
      select: { isDeleted: true },
    });
    
    if (!book) throw new Error('Book not found');
    
    const { categoryIds, ...data } = updateData;
    
    const updatedBook = await prisma.book.update({
      where: { book_id: bookId },
      data: {
        ...data,
        ...(data.publishedDate && { publishedDate: new Date(data.publishedDate) }),
        updatedAt: new Date(),
        ...(categoryIds && {
          categories: {
            deleteMany: {},
            create: categoryIds.map(categoryId => ({
              bookCategory: { connect: { bookcat_id: categoryId } }
            }))
          }
        }),
      },
      include: {
        categories: {
          include: {
            bookCategory: true,
          },
        },
      },
    });
    
    await redis.del(`book:${bookId}`);
    await redis.del('books:list:*');
    
    return updatedBook;
  }
  
  static async deleteBook(bookId, isAdmin = false) {
    const book = await prisma.book.findUnique({
      where: { book_id: bookId },
    });
    
    if (!book) throw new Error('Book not found');
    
    await prisma.book.update({
      where: { book_id: bookId },
      data: { isDeleted: true },
    });
    
    await redis.del(`book:${bookId}`);
    await redis.del('books:list:*');
    await redis.del('books:featured');
    
    return true;
  }
  
  static async getAllBooks(filters, pagination) {
    const {
      search,
      categoryId,
      author,
      language,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;
    
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const where = { isDeleted: false };
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (author) where.author = { contains: author, mode: 'insensitive' };
    if (language) where.language = language;
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    
    if (categoryId) {
      where.categories = { some: { bookCategoryId: categoryId } };
    }
    
    const cacheKey = `books:list:${JSON.stringify({ where, skip, limit, sortBy, sortOrder })}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          categories: {
            include: {
              bookCategory: true,
            },
          },
        },
      }),
      prisma.book.count({ where }),
    ]);
    
    // Get ratings for each book
    for (const book of books) {
      const reviews = await prisma.bookReview.aggregate({
        where: { bookId: book.book_id, isApproved: true },
        _avg: { rating: true },
        _count: true,
      });
      book.averageRating = reviews._avg.rating || 0;
      book.reviewCount = reviews._count;
    }
    
    const result = {
      books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    await redis.setex(cacheKey, 120, JSON.stringify(result));
    
    return result;
  }
  
  static async getFeaturedBooks(limit = 10) {
    const cacheKey = `books:featured:${limit}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const books = await prisma.book.findMany({
      where: { isDeleted: false, price: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        categories: {
          include: {
            bookCategory: true,
          },
        },
      },
    });
    
    for (const book of books) {
      const reviews = await prisma.bookReview.aggregate({
        where: { bookId: book.book_id, isApproved: true },
        _avg: { rating: true },
      });
      book.averageRating = reviews._avg.rating || 0;
    }
    
    await redis.setex(cacheKey, 3600, JSON.stringify(books));
    
    return books;
  }
  
  // ==================== BOOK CATEGORY MANAGEMENT ====================
  
  static async createCategory(categoryData) {
    let slug = categoryData.slug;
    if (!slug) {
      slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    const category = await prisma.bookCategory.create({
      data: {
        bookcat_id: uuidv4(),
        name: categoryData.name,
        slug,
        description: categoryData.description,
      },
    });
    
    await redis.del('book:categories:all');
    
    return category;
  }
  
  static async getAllCategories() {
    const cached = await redis.get('book:categories:all');
    if (cached) return JSON.parse(cached);
    
    const categories = await prisma.bookCategory.findMany({
      where: { isDeleted: false },
      include: {
        _count: {
          select: { books: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    
    await redis.setex('book:categories:all', 3600, JSON.stringify(categories));
    
    return categories;
  }
  
  static async updateCategory(categoryId, updateData) {
    const category = await prisma.bookCategory.update({
      where: { bookcat_id: categoryId },
      data: {
        ...updateData,
        ...(updateData.name && !updateData.slug && {
          slug: updateData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
        }),
      },
    });
    
    await redis.del('book:categories:all');
    
    return category;
  }
  
  static async deleteCategory(categoryId) {
    // Check if category has books
    const bookCount = await prisma.bookCategory.count({
      where: { bookcat_id: categoryId, books: { some: {} } },
    });
    
    if (bookCount > 0) {
      throw new Error('Cannot delete category with associated books');
    }
    
    await prisma.bookCategory.update({
      where: { bookcat_id: categoryId },
      data: { isDeleted: true },
    });
    
    await redis.del('book:categories:all');
    
    return true;
  }
  
  // ==================== USER LIBRARY MANAGEMENT ====================
  
  static async addToLibrary(userId, bookId) {
    // Check if already in library
    const existing = await prisma.userBook.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });
    
    if (existing) {
      return { added: false, message: 'Book already in library' };
    }
    
    const userBook = await prisma.userBook.create({
      data: {
        userbook_id: uuidv4(),
        userId,
        bookId,
        progress: 0,
      },
      include: {
        book: {
          select: {
            title: true,
            author: true,
            coverImage: true,
          },
        },
      },
    });
    
    await redis.del(`user:${userId}:library:*`);
    
    // Award points for adding book
    await this.awardPoints(userId, 'add_book');
    
    return { added: true, message: 'Book added to library', userBook };
  }
  
  static async removeFromLibrary(userId, bookId) {
    await prisma.userBook.delete({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });
    
    await redis.del(`user:${userId}:library:*`);
    
    return { removed: true, message: 'Book removed from library' };
  }
  
  static async updateReadingProgress(userId, bookId, progress, currentPage = null) {
    const userBook = await prisma.userBook.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });
    
    if (!userBook) {
      throw new Error('Book not found in library');
    }
    
    const book = await prisma.book.findUnique({
      where: { book_id: bookId },
      select: { pages: true, title: true },
    });
    
    const updated = await prisma.userBook.update({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
      data: {
        progress,
        updatedAt: new Date(),
      },
    });
    
    // Award points for completing book
    if (progress === 100 && userBook.progress !== 100) {
      await this.awardPoints(userId, 'complete_book');
      
      // Create achievement notification
      await prisma.notification.create({
        data: {
          notification_id: uuidv4(),
          userId,
          type: 'ACHIEVEMENT_EARNED',
          title: 'Book Completed! 📚',
          message: `Congratulations! You've completed "${book.title}"`,
          data: { bookId, progress: 100 },
        },
      });
    }
    
    await redis.del(`user:${userId}:library:*`);
    await redis.del(`user:${userId}:reading:stats`);
    
    return updated;
  }
  
  static async getUserLibrary(userId, filters, pagination) {
    const { status, sortBy = 'updatedAt', sortOrder = 'desc' } = filters;
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const cacheKey = `user:${userId}:library:${page}:${limit}:${status}:${sortBy}:${sortOrder}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    let where = { userId };
    
    if (status === 'reading') {
      where.progress = { lt: 100, gt: 0 };
    } else if (status === 'completed') {
      where.progress = 100;
    } else if (status === 'wishlist') {
      where.progress = 0;
    }
    
    const [library, total] = await Promise.all([
      prisma.userBook.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          book: {
            include: {
              categories: {
                include: {
                  bookCategory: true,
                },
              },
            },
          },
        },
      }),
      prisma.userBook.count({ where }),
    ]);
    
    const result = {
      books: library.map(item => ({
        ...item.book,
        progress: item.progress,
        addedAt: item.createdAt,
        lastRead: item.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    await redis.setex(cacheKey, 300, JSON.stringify(result));
    
    return result;
  }
  
  static async getReadingStats(userId) {
    const cacheKey = `user:${userId}:reading:stats`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const [totalBooks, completedBooks, readingBooks, totalPages] = await Promise.all([
      prisma.userBook.count({ where: { userId } }),
      prisma.userBook.count({ where: { userId, progress: 100 } }),
      prisma.userBook.count({ where: { userId, progress: { gt: 0, lt: 100 } } }),
      prisma.userBook.aggregate({
        where: { userId },
        _sum: { progress: true },
      }),
    ]);
    
    const stats = {
      totalBooks,
      completedBooks,
      readingBooks,
      wishlistBooks: totalBooks - completedBooks - readingBooks,
      completionRate: totalBooks > 0 ? ((completedBooks / totalBooks) * 100).toFixed(2) : 0,
      averageProgress: totalBooks > 0 ? (totalPages._sum.progress / totalBooks).toFixed(2) : 0,
    };
    
    await redis.setex(cacheKey, 600, JSON.stringify(stats));
    
    return stats;
  }
  
  // ==================== BOOK REVIEWS ====================
  
  static async addReview(userId, bookId, reviewData) {
    // Check if user has read the book
    const userBook = await prisma.userBook.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });
    
    if (!userBook) {
      throw new Error('You must add this book to your library before reviewing');
    }
    
    // Check if already reviewed
    const existingReview = await prisma.bookReview.findFirst({
      where: { userId, bookId },
    });
    
    if (existingReview) {
      throw new Error('You have already reviewed this book');
    }
    
    const review = await prisma.bookReview.create({
      data: {
        review_id: uuidv4(),
        bookId,
        userId,
        rating: reviewData.rating,
        title: reviewData.title,
        review: reviewData.review,
        isApproved: true, // Auto-approve for now
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
      },
    });
    
    await redis.del(`book:${bookId}`);
    await redis.del(`book:${bookId}:reviews:*`);
    
    // Award points for reviewing
    await this.awardPoints(userId, 'write_review');
    
    return review;
  }
  
  static async getBookReviews(bookId, filters, pagination) {
    const { rating, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const cacheKey = `book:${bookId}:reviews:${page}:${limit}:${rating}:${sortBy}:${sortOrder}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const where = { bookId, isApproved: true };
    if (rating) where.rating = rating;
    
    const [reviews, total, avgRating] = await Promise.all([
      prisma.bookReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              display_name: true,
              profile_picture_url: true,
            },
          },
        },
      }),
      prisma.bookReview.count({ where }),
      prisma.bookReview.aggregate({
        where: { bookId, isApproved: true },
        _avg: { rating: true },
      }),
    ]);
    
    const result = {
      reviews,
      averageRating: avgRating._avg.rating || 0,
      totalReviews: total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    await redis.setex(cacheKey, 300, JSON.stringify(result));
    
    return result;
  }
  
  static async updateReview(reviewId, userId, updateData) {
    const review = await prisma.bookReview.findUnique({
      where: { review_id: reviewId },
    });
    
    if (!review) throw new Error('Review not found');
    if (review.userId !== userId) {
      throw new Error('Unauthorized to update this review');
    }
    
    const updatedReview = await prisma.bookReview.update({
      where: { review_id: reviewId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
      },
    });
    
    await redis.del(`book:${review.bookId}`);
    await redis.del(`book:${review.bookId}:reviews:*`);
    
    return updatedReview;
  }
  
  static async deleteReview(reviewId, userId, isAdmin = false) {
    const review = await prisma.bookReview.findUnique({
      where: { review_id: reviewId },
    });
    
    if (!review) throw new Error('Review not found');
    if (review.userId !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this review');
    }
    
    await prisma.bookReview.delete({
      where: { review_id: reviewId },
    });
    
    await redis.del(`book:${review.bookId}`);
    await redis.del(`book:${review.bookId}:reviews:*`);
    
    return true;
  }
  
  // ==================== STATISTICS ====================
  
  static async getBookStats(bookId) {
    const [totalReaders, completedReaders, averageProgress, reviews] = await Promise.all([
      prisma.userBook.count({ where: { bookId } }),
      prisma.userBook.count({ where: { bookId, progress: 100 } }),
      prisma.userBook.aggregate({
        where: { bookId },
        _avg: { progress: true },
      }),
      prisma.bookReview.aggregate({
        where: { bookId, isApproved: true },
        _avg: { rating: true },
        _count: true,
      }),
    ]);
    
    return {
      totalReaders,
      completedReaders,
      completionRate: totalReaders > 0 ? ((completedReaders / totalReaders) * 100).toFixed(2) : 0,
      averageProgress: averageProgress._avg.progress || 0,
      averageRating: reviews._avg.rating || 0,
      totalReviews: reviews._count,
    };
  }
  
  // ==================== POINTS SYSTEM ====================
  
  static async awardPoints(userId, action) {
    const pointsMap = {
      'add_book': 5,
      'complete_book': 50,
      'write_review': 10,
    };
    
    const points = pointsMap[action];
    if (!points) return;
    
    const userPoints = await prisma.userPoints.upsert({
      where: { userId },
      update: {
        totalPoints: { increment: points },
        experiencePoints: { increment: points },
      },
      create: {
        userId,
        totalPoints: points,
        experiencePoints: points,
        level: 1,
      },
    });
    
    const newLevel = Math.floor(userPoints.totalPoints / 100) + 1;
    if (newLevel > userPoints.level) {
      await prisma.userPoints.update({
        where: { userId },
        data: { level: newLevel },
      });
      
      await prisma.notification.create({
        data: {
          notification_id: uuidv4(),
          userId,
          type: 'ACHIEVEMENT_EARNED',
          title: 'Level Up! 🎉',
          message: `Congratulations! You've reached level ${newLevel}`,
        },
      });
    }
    
    return userPoints;
  }
}

export default BookService;