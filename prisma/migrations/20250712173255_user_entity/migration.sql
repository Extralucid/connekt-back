-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "forums" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
