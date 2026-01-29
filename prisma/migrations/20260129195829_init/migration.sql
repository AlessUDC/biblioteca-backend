-- CreateEnum
CREATE TYPE "EstadoPrestamo" AS ENUM ('ACTIVO', 'DEVUELTO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "EstadoEjemplar" AS ENUM ('DISPONIBLE', 'PRESTADO', 'REPARACION', 'PERDIDO', 'NO_DISPONIBLE');

-- CreateTable
CREATE TABLE "Facultad" (
    "facultadId" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Facultad_pkey" PRIMARY KEY ("facultadId")
);

-- CreateTable
CREATE TABLE "Escuela" (
    "escuelaId" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "facultadId" INTEGER NOT NULL,

    CONSTRAINT "Escuela_pkey" PRIMARY KEY ("escuelaId")
);

-- CreateTable
CREATE TABLE "Estudiante" (
    "estudianteId" SERIAL NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT NOT NULL,
    "escuelaId" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "sanciones" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Estudiante_pkey" PRIMARY KEY ("estudianteId")
);

-- CreateTable
CREATE TABLE "Bibliotecario" (
    "bibliotecarioId" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT NOT NULL,

    CONSTRAINT "Bibliotecario_pkey" PRIMARY KEY ("bibliotecarioId")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "categoriaId" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("categoriaId")
);

-- CreateTable
CREATE TABLE "Editorial" (
    "editorialId" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Editorial_pkey" PRIMARY KEY ("editorialId")
);

-- CreateTable
CREATE TABLE "Autor" (
    "autorId" SERIAL NOT NULL,
    "nombre" TEXT,
    "apellidoPaterno" TEXT,
    "apellidoMaterno" TEXT,
    "nacionalidad" TEXT,
    "ORCID" TEXT,

    CONSTRAINT "Autor_pkey" PRIMARY KEY ("autorId")
);

-- CreateTable
CREATE TABLE "Libro" (
    "codigoLibro" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "editorialId" INTEGER NOT NULL,

    CONSTRAINT "Libro_pkey" PRIMARY KEY ("codigoLibro")
);

-- CreateTable
CREATE TABLE "LibroAutor" (
    "libroId" INTEGER NOT NULL,
    "autorId" INTEGER NOT NULL,

    CONSTRAINT "LibroAutor_pkey" PRIMARY KEY ("libroId","autorId")
);

-- CreateTable
CREATE TABLE "Ejemplar" (
    "ejemplarId" SERIAL NOT NULL,
    "codigoLibro" INTEGER NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "cantidadTotal" INTEGER NOT NULL DEFAULT 1,
    "cantidadDisponible" INTEGER NOT NULL DEFAULT 1,
    "estado" "EstadoEjemplar" NOT NULL DEFAULT 'DISPONIBLE',

    CONSTRAINT "Ejemplar_pkey" PRIMARY KEY ("ejemplarId")
);

-- CreateTable
CREATE TABLE "Prestamo" (
    "prestamoId" SERIAL NOT NULL,
    "estudianteId" INTEGER NOT NULL,
    "bibliotecarioId" INTEGER NOT NULL,
    "ejemplarId" INTEGER NOT NULL,
    "fechaPrestamo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLimite" TIMESTAMP(3) NOT NULL,
    "fechaDevolucion" TIMESTAMP(3),
    "estadoPrestamo" "EstadoPrestamo" NOT NULL,

    CONSTRAINT "Prestamo_pkey" PRIMARY KEY ("prestamoId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Estudiante_numeroDocumento_key" ON "Estudiante"("numeroDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "Autor_ORCID_key" ON "Autor"("ORCID");

-- CreateIndex
CREATE UNIQUE INDEX "Ejemplar_codigoLibro_key" ON "Ejemplar"("codigoLibro");

-- AddForeignKey
ALTER TABLE "Escuela" ADD CONSTRAINT "Escuela_facultadId_fkey" FOREIGN KEY ("facultadId") REFERENCES "Facultad"("facultadId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estudiante" ADD CONSTRAINT "Estudiante_escuelaId_fkey" FOREIGN KEY ("escuelaId") REFERENCES "Escuela"("escuelaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Libro" ADD CONSTRAINT "Libro_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("categoriaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Libro" ADD CONSTRAINT "Libro_editorialId_fkey" FOREIGN KEY ("editorialId") REFERENCES "Editorial"("editorialId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibroAutor" ADD CONSTRAINT "LibroAutor_libroId_fkey" FOREIGN KEY ("libroId") REFERENCES "Libro"("codigoLibro") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibroAutor" ADD CONSTRAINT "LibroAutor_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Autor"("autorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ejemplar" ADD CONSTRAINT "Ejemplar_codigoLibro_fkey" FOREIGN KEY ("codigoLibro") REFERENCES "Libro"("codigoLibro") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("estudianteId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_bibliotecarioId_fkey" FOREIGN KEY ("bibliotecarioId") REFERENCES "Bibliotecario"("bibliotecarioId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_ejemplarId_fkey" FOREIGN KEY ("ejemplarId") REFERENCES "Ejemplar"("ejemplarId") ON DELETE RESTRICT ON UPDATE CASCADE;
