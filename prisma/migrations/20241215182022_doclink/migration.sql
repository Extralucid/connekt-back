/*
  Warnings:

  - You are about to drop the column `descriptionDocument` on the `Vehicule` table. All the data in the column will be lost.
  - Added the required column `assureId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cotationId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehiculeId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codevehicule` to the `Vehicule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "assureId" TEXT NOT NULL,
ADD COLUMN     "cotationId" TEXT NOT NULL,
ADD COLUMN     "vehiculeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Vehicule" DROP COLUMN "descriptionDocument",
ADD COLUMN     "codevehicule" VARCHAR(255) NOT NULL,
ADD COLUMN     "descriptionVehicule" TEXT;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assureId_fkey" FOREIGN KEY ("assureId") REFERENCES "Assure"("idassure") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_cotationId_fkey" FOREIGN KEY ("cotationId") REFERENCES "Cotation"("idcotation") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("idvehicule") ON DELETE CASCADE ON UPDATE NO ACTION;
