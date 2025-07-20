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

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToUserPreference_AB_unique" ON "_CategoryToUserPreference"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToUserPreference_B_index" ON "_CategoryToUserPreference"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CategorieToUserPreference_AB_unique" ON "_CategorieToUserPreference"("A", "B");

-- CreateIndex
CREATE INDEX "_CategorieToUserPreference_B_index" ON "_CategorieToUserPreference"("B");

-- AddForeignKey
ALTER TABLE "_CategoryToUserPreference" ADD CONSTRAINT "_CategoryToUserPreference_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToUserPreference" ADD CONSTRAINT "_CategoryToUserPreference_B_fkey" FOREIGN KEY ("B") REFERENCES "UserPreference"("preference_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategorieToUserPreference" ADD CONSTRAINT "_CategorieToUserPreference_A_fkey" FOREIGN KEY ("A") REFERENCES "job_categories"("cat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategorieToUserPreference" ADD CONSTRAINT "_CategorieToUserPreference_B_fkey" FOREIGN KEY ("B") REFERENCES "UserPreference"("preference_id") ON DELETE CASCADE ON UPDATE CASCADE;
