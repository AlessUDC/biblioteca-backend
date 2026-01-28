/*
  Warnings:

  - A unique constraint covering the columns `[codigoLibro]` on the table `Ejemplar` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Ejemplar" ADD COLUMN     "cantidadDisponible" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "cantidadTotal" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "Ejemplar_codigoLibro_key" ON "Ejemplar"("codigoLibro");
