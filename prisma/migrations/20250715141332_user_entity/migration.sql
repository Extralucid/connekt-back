/*
  Warnings:

  - A unique constraint covering the columns `[preferenceId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "preferenceId" TEXT;

-- CreateTable
CREATE TABLE "UserPreference" (
    "preference_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "notifyNewContent" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("preference_id")
);

-- CreateTable
CREATE TABLE "_BookCategoryToUserPreference" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TutorialCategoryToUserPreference" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_BookCategoryToUserPreference_AB_unique" ON "_BookCategoryToUserPreference"("A", "B");

-- CreateIndex
CREATE INDEX "_BookCategoryToUserPreference_B_index" ON "_BookCategoryToUserPreference"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TutorialCategoryToUserPreference_AB_unique" ON "_TutorialCategoryToUserPreference"("A", "B");

-- CreateIndex
CREATE INDEX "_TutorialCategoryToUserPreference_B_index" ON "_TutorialCategoryToUserPreference"("B");

-- CreateIndex
CREATE UNIQUE INDEX "users_preferenceId_key" ON "users"("preferenceId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "UserPreference"("preference_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookCategoryToUserPreference" ADD CONSTRAINT "_BookCategoryToUserPreference_A_fkey" FOREIGN KEY ("A") REFERENCES "book_categories"("bookcat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookCategoryToUserPreference" ADD CONSTRAINT "_BookCategoryToUserPreference_B_fkey" FOREIGN KEY ("B") REFERENCES "UserPreference"("preference_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TutorialCategoryToUserPreference" ADD CONSTRAINT "_TutorialCategoryToUserPreference_A_fkey" FOREIGN KEY ("A") REFERENCES "tutorial_categories"("tutcat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TutorialCategoryToUserPreference" ADD CONSTRAINT "_TutorialCategoryToUserPreference_B_fkey" FOREIGN KEY ("B") REFERENCES "UserPreference"("preference_id") ON DELETE CASCADE ON UPDATE CASCADE;
