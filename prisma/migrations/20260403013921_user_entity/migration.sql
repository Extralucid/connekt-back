-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('LOCAL', 'S3', 'CLOUDINARY', 'GOOGLE_CLOUD', 'AZURE');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('INDIVIDUAL', 'COMPANY', 'UNIVERSITY', 'GOVERNMENT', 'NGO');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED', 'FLAGGED', 'DELETED');

-- CreateEnum
CREATE TYPE "ModerationAction" AS ENUM ('APPROVE', 'REJECT', 'FLAG', 'HIDE', 'DELETE', 'WARN_USER', 'SUSPEND_USER', 'BAN_USER');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'HARASSMENT', 'HATE_SPEECH', 'VIOLENCE', 'COPYRIGHT', 'MISINFORMATION', 'ADULT_CONTENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('POST', 'TOPIC', 'REPLY', 'COMMENT', 'PODCAST_EPISODE', 'TUTORIAL', 'BOOK', 'JOB', 'CHAT_MESSAGE', 'EVENT');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('MEMBER', 'MANAGER', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('WEBINAR', 'WORKSHOP', 'CONFERENCE', 'MEETUP', 'TRAINING', 'QANDA', 'PANEL_DISCUSSION');

-- CreateEnum
CREATE TYPE "HostType" AS ENUM ('USER', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'CANCELLED', 'ATTENDED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "SponsoredStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CONTENT_LIKE', 'CONTENT_COMMENT', 'CONTENT_SHARE', 'MENTION', 'MESSAGE', 'EVENT_REMINDER', 'JOB_ALERT', 'ACHIEVEMENT_EARNED', 'REPORT_RESOLVED', 'SYSTEM_ALERT', 'MODERATION_WARNING', 'SUBSCRIPTION_UPDATE');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('OPEN', 'CLOSED', 'PINNED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE');

-- CreateEnum
CREATE TYPE "AppStatus" AS ENUM ('PENDING', 'REVIEWED', 'REJECTED', 'INTERVIEW', 'HIRED');

-- CreateEnum
CREATE TYPE "AlertFrequency" AS ENUM ('INSTANT', 'DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "AppEventType" AS ENUM ('STATUS_CHANGE', 'INTERVIEW', 'NOTE', 'EMAIL_SENT');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('ADMIN', 'MODERATOR', 'MEMBER');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('POST', 'TOPIC', 'REPLY', 'COMMENT');

-- CreateTable
CREATE TABLE "MethodePaiement" (
    "idmethode" TEXT NOT NULL,
    "nomMethode" VARCHAR(255) NOT NULL,
    "codeMethode" VARCHAR(255) NOT NULL,
    "descriptionMethode" TEXT,
    "name" VARCHAR(255),
    "merchantID" VARCHAR(255),
    "API_KEY" TEXT,
    "currencyCode" VARCHAR(255),
    "automaticRecurringPayment" VARCHAR(255),
    "placeholder1" VARCHAR(255),
    "placeholder2" VARCHAR(255),
    "placeholder3" VARCHAR(255),
    "published" BOOLEAN DEFAULT true,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MethodePaiement_pkey" PRIMARY KEY ("idmethode")
);

-- CreateTable
CREATE TABLE "Parametre" (
    "idparametre" TEXT NOT NULL,
    "mailUserCreation" BOOLEAN DEFAULT false,
    "mailUserActivation" BOOLEAN DEFAULT false,
    "mailSouscriptionActivation" BOOLEAN DEFAULT false,
    "mailSouscriptionSuspension" BOOLEAN NOT NULL DEFAULT false,
    "mailDemandeCreation" BOOLEAN NOT NULL DEFAULT false,
    "nomcompagnie" VARCHAR(255),
    "logocompagnie" VARCHAR(255),
    "phonecompagnie" VARCHAR(255),
    "emailcompagnie" VARCHAR(255),
    "sitecompagnie" VARCHAR(255),
    "adressecompagnie" VARCHAR(255),
    "pgw_url" VARCHAR(255),
    "pgw_secret" VARCHAR(255),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parametre_pkey" PRIMARY KEY ("idparametre")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "type" "AccountType" NOT NULL DEFAULT 'COMPANY',
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "logo" TEXT,
    "coverImage" TEXT,
    "description" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "taxId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "metadata" JSONB,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "parentDeptId" TEXT,
    "headUserId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT,
    "role" "OrganizationRole" NOT NULL,
    "title" TEXT,
    "isPrimaryContact" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(255) NOT NULL,
    "pwd_hash" TEXT NOT NULL,
    "codeuser" VARCHAR(250) NOT NULL,
    "unom" VARCHAR(250),
    "uprenom" VARCHAR(250),
    "display_name" VARCHAR(250),
    "username" TEXT,
    "registration_date" DATE,
    "last_login" DATE,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "profile_picture_url" VARCHAR(500),
    "cover_photo_url" VARCHAR(500),
    "bio" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "location" TEXT,
    "timezone" TEXT DEFAULT 'UTC',
    "email_verified_at" DATE,
    "phone_verified_at" TIMESTAMP(3),
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "usession" VARCHAR(250),
    "accountType" "AccountType" NOT NULL DEFAULT 'INDIVIDUAL',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastActiveAt" TIMESTAMP(3),
    "mobileSettings" JSONB DEFAULT '{}',
    "appVersion" TEXT,
    "platform" TEXT,
    "lastMobileLogin" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,
    "preferenceId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT,
    "deviceModel" TEXT,
    "osVersion" TEXT,
    "appVersion" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceTokenId" TEXT,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobile_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "platform" TEXT,
    "minAppVersion" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mobile_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "imageUrl" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),

    CONSTRAINT "push_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobile_analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "screenName" TEXT,
    "duration" INTEGER,
    "metadata" JSONB,
    "deviceInfo" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mobile_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offline_sync_queue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "offline_sync_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_rate_limits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requests" INTEGER NOT NULL DEFAULT 1,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercentage" INTEGER NOT NULL DEFAULT 100,
    "platforms" TEXT[],
    "minAppVersion" TEXT,
    "metadata" JSONB,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobile_cache" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mobile_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobile_content_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "feedOrder" TEXT NOT NULL DEFAULT 'recent',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mobile_content_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_widgets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "permissions" TEXT[],
    "displayOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_widgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_health" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responseTime" INTEGER,
    "errorRate" DOUBLE PRECISION,
    "metadata" JSONB,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_tasks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cronExpression" TEXT NOT NULL,
    "handler" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "lastRunStatus" TEXT,
    "lastRunError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_endpoints" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "rateLimit" INTEGER NOT NULL DEFAULT 60,
    "requiredRoles" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_configs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "syncInterval" INTEGER NOT NULL DEFAULT 300,
    "batchSize" INTEGER NOT NULL DEFAULT 50,
    "retentionDays" INTEGER NOT NULL DEFAULT 30,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sync_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "iddocument" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" VARCHAR(500) NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT,
    "mimeType" TEXT,
    "fileExtension" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "storageProvider" "StorageProvider" NOT NULL DEFAULT 'LOCAL',
    "duration" INTEGER,
    "thumbnailUrl" VARCHAR(500),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN DEFAULT true,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("iddocument")
);

-- CreateTable
CREATE TABLE "content_media" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "documentId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "clientType" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "tokenHash" TEXT,
    "jti" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "rotatedFrom" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "lastUsed" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "resourceId" TEXT,
    "description" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verifications" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_verifications" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_permissions" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "roleId" TEXT,
    "userId" TEXT,
    "conditions" JSONB,

    CONSTRAINT "resource_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "post_id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "slug" VARCHAR(250) NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" VARCHAR(250),
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "published_date" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "featured_image_url" VARCHAR(250),
    "view_count" INTEGER DEFAULT 0,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" TEXT NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "slug" VARCHAR(250) NOT NULL,
    "description" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "tags" (
    "tag_id" TEXT NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "slug" VARCHAR(250) NOT NULL,
    "description" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("tag_id")
);

-- CreateTable
CREATE TABLE "post_categories" (
    "postId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "post_categories_pkey" PRIMARY KEY ("postId","categoryId")
);

-- CreateTable
CREATE TABLE "post_tags" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("postId","tagId")
);

