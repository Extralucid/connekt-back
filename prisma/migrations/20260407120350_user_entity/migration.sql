-- AlterTable
ALTER TABLE "books" ADD COLUMN     "language" TEXT DEFAULT 'en',
ADD COLUMN     "publisher" TEXT DEFAULT 'O''Reilly Media',
ALTER COLUMN "isbn" DROP NOT NULL;
