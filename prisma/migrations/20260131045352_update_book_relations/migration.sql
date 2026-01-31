/*
  Warnings:

  - You are about to drop the column `categoriaId` on the `Libro` table. All the data in the column will be lost.
  - You are about to drop the column `editorialId` on the `Libro` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Libro" DROP CONSTRAINT "Libro_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "Libro" DROP CONSTRAINT "Libro_editorialId_fkey";

-- AlterTable
ALTER TABLE "Libro" DROP COLUMN "categoriaId",
DROP COLUMN "editorialId";

-- CreateTable
CREATE TABLE "_CategoriaToLibro" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoriaToLibro_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EditorialToLibro" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EditorialToLibro_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CategoriaToLibro_B_index" ON "_CategoriaToLibro"("B");

-- CreateIndex
CREATE INDEX "_EditorialToLibro_B_index" ON "_EditorialToLibro"("B");

-- AddForeignKey
ALTER TABLE "_CategoriaToLibro" ADD CONSTRAINT "_CategoriaToLibro_A_fkey" FOREIGN KEY ("A") REFERENCES "Categoria"("categoriaId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriaToLibro" ADD CONSTRAINT "_CategoriaToLibro_B_fkey" FOREIGN KEY ("B") REFERENCES "Libro"("codigoLibro") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditorialToLibro" ADD CONSTRAINT "_EditorialToLibro_A_fkey" FOREIGN KEY ("A") REFERENCES "Editorial"("editorialId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EditorialToLibro" ADD CONSTRAINT "_EditorialToLibro_B_fkey" FOREIGN KEY ("B") REFERENCES "Libro"("codigoLibro") ON DELETE CASCADE ON UPDATE CASCADE;
