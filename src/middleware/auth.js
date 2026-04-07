import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

const verifyAccessToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Check if token exists in database and is valid
    const refreshToken = await prisma.refreshToken.findFirst({
      where: {
        jti: decoded.jti,
        isValid: true,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
    
    // Get user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });
    
    if (!user || user.isDeleted || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
    }
    
    req.user = user;
    req.userId = user.id;
    req.tokenJti = decoded.jti;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    
    if (!tokenRecord || !tokenRecord.isValid || tokenRecord.revoked) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }
    
    if (tokenRecord.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired',
      });
    }
    
    req.refreshToken = tokenRecord;
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    const userRoles = req.user.userRoles.map(ur => ur.role.name);
    const hasRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }
    
    next();
  };
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    const userPermissions = req.user.userRoles.flatMap(ur => 
      ur.role.rolePermissions.map(rp => rp.permission.name)
    );
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Missing required permission: ${permission}`,
      });
    }
    
    next();
  };
};

export {
  verifyAccessToken,
  verifyRefreshToken,
  requireRole,
  requirePermission,
};