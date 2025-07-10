/*
  Warnings:

  - Added the required column `activiteId` to the `Assure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marqueId` to the `Modele` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assure" ADD COLUMN     "activiteId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Modele" ADD COLUMN     "marqueId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Assure" ADD CONSTRAINT "Assure_activiteId_fkey" FOREIGN KEY ("activiteId") REFERENCES "Activite"("idactivite") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Modele" ADD CONSTRAINT "Modele_marqueId_fkey" FOREIGN KEY ("marqueId") REFERENCES "Marque"("idmarque") ON DELETE CASCADE ON UPDATE NO ACTION;