-- CreateTable
CREATE TABLE "comments" (
    "comment_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentCommentId" TEXT,
    "targetId" TEXT NOT NULL,
    "targetType" "ContentType" NOT NULL,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postId" TEXT,
    "topicId" TEXT,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "forums" (
    "forum_id" TEXT NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "slug" VARCHAR(250) NOT NULL,
    "description" TEXT NOT NULL,
    "parentForumId" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forums_pkey" PRIMARY KEY ("forum_id")
);

-- CreateTable
CREATE TABLE "topics" (
    "topic_id" TEXT NOT NULL,
    "forumId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "slug" VARCHAR(250) NOT NULL,
    "content" TEXT NOT NULL,
    "status" "TopicStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "view_count" INTEGER DEFAULT 0,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("topic_id")
);

-- CreateTable
CREATE TABLE "replies" (
    "reply_id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isAcceptedAnswer" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "replies_pkey" PRIMARY KEY ("reply_id")
);

-- CreateTable
CREATE TABLE "votes" (
    "vote_id" TEXT NOT NULL,
    "replyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("vote_id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "job_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "jobType" "JobType" NOT NULL DEFAULT 'FULL_TIME',
    "location" VARCHAR(250),
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT DEFAULT 'USD',
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employerId" TEXT NOT NULL,
    "sponsoredById" TEXT,
    "isPromoted" BOOLEAN NOT NULL DEFAULT false,
    "promotionEndsAt" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "applicationsCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("job_id")
);

-- CreateTable
CREATE TABLE "job_categories" (
    "cat_id" TEXT NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "slug" TEXT NOT NULL,
    "jobAlertJobalert_id" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_categories_pkey" PRIMARY KEY ("cat_id")
);

-- CreateTable
CREATE TABLE "skills" (
    "skill_id" TEXT NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("skill_id")
);

-- CreateTable
CREATE TABLE "job_categories_data" (
    "jobId" TEXT NOT NULL,
    "categorieId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "job_skills" (
    "jobId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "job_skills_pkey" PRIMARY KEY ("jobId","skillId")
);

-- CreateTable
CREATE TABLE "applications" (
    "app_id" TEXT NOT NULL,
    "coverLetter" TEXT,
    "status" "AppStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("app_id")
);

-- CreateTable
CREATE TABLE "application_documents" (
    "appId" TEXT NOT NULL,
    "docId" TEXT NOT NULL,

    CONSTRAINT "application_documents_pkey" PRIMARY KEY ("appId","docId")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_alerts" (
    "jobalert_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "keywords" TEXT[],
    "frequency" "AlertFrequency" NOT NULL DEFAULT 'DAILY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_alerts_pkey" PRIMARY KEY ("jobalert_id")
);

-- CreateTable
CREATE TABLE "company_reviews" (
    "review_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "review" VARCHAR(250) NOT NULL,
    "pros" TEXT[],
    "cons" TEXT[],
    "userId" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "company_reviews_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "application_events" (
    "app_event_id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "AppEventType" NOT NULL,
    "message" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_events_pkey" PRIMARY KEY ("app_event_id")
);

-- CreateTable
CREATE TABLE "job_views" (
    "job_view_id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,

    CONSTRAINT "job_views_pkey" PRIMARY KEY ("job_view_id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "room_id" TEXT NOT NULL,
    "name" TEXT,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "chat_participants" (
    "participant_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "role" "ChatRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_participants_pkey" PRIMARY KEY ("participant_id")
);

-- CreateTable
CREATE TABLE "messages" (
    "message_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "replyToId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "chat_documents" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_reactions" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reaction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_invites" (
    "invite_id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_invites_pkey" PRIMARY KEY ("invite_id")
);

-- CreateTable
CREATE TABLE "chat_audits" (
    "log_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_audits_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "direct_messages" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "replyToId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "podcasts" (
    "podcast_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT,
    "authorId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isExplicit" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'en',
    "totalEpisodes" INTEGER NOT NULL DEFAULT 0,
    "totalListens" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "categories" TEXT[],

    CONSTRAINT "podcasts_pkey" PRIMARY KEY ("podcast_id")
);

-- CreateTable
CREATE TABLE "episodes" (
    "episode_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "publishDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "podcastId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "episodes_pkey" PRIMARY KEY ("episode_id")
);

-- CreateTable
CREATE TABLE "Listen" (
    "listen_id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "userId" TEXT,
    "listenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Listen_pkey" PRIMARY KEY ("listen_id")
);

-- CreateTable
CREATE TABLE "transcripts" (
    "transcript_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "episodeId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transcripts_pkey" PRIMARY KEY ("transcript_id")
);

-- CreateTable
CREATE TABLE "PodcastSubscription" (
    "podsub_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "podcastId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PodcastSubscription_pkey" PRIMARY KEY ("podsub_id")
);

-- CreateTable
CREATE TABLE "podcast_comments" (
    "podcom_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "podcast_comments_pkey" PRIMARY KEY ("podcom_id")
);

-- CreateTable
CREATE TABLE "books" (
    "book_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT,
    "author" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "fileUrl" TEXT,
    "pages" JSONB,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("book_id")
);

-- CreateTable
CREATE TABLE "book_categories" (
    "bookcat_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_categories_pkey" PRIMARY KEY ("bookcat_id")
);

-- CreateTable
CREATE TABLE "user_books" (
    "userbook_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_books_pkey" PRIMARY KEY ("userbook_id")
);

-- CreateTable
CREATE TABLE "tutorials" (
    "tutorial_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT,
    "authorId" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION,
    "totalEnrollments" INTEGER NOT NULL DEFAULT 0,
    "totalCompletions" INTEGER NOT NULL DEFAULT 0,
    "prerequisites" TEXT[],
    "learningOutcomes" TEXT[],
    "certificateEnabled" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tutorials_pkey" PRIMARY KEY ("tutorial_id")
);

-- CreateTable
CREATE TABLE "tutorial_sections" (
    "tutsection_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "videoUrl" TEXT,
    "order" INTEGER NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutorial_sections_pkey" PRIMARY KEY ("tutsection_id")
);

-- CreateTable
CREATE TABLE "tutorial_progress" (
    "tutprogress_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "sectionId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutorial_progress_pkey" PRIMARY KEY ("tutprogress_id")
);

-- CreateTable
CREATE TABLE "tutorial_categories" (
    "tutcat_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutorial_categories_pkey" PRIMARY KEY ("tutcat_id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "preference_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "notifyNewContent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("preference_id")
);

-- CreateTable
CREATE TABLE "content_reports" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedUserId" TEXT,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "moderatedBy" TEXT,
    "moderationNote" TEXT,
    "actionTaken" "ModerationAction",
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_logs" (
    "id" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "action" "ModerationAction" NOT NULL,
    "targetType" "ContentType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT,
    "duration" INTEGER,
    "previousStatus" TEXT,
    "newStatus" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badgeImage" VARCHAR(500) NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "category" TEXT NOT NULL,
    "requirementType" TEXT NOT NULL,
    "requirementValue" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" TIMESTAMP(3),

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_points" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experiencePoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL DEFAULT 'WEBINAR',
    "hostType" "HostType" NOT NULL DEFAULT 'USER',
    "organizationHostId" TEXT,
    "userHostId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "location" TEXT,
    "meetingLink" TEXT,
    "maxAttendees" INTEGER,
    "currentAttendees" INTEGER NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "coverImage" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'SCHEDULED',
    "recordingUrl" TEXT,
    "slidesUrl" TEXT,
    "tags" TEXT[],
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "attendedAt" TIMESTAMP(3),
    "feedbackGiven" BOOLEAN NOT NULL DEFAULT false,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_feedback" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "wouldRecommend" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attachments" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "attachmentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_likes" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_flags" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_views" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_shares" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "sharedBy" TEXT NOT NULL,
    "platform" TEXT,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_drafts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "contentId" TEXT,
    "data" JSONB NOT NULL,
    "title" TEXT,
    "autoSave" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsored_content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "contentId" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SponsoredStatus" NOT NULL DEFAULT 'PENDING',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsored_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "contentId" TEXT,
    "contentType" "ContentType",
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "isDelivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" TIMESTAMP(3),
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "user_activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "contentId" TEXT,
    "contentType" "ContentType",
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_analytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "newUsers" INTEGER NOT NULL DEFAULT 0,
    "totalContent" INTEGER NOT NULL DEFAULT 0,
    "newContent" INTEGER NOT NULL DEFAULT 0,
    "totalInteractions" INTEGER NOT NULL DEFAULT 0,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "totalShares" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToUserPreference" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CategorieToUserPreference" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BookToBookCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BookCategoryToUserPreference" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TutorialToTutorialCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TutorialCategoryToUserPreference" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MethodePaiement_idmethode_key" ON "MethodePaiement"("idmethode");

-- CreateIndex
CREATE UNIQUE INDEX "MethodePaiement_nomMethode_key" ON "MethodePaiement"("nomMethode");

-- CreateIndex
CREATE UNIQUE INDEX "MethodePaiement_codeMethode_key" ON "MethodePaiement"("codeMethode");

-- CreateIndex
CREATE UNIQUE INDEX "MethodePaiement_merchantID_key" ON "MethodePaiement"("merchantID");

-- CreateIndex
CREATE UNIQUE INDEX "Parametre_idparametre_key" ON "Parametre"("idparametre");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_email_key" ON "organizations"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organization_users_userId_organizationId_key" ON "organization_users"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_preferenceId_key" ON "users"("preferenceId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_lastActiveAt_idx" ON "users"("lastActiveAt");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_deviceId_key" ON "device_tokens"("deviceId");

-- CreateIndex
CREATE INDEX "device_tokens_userId_idx" ON "device_tokens"("userId");

-- CreateIndex
CREATE INDEX "device_tokens_token_idx" ON "device_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "session_tokens_token_key" ON "session_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "session_tokens_refreshToken_key" ON "session_tokens"("refreshToken");

-- CreateIndex
CREATE INDEX "session_tokens_userId_idx" ON "session_tokens"("userId");

-- CreateIndex
CREATE INDEX "session_tokens_expiresAt_idx" ON "session_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_configs_key_key" ON "mobile_configs"("key");

-- CreateIndex
CREATE INDEX "push_notifications_userId_idx" ON "push_notifications"("userId");

-- CreateIndex
CREATE INDEX "push_notifications_status_idx" ON "push_notifications"("status");

-- CreateIndex
CREATE INDEX "push_notifications_createdAt_idx" ON "push_notifications"("createdAt");

-- CreateIndex
CREATE INDEX "mobile_analytics_userId_idx" ON "mobile_analytics"("userId");

-- CreateIndex
CREATE INDEX "mobile_analytics_sessionId_idx" ON "mobile_analytics"("sessionId");

-- CreateIndex
CREATE INDEX "mobile_analytics_eventType_idx" ON "mobile_analytics"("eventType");

-- CreateIndex
CREATE INDEX "mobile_analytics_createdAt_idx" ON "mobile_analytics"("createdAt");

-- CreateIndex
CREATE INDEX "offline_sync_queue_userId_idx" ON "offline_sync_queue"("userId");

-- CreateIndex
CREATE INDEX "offline_sync_queue_status_idx" ON "offline_sync_queue"("status");

-- CreateIndex
CREATE INDEX "offline_sync_queue_createdAt_idx" ON "offline_sync_queue"("createdAt");

-- CreateIndex
CREATE INDEX "api_rate_limits_userId_windowStart_idx" ON "api_rate_limits"("userId", "windowStart");

-- CreateIndex
CREATE UNIQUE INDEX "api_rate_limits_userId_endpoint_windowStart_key" ON "api_rate_limits"("userId", "endpoint", "windowStart");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_name_key" ON "feature_flags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_cache_cacheKey_key" ON "mobile_cache"("cacheKey");

-- CreateIndex
CREATE INDEX "mobile_cache_expiresAt_idx" ON "mobile_cache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_content_preferences_userId_contentType_key" ON "mobile_content_preferences"("userId", "contentType");

-- CreateIndex
CREATE INDEX "admin_audit_logs_adminId_idx" ON "admin_audit_logs"("adminId");

-- CreateIndex
CREATE INDEX "admin_audit_logs_targetType_targetId_idx" ON "admin_audit_logs"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "admin_audit_logs_createdAt_idx" ON "admin_audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "admin_widgets_name_key" ON "admin_widgets"("name");

-- CreateIndex
CREATE INDEX "system_health_service_checkedAt_idx" ON "system_health"("service", "checkedAt");

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_tasks_name_key" ON "scheduled_tasks"("name");

-- CreateIndex
CREATE INDEX "scheduled_tasks_status_nextRunAt_idx" ON "scheduled_tasks"("status", "nextRunAt");

-- CreateIndex
CREATE UNIQUE INDEX "api_endpoints_path_key" ON "api_endpoints"("path");

-- CreateIndex
CREATE UNIQUE INDEX "sync_configs_entityType_key" ON "sync_configs"("entityType");

-- CreateIndex
CREATE UNIQUE INDEX "documents_fileName_key" ON "documents"("fileName");

-- CreateIndex
CREATE INDEX "documents_userId_idx" ON "documents"("userId");

-- CreateIndex
CREATE INDEX "documents_fileType_idx" ON "documents"("fileType");

-- CreateIndex
CREATE INDEX "content_media_contentId_contentType_idx" ON "content_media"("contentId", "contentType");

-- CreateIndex
CREATE UNIQUE INDEX "content_media_contentId_contentType_documentId_key" ON "content_media"("contentId", "contentType", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "email_verifications_token_key" ON "email_verifications"("token");

-- CreateIndex
CREATE UNIQUE INDEX "phone_verifications_phoneNumber_token_key" ON "phone_verifications"("phoneNumber", "token");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_key" ON "password_resets"("token");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "resources_name_key" ON "resources"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "posts_post_id_key" ON "posts"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "posts_status_published_date_idx" ON "posts"("status", "published_date");

-- CreateIndex
CREATE INDEX "posts_authorId_status_idx" ON "posts"("authorId", "status");

-- CreateIndex
CREATE INDEX "posts_createdAt_idx" ON "posts"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_id_key" ON "categories"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_tag_id_key" ON "tags"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "comments_targetId_targetType_idx" ON "comments"("targetId", "targetType");

-- CreateIndex
CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");

-- CreateIndex
CREATE INDEX "comments_createdAt_idx" ON "comments"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "forums_forum_id_key" ON "forums"("forum_id");

-- CreateIndex
CREATE UNIQUE INDEX "forums_slug_key" ON "forums"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "topics_topic_id_key" ON "topics"("topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "replies_reply_id_key" ON "replies"("reply_id");

-- CreateIndex
CREATE UNIQUE INDEX "votes_vote_id_key" ON "votes"("vote_id");

-- CreateIndex
CREATE UNIQUE INDEX "votes_replyId_userId_key" ON "votes"("replyId", "userId");

-- CreateIndex
CREATE INDEX "jobs_employerId_createdAt_idx" ON "jobs"("employerId", "createdAt");

-- CreateIndex
CREATE INDEX "jobs_isPromoted_promotionEndsAt_idx" ON "jobs"("isPromoted", "promotionEndsAt");

-- CreateIndex
CREATE INDEX "jobs_expiryDate_idx" ON "jobs"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "job_categories_cat_id_key" ON "job_categories"("cat_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_categories_slug_key" ON "job_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "skills_skill_id_key" ON "skills"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "job_categories_data_jobId_categorieId_key" ON "job_categories_data"("jobId", "categorieId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_jobId_key" ON "Bookmark"("userId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_participants_userId_roomId_key" ON "chat_participants"("userId", "roomId");

-- CreateIndex
CREATE INDEX "messages_roomId_idx" ON "messages"("roomId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "chat_documents_messageId_documentId_key" ON "chat_documents"("messageId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "message_reactions_messageId_userId_reaction_key" ON "message_reactions"("messageId", "userId", "reaction");

-- CreateIndex
CREATE UNIQUE INDEX "chat_invites_token_key" ON "chat_invites"("token");

-- CreateIndex
CREATE INDEX "direct_messages_senderId_receiverId_idx" ON "direct_messages"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "direct_messages_createdAt_idx" ON "direct_messages"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "transcripts_episodeId_key" ON "transcripts"("episodeId");

-- CreateIndex
CREATE UNIQUE INDEX "PodcastSubscription_userId_podcastId_key" ON "PodcastSubscription"("userId", "podcastId");

-- CreateIndex
CREATE UNIQUE INDEX "book_categories_slug_key" ON "book_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_books_userId_bookId_key" ON "user_books"("userId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "tutorial_progress_userId_tutorialId_key" ON "tutorial_progress"("userId", "tutorialId");

-- CreateIndex
CREATE UNIQUE INDEX "tutorial_categories_slug_key" ON "tutorial_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "content_reports_contentId_contentType_idx" ON "content_reports"("contentId", "contentType");

-- CreateIndex
CREATE INDEX "content_reports_status_idx" ON "content_reports"("status");

-- CreateIndex
CREATE INDEX "moderation_logs_moderatorId_idx" ON "moderation_logs"("moderatorId");

-- CreateIndex
CREATE INDEX "moderation_logs_targetType_targetId_idx" ON "moderation_logs"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "moderation_logs_createdAt_idx" ON "moderation_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_name_key" ON "achievements"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "user_points_userId_key" ON "user_points"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_eventType_idx" ON "events"("eventType");

-- CreateIndex
CREATE INDEX "events_startTime_idx" ON "events"("startTime");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "event_registrations_status_idx" ON "event_registrations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_eventId_userId_key" ON "event_registrations"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "event_feedback_eventId_userId_key" ON "event_feedback"("eventId", "userId");

-- CreateIndex
CREATE INDEX "content_likes_contentId_contentType_idx" ON "content_likes"("contentId", "contentType");

-- CreateIndex
CREATE UNIQUE INDEX "content_likes_contentId_contentType_userId_key" ON "content_likes"("contentId", "contentType", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "content_flags_contentId_contentType_userId_key" ON "content_flags"("contentId", "contentType", "userId");

-- CreateIndex
CREATE INDEX "content_views_contentId_contentType_idx" ON "content_views"("contentId", "contentType");

-- CreateIndex
CREATE INDEX "content_views_contentId_contentType_viewedAt_idx" ON "content_views"("contentId", "contentType", "viewedAt");

-- CreateIndex
CREATE INDEX "content_views_viewedAt_idx" ON "content_views"("viewedAt");

-- CreateIndex
CREATE INDEX "content_shares_contentId_contentType_idx" ON "content_shares"("contentId", "contentType");

-- CreateIndex
CREATE INDEX "saved_drafts_userId_contentType_idx" ON "saved_drafts"("userId", "contentType");

-- CreateIndex
CREATE INDEX "sponsored_content_status_idx" ON "sponsored_content"("status");

-- CreateIndex
CREATE INDEX "sponsored_content_startDate_endDate_idx" ON "sponsored_content"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_createdAt_idx" ON "notifications"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_type_createdAt_idx" ON "notifications"("type", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "user_activity_logs_userId_activityType_idx" ON "user_activity_logs"("userId", "activityType");

-- CreateIndex
CREATE INDEX "user_activity_logs_createdAt_idx" ON "user_activity_logs"("createdAt");

-- CreateIndex
CREATE INDEX "user_activity_logs_sessionId_idx" ON "user_activity_logs"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_analytics_date_key" ON "daily_analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToUserPreference_AB_unique" ON "_CategoryToUserPreference"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToUserPreference_B_index" ON "_CategoryToUserPreference"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CategorieToUserPreference_AB_unique" ON "_CategorieToUserPreference"("A", "B");

-- CreateIndex
CREATE INDEX "_CategorieToUserPreference_B_index" ON "_CategorieToUserPreference"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BookToBookCategory_AB_unique" ON "_BookToBookCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_BookToBookCategory_B_index" ON "_BookToBookCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BookCategoryToUserPreference_AB_unique" ON "_BookCategoryToUserPreference"("A", "B");

-- CreateIndex
CREATE INDEX "_BookCategoryToUserPreference_B_index" ON "_BookCategoryToUserPreference"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TutorialToTutorialCategory_AB_unique" ON "_TutorialToTutorialCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_TutorialToTutorialCategory_B_index" ON "_TutorialToTutorialCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TutorialCategoryToUserPreference_AB_unique" ON "_TutorialCategoryToUserPreference"("A", "B");

-- CreateIndex
CREATE INDEX "_TutorialCategoryToUserPreference_B_index" ON "_TutorialCategoryToUserPreference"("B");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_parentDeptId_fkey" FOREIGN KEY ("parentDeptId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_headUserId_fkey" FOREIGN KEY ("headUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "UserPreference"("preference_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_tokens" ADD CONSTRAINT "session_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_tokens" ADD CONSTRAINT "session_tokens_deviceTokenId_fkey" FOREIGN KEY ("deviceTokenId") REFERENCES "device_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_notifications" ADD CONSTRAINT "push_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobile_analytics" ADD CONSTRAINT "mobile_analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offline_sync_queue" ADD CONSTRAINT "offline_sync_queue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_rate_limits" ADD CONSTRAINT "api_rate_limits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobile_content_preferences" ADD CONSTRAINT "mobile_content_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_media" ADD CONSTRAINT "content_media_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("iddocument") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_verifications" ADD CONSTRAINT "phone_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_categories" ADD CONSTRAINT "post_categories_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_categories" ADD CONSTRAINT "post_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("tag_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "comments"("comment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("post_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("topic_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forums" ADD CONSTRAINT "forums_parentForumId_fkey" FOREIGN KEY ("parentForumId") REFERENCES "forums"("forum_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES "forums"("forum_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "replies" ADD CONSTRAINT "replies_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "replies" ADD CONSTRAINT "replies_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "replies"("reply_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_sponsoredById_fkey" FOREIGN KEY ("sponsoredById") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_categories" ADD CONSTRAINT "job_categories_jobAlertJobalert_id_fkey" FOREIGN KEY ("jobAlertJobalert_id") REFERENCES "job_alerts"("jobalert_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_categories_data" ADD CONSTRAINT "job_categories_data_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("job_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_categories_data" ADD CONSTRAINT "job_categories_data_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "job_categories"("cat_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("job_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("skill_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("job_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_appId_fkey" FOREIGN KEY ("appId") REFERENCES "applications"("app_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_docId_fkey" FOREIGN KEY ("docId") REFERENCES "documents"("iddocument") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("job_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_alerts" ADD CONSTRAINT "job_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_reviews" ADD CONSTRAINT "company_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_reviews" ADD CONSTRAINT "company_reviews_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_reviews" ADD CONSTRAINT "company_reviews_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_events" ADD CONSTRAINT "application_events_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("app_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_views" ADD CONSTRAINT "job_views_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("job_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_views" ADD CONSTRAINT "job_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("room_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "messages"("message_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_documents" ADD CONSTRAINT "chat_documents_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("message_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_documents" ADD CONSTRAINT "chat_documents_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("iddocument") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("message_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_invites" ADD CONSTRAINT "chat_invites_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_invites" ADD CONSTRAINT "chat_invites_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_audits" ADD CONSTRAINT "chat_audits_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_audits" ADD CONSTRAINT "chat_audits_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "direct_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcasts" ADD CONSTRAINT "podcasts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "podcasts"("podcast_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listen" ADD CONSTRAINT "Listen_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "episodes"("episode_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listen" ADD CONSTRAINT "Listen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "episodes"("episode_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PodcastSubscription" ADD CONSTRAINT "PodcastSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PodcastSubscription" ADD CONSTRAINT "PodcastSubscription_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "podcasts"("podcast_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcast_comments" ADD CONSTRAINT "podcast_comments_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "episodes"("episode_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcast_comments" ADD CONSTRAINT "podcast_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcast_comments" ADD CONSTRAINT "podcast_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "podcast_comments"("podcom_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_books" ADD CONSTRAINT "user_books_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_books" ADD CONSTRAINT "user_books_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("book_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorials" ADD CONSTRAINT "tutorials_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorial_sections" ADD CONSTRAINT "tutorial_sections_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "tutorials"("tutorial_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorial_progress" ADD CONSTRAINT "tutorial_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorial_progress" ADD CONSTRAINT "tutorial_progress_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "tutorials"("tutorial_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_moderatedBy_fkey" FOREIGN KEY ("moderatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_points" ADD CONSTRAINT "user_points_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizationHostId_fkey" FOREIGN KEY ("organizationHostId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_userHostId_fkey" FOREIGN KEY ("userHostId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_feedback" ADD CONSTRAINT "event_feedback_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_feedback" ADD CONSTRAINT "event_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attachments" ADD CONSTRAINT "event_attachments_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attachments" ADD CONSTRAINT "event_attachments_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("iddocument") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_likes" ADD CONSTRAINT "content_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_flags" ADD CONSTRAINT "content_flags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_views" ADD CONSTRAINT "content_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_shares" ADD CONSTRAINT "content_shares_sharedBy_fkey" FOREIGN KEY ("sharedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_drafts" ADD CONSTRAINT "saved_drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsored_content" ADD CONSTRAINT "sponsored_content_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsored_content" ADD CONSTRAINT "sponsored_content_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToUserPreference" ADD CONSTRAINT "_CategoryToUserPreference_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToUserPreference" ADD CONSTRAINT "_CategoryToUserPreference_B_fkey" FOREIGN KEY ("B") REFERENCES "UserPreference"("preference_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategorieToUserPreference" ADD CONSTRAINT "_CategorieToUserPreference_A_fkey" FOREIGN KEY ("A") REFERENCES "job_categories"("cat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategorieToUserPreference" ADD CONSTRAINT "_CategorieToUserPreference_B_fkey" FOREIGN KEY ("B") REFERENCES "UserPreference"("preference_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookToBookCategory" ADD CONSTRAINT "_BookToBookCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "books"("book_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookToBookCategory" ADD CONSTRAINT "_BookToBookCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "book_categories"("bookcat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookCategoryToUserPreference" ADD CONSTRAINT "_BookCategoryToUserPreference_A_fkey" FOREIGN KEY ("A") REFERENCES "book_categories"("bookcat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookCategoryToUserPreference" ADD CONSTRAINT "_BookCategoryToUserPreference_B_fkey" FOREIGN KEY ("B") REFERENCES "UserPreference"("preference_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TutorialToTutorialCategory" ADD CONSTRAINT "_TutorialToTutorialCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "tutorials"("tutorial_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TutorialToTutorialCategory" ADD CONSTRAINT "_TutorialToTutorialCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "tutorial_categories"("tutcat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TutorialCategoryToUserPreference" ADD CONSTRAINT "_TutorialCategoryToUserPreference_A_fkey" FOREIGN KEY ("A") REFERENCES "tutorial_categories"("tutcat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TutorialCategoryToUserPreference" ADD CONSTRAINT "_TutorialCategoryToUserPreference_B_fkey" FOREIGN KEY ("B") REFERENCES "UserPreference"("preference_id") ON DELETE CASCADE ON UPDATE CASCADE;
