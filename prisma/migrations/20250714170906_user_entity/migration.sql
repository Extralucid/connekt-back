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

    CONSTRAINT "book_categories_pkey" PRIMARY KEY ("bookcat_id")
);

-- CreateTable
CREATE TABLE "user_books" (
    "userbook_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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

    CONSTRAINT "tutorial_progress_pkey" PRIMARY KEY ("tutprogress_id")
);

-- CreateTable
CREATE TABLE "tutorial_categories" (
    "tutcat_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tutorial_categories_pkey" PRIMARY KEY ("tutcat_id")
);

-- CreateTable
CREATE TABLE "_BookToBookCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TutorialToTutorialCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "book_categories_slug_key" ON "book_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_books_userId_bookId_key" ON "user_books"("userId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "tutorial_progress_userId_tutorialId_key" ON "tutorial_progress"("userId", "tutorialId");

-- CreateIndex
CREATE UNIQUE INDEX "tutorial_categories_slug_key" ON "tutorial_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_BookToBookCategory_AB_unique" ON "_BookToBookCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_BookToBookCategory_B_index" ON "_BookToBookCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TutorialToTutorialCategory_AB_unique" ON "_TutorialToTutorialCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_TutorialToTutorialCategory_B_index" ON "_TutorialToTutorialCategory"("B");

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
ALTER TABLE "_BookToBookCategory" ADD CONSTRAINT "_BookToBookCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "books"("book_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookToBookCategory" ADD CONSTRAINT "_BookToBookCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "book_categories"("bookcat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TutorialToTutorialCategory" ADD CONSTRAINT "_TutorialToTutorialCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "tutorials"("tutorial_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TutorialToTutorialCategory" ADD CONSTRAINT "_TutorialToTutorialCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "tutorial_categories"("tutcat_id") ON DELETE CASCADE ON UPDATE CASCADE;
