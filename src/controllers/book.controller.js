import BookService from '../services/book.service.js';

class BookController {
  // ==================== BOOK CONTROLLERS ====================
  
  static async createBook(req, res, next) {
    try {
      const book = await BookService.createBook(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Book created successfully',
        data: book,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getBookById(req, res, next) {
    try {
      const { identifier } = req.params;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      
      let book;
      if (isUUID) {
        book = await BookService.getBookById(identifier);
      } else {
        book = await BookService.getBookBySlug(identifier);
      }
      
      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Book not found',
        });
      }
      
      res.json({
        success: true,
        data: book,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateBook(req, res, next) {
    try {
      const { bookId } = req.params;
      const isAdmin = req.user.userRoles?.some(r => 
        ['ADMIN', 'SUPER_ADMIN'].includes(r.role.name)
      );
      
      const book = await BookService.updateBook(bookId, req.body, isAdmin);
      
      res.json({
        success: true,
        message: 'Book updated successfully',
        data: book,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteBook(req, res, next) {
    try {
      const { bookId } = req.params;
      const isAdmin = req.user.userRoles?.some(r => 
        ['ADMIN', 'SUPER_ADMIN'].includes(r.role.name)
      );
      
      await BookService.deleteBook(bookId, isAdmin);
      
      res.json({
        success: true,
        message: 'Book deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getAllBooks(req, res, next) {
    try {
      const result = await BookService.getAllBooks(req.query, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getFeaturedBooks(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const books = await BookService.getFeaturedBooks(parseInt(limit));
      
      res.json({
        success: true,
        data: books,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getBookStats(req, res, next) {
    try {
      const { bookId } = req.params;
      const stats = await BookService.getBookStats(bookId);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== CATEGORY CONTROLLERS ====================
  
  static async createCategory(req, res, next) {
    try {
      const category = await BookService.createCategory(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getAllCategories(req, res, next) {
    try {
      const categories = await BookService.getAllCategories();
      
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      const category = await BookService.updateCategory(categoryId, req.body);
      
      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      await BookService.deleteCategory(categoryId);
      
      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== USER LIBRARY CONTROLLERS ====================
  
  static async addToLibrary(req, res, next) {
    try {
      const { bookId } = req.params;
      const result = await BookService.addToLibrary(req.userId, bookId);
      
      res.status(result.added ? 201 : 200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async removeFromLibrary(req, res, next) {
    try {
      const { bookId } = req.params;
      const result = await BookService.removeFromLibrary(req.userId, bookId);
      
      res.json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateReadingProgress(req, res, next) {
    try {
      const { bookId } = req.params;
      const { progress, currentPage } = req.body;
      
      const result = await BookService.updateReadingProgress(
        req.userId,
        bookId,
        progress,
        currentPage
      );
      
      res.json({
        success: true,
        message: progress === 100 ? 'Book completed! Congratulations!' : 'Progress updated',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getUserLibrary(req, res, next) {
    try {
      const result = await BookService.getUserLibrary(req.userId, req.query, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getReadingStats(req, res, next) {
    try {
      const stats = await BookService.getReadingStats(req.userId);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== REVIEW CONTROLLERS ====================
  
  static async addReview(req, res, next) {
    try {
      const { bookId } = req.params;
      const review = await BookService.addReview(req.userId, bookId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getBookReviews(req, res, next) {
    try {
      const { bookId } = req.params;
      const result = await BookService.getBookReviews(bookId, req.query, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const review = await BookService.updateReview(reviewId, req.userId, req.body);
      
      res.json({
        success: true,
        message: 'Review updated successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const isAdmin = req.user.userRoles?.some(r => 
        ['ADMIN', 'SUPER_ADMIN'].includes(r.role.name)
      );
      
      await BookService.deleteReview(reviewId, req.userId, isAdmin);
      
      res.json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default BookController;