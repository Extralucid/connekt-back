/*
  Warnings:

  - You are about to drop the column `prestataireId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `Prestataire` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_prestataireId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "prestataireId";

-- DropTable
DROP TABLE "Prestataire";

-- DropTable
DROP TABLE "Profession";
