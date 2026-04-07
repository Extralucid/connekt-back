import dotenv from 'dotenv';
import { app, server } from './src/app.js';
import prisma from './src/config/database.js';
import redis from './src/config/redis.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test Redis connection
    await redis.ping();
    console.log('✅ Redis connected successfully');
    
    // Start server
    server.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`💬 WebSocket server: ws://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\n✨ Ready to accept requests\n`);
    });
    
    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n⚠️  Received ${signal}, closing gracefully...`);
      
      server.close(async () => {
        console.log('📡 HTTP server closed');
        
        try {
          await prisma.$disconnect();
          console.log('🗄️  Database connection closed');
          
          await redis.quit();
          console.log('📦 Redis connection closed');
          
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();