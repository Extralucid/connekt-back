/*
  Warnings:

  - You are about to drop the `ChatAuditLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatAuditLog" DROP CONSTRAINT "ChatAuditLog_actorId_fkey";

-- DropForeignKey
ALTER TABLE "ChatAuditLog" DROP CONSTRAINT "ChatAuditLog_roomId_fkey";

-- DropTable
DROP TABLE "ChatAuditLog";

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
CREATE TABLE "podcasts" (
    "podcast_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT,
    "authorId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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

    CONSTRAINT "episodes_pkey" PRIMARY KEY ("episode_id")
);

-- CreateTable
CREATE TABLE "Listen" (
    "listen_id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "userId" TEXT,
    "listenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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

    CONSTRAINT "transcripts_pkey" PRIMARY KEY ("transcript_id")
);

-- CreateTable
CREATE TABLE "PodcastSubscription" (
    "podsub_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "podcastId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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

    CONSTRAINT "podcast_comments_pkey" PRIMARY KEY ("podcom_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transcripts_episodeId_key" ON "transcripts"("episodeId");

-- CreateIndex
CREATE UNIQUE INDEX "PodcastSubscription_userId_podcastId_key" ON "PodcastSubscription"("userId", "podcastId");

-- AddForeignKey
ALTER TABLE "chat_audits" ADD CONSTRAINT "chat_audits_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_audits" ADD CONSTRAINT "chat_audits_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
