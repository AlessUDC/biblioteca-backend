-- CreateTable
CREATE TABLE "HistorialStock" (
    "historialId" SERIAL NOT NULL,
    "libroId" INTEGER NOT NULL,
    "cantidadAnterior" INTEGER NOT NULL,
    "cantidadNueva" INTEGER NOT NULL,
    "tipoMovimiento" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT,

    CONSTRAINT "HistorialStock_pkey" PRIMARY KEY ("historialId")
);

-- AddForeignKey
ALTER TABLE "HistorialStock" ADD CONSTRAINT "HistorialStock_libroId_fkey" FOREIGN KEY ("libroId") REFERENCES "Libro"("codigoLibro") ON DELETE RESTRICT ON UPDATE CASCADE;
