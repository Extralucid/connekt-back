-- AlterTable
ALTER TABLE "job_categories" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "skills" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
