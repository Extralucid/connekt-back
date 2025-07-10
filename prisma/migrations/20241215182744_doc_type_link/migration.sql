/*
  Warnings:

  - Added the required column `tdocId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "tdocId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_tdocId_fkey" FOREIGN KEY ("tdocId") REFERENCES "Tdocument"("idtdoc") ON DELETE CASCADE ON UPDATE NO ACTION;
