/*
  Warnings:

  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tdocument` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE');

-- CreateEnum
CREATE TYPE "AppStatus" AS ENUM ('PENDING', 'REVIEWED', 'REJECTED', 'INTERVIEW', 'HIRED');

-- CreateEnum
CREATE TYPE "AlertFrequency" AS ENUM ('INSTANT', 'DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "AppEventType" AS ENUM ('STATUS_CHANGE', 'INTERVIEW', 'NOTE', 'EMAIL_SENT');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'EMPLOYER';

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_tdocId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_userId_fkey";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "Tdocument";

-- CreateTable
CREATE TABLE "tdocuments" (
    "idtdoc" TEXT NOT NULL,
    "nomtdoc" VARCHAR(255) NOT NULL,
    "descriptiontdoc" TEXT,
    "published" BOOLEAN DEFAULT true,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tdocuments_pkey" PRIMARY KEY ("idtdoc")
);

-- CreateTable
CREATE TABLE "documents" (
    "iddocument" TEXT NOT NULL,
    "nomDocument" VARCHAR(255),
    "description" TEXT,
    "fileUrl" VARCHAR(255) NOT NULL,
    "published" BOOLEAN DEFAULT true,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tdocId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("iddocument")
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

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("job_id")
);

-- CreateTable
CREATE TABLE "job_categories" (
    "cat_id" TEXT NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "slug" TEXT NOT NULL,
    "jobAlertJobalert_id" TEXT,

    CONSTRAINT "job_categories_pkey" PRIMARY KEY ("cat_id")
);

-- CreateTable
CREATE TABLE "skills" (
    "skill_id" TEXT NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "slug" TEXT NOT NULL,

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

-- CreateIndex
CREATE UNIQUE INDEX "tdocuments_idtdoc_key" ON "tdocuments"("idtdoc");

-- CreateIndex
CREATE UNIQUE INDEX "documents_iddocument_key" ON "documents"("iddocument");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_job_id_key" ON "jobs"("job_id");

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
CREATE UNIQUE INDEX "applications_app_id_key" ON "applications"("app_id");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_jobId_key" ON "Bookmark"("userId", "jobId");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tdocId_fkey" FOREIGN KEY ("tdocId") REFERENCES "tdocuments"("idtdoc") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "application_events" ADD CONSTRAINT "application_events_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("app_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_views" ADD CONSTRAINT "job_views_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("job_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_views" ADD CONSTRAINT "job_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
