-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MODERATOR', 'USER');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('OPEN', 'CLOSED', 'PINNED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('POST', 'TOPIC', 'REPLY', 'COMMENT');

-- CreateTable
CREATE TABLE "Profession" (
    "idprofession" TEXT NOT NULL,
    "codeprofession" VARCHAR(255) NOT NULL,
    "libelleprofession" VARCHAR(255) NOT NULL,
    "descriptionsprofession" TEXT,
    "published" BOOLEAN DEFAULT true,
    "isDeleted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profession_pkey" PRIMARY KEY ("idprofession")
);

-- CreateTable
CREATE TABLE "Prestataire" (
    "idprestataire" TEXT NOT NULL,
    "codeprestataire" VARCHAR(255) NOT NULL,
    "nomprestataire" VARCHAR(255) NOT NULL,
    "responsableprestataire" VARCHAR(255),
    "emailprestataire" VARCHAR(255),
    "siteprestataire" VARCHAR(255),
    "phoneprestataire" VARCHAR(255),
    "faxprestataire" VARCHAR(255),
    "longitudeprestataire" VARCHAR(255),
    "latitudeprestataire" VARCHAR(255),
    "descriptionprestataire" TEXT,
    "adresseprestataire" TEXT,
    "published" BOOLEAN DEFAULT true,
    "isDeleted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prestataire_pkey" PRIMARY KEY ("idprestataire")
);

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
CREATE TABLE "PasswordReset" (
    "idreset" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("idreset")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "pwd_hash" TEXT NOT NULL,
    "codeuser" VARCHAR(250) NOT NULL,
    "unom" VARCHAR(250),
    "uprenom" VARCHAR(250),
    "password_hash" VARCHAR(250),
    "display_name" VARCHAR(250),
    "registration_date" DATE,
    "last_login" DATE,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "profile_picture_url" VARCHAR(250),
    "bio" TEXT,
    "email_verified_at" DATE,
    "avatar" VARCHAR(250),
    "usession" VARCHAR(250),
    "prestataireId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tdocument" (
    "idtdoc" TEXT NOT NULL,
    "codetdoc" VARCHAR(255) NOT NULL,
    "nomtdoc" VARCHAR(255) NOT NULL,
    "descriptiontdoc" TEXT,
    "published" BOOLEAN DEFAULT true,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tdocument_pkey" PRIMARY KEY ("idtdoc")
);

-- CreateTable
CREATE TABLE "Document" (
    "iddocument" TEXT NOT NULL,
    "nomDocument" VARCHAR(255),
    "codeDocument" VARCHAR(255) NOT NULL,
    "descriptionDocument" TEXT,
    "published" BOOLEAN DEFAULT true,
    "imported" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tdocId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("iddocument")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
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
    "updated_date" DATE,
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

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "tags" (
    "tag_id" TEXT NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "slug" VARCHAR(250) NOT NULL,

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
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "parentCommentId" TEXT,

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
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMP(3) NOT NULL,
    "view_count" INTEGER DEFAULT 0,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("topic_id")
);

-- CreateTable
CREATE TABLE "replies" (
    "reply_id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_date" TIMESTAMP(3) NOT NULL,
    "isAcceptedAnswer" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "replies_pkey" PRIMARY KEY ("reply_id")
);

-- CreateTable
CREATE TABLE "votes" (
    "vote_id" TEXT NOT NULL,
    "replyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "VoteType" NOT NULL,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("vote_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceType" "SourceType" NOT NULL,
    "sourceId" INTEGER NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profession_idprofession_key" ON "Profession"("idprofession");

-- CreateIndex
CREATE UNIQUE INDEX "Profession_codeprofession_key" ON "Profession"("codeprofession");

-- CreateIndex
CREATE UNIQUE INDEX "Profession_libelleprofession_key" ON "Profession"("libelleprofession");

-- CreateIndex
CREATE UNIQUE INDEX "Prestataire_idprestataire_key" ON "Prestataire"("idprestataire");

-- CreateIndex
CREATE UNIQUE INDEX "Prestataire_codeprestataire_key" ON "Prestataire"("codeprestataire");

-- CreateIndex
CREATE UNIQUE INDEX "Prestataire_nomprestataire_key" ON "Prestataire"("nomprestataire");

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
CREATE UNIQUE INDEX "PasswordReset_idreset_key" ON "PasswordReset"("idreset");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Tdocument_idtdoc_key" ON "Tdocument"("idtdoc");

-- CreateIndex
CREATE UNIQUE INDEX "Tdocument_codetdoc_key" ON "Tdocument"("codetdoc");

-- CreateIndex
CREATE UNIQUE INDEX "Document_iddocument_key" ON "Document"("iddocument");

-- CreateIndex
CREATE UNIQUE INDEX "Document_codeDocument_key" ON "Document"("codeDocument");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_id_key" ON "RefreshToken"("id");

-- CreateIndex
CREATE UNIQUE INDEX "posts_post_id_key" ON "posts"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_id_key" ON "categories"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_tag_id_key" ON "tags"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "comments_comment_id_key" ON "comments"("comment_id");

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
CREATE UNIQUE INDEX "notifications_notification_id_key" ON "notifications"("notification_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_prestataireId_fkey" FOREIGN KEY ("prestataireId") REFERENCES "Prestataire"("idprestataire") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_tdocId_fkey" FOREIGN KEY ("tdocId") REFERENCES "Tdocument"("idtdoc") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "comments"("comment_id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
