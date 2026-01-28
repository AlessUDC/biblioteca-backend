/*
  Warnings:

  - Added the required column `fechaLimite` to the `Prestamo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "EstadoEjemplar" ADD VALUE 'NO_DISPONIBLE';

-- AlterTable
ALTER TABLE "Estudiante" ADD COLUMN     "sanciones" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Prestamo" ADD COLUMN     "fechaLimite" TIMESTAMP(3) NOT NULL;
