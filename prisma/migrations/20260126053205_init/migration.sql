-- CreateEnum
CREATE TYPE "EstadoPrestamo" AS ENUM ('ACTIVO', 'DEVUELTO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "EstadoEjemplar" AS ENUM ('DISPONIBLE', 'PRESTADO', 'REPARACION', 'PERDIDO');

-- CreateTable
CREATE TABLE "Facultad" (
    "idFacultad" SERIAL NOT NULL,
    "nombreFacultad" TEXT NOT NULL,

    CONSTRAINT "Facultad_pkey" PRIMARY KEY ("idFacultad")
);

-- CreateTable
CREATE TABLE "Escuela" (
    "idEscuela" SERIAL NOT NULL,
    "nombreEscuela" TEXT NOT NULL,
    "idFacultad" INTEGER NOT NULL,

    CONSTRAINT "Escuela_pkey" PRIMARY KEY ("idEscuela")
);

-- CreateTable
CREATE TABLE "Estudiante" (
    "idEstudiante" SERIAL NOT NULL,
    "dniEstudiante" TEXT NOT NULL,
    "nombreEstudiante" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT NOT NULL,
    "idEscuela" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Estudiante_pkey" PRIMARY KEY ("idEstudiante")
);

-- CreateTable
CREATE TABLE "Bibliotecario" (
    "idBibliotecario" SERIAL NOT NULL,
    "nombreBibliotecario" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT NOT NULL,

    CONSTRAINT "Bibliotecario_pkey" PRIMARY KEY ("idBibliotecario")
);

-- CreateTable
CREATE TABLE "Area" (
    "idArea" SERIAL NOT NULL,
    "nombreArea" TEXT NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("idArea")
);

-- CreateTable
CREATE TABLE "Editorial" (
    "idEditorial" SERIAL NOT NULL,
    "nombreEditorial" TEXT NOT NULL,

    CONSTRAINT "Editorial_pkey" PRIMARY KEY ("idEditorial")
);

-- CreateTable
CREATE TABLE "Autor" (
    "idAutor" SERIAL NOT NULL,
    "nombreAutor" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT NOT NULL,
    "nacionalidad" TEXT NOT NULL,
    "ORCID" TEXT,

    CONSTRAINT "Autor_pkey" PRIMARY KEY ("idAutor")
);

-- CreateTable
CREATE TABLE "Libro" (
    "codigoLibro" SERIAL NOT NULL,
    "nombreLibro" TEXT NOT NULL,
    "idArea" INTEGER NOT NULL,
    "idEditorial" INTEGER NOT NULL,

    CONSTRAINT "Libro_pkey" PRIMARY KEY ("codigoLibro")
);

-- CreateTable
CREATE TABLE "LibroAutor" (
    "idLibro" INTEGER NOT NULL,
    "idAutor" INTEGER NOT NULL,

    CONSTRAINT "LibroAutor_pkey" PRIMARY KEY ("idLibro","idAutor")
);

-- CreateTable
CREATE TABLE "Ejemplar" (
    "idEjemplar" SERIAL NOT NULL,
    "codigoLibro" INTEGER NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "estado" "EstadoEjemplar" NOT NULL DEFAULT 'DISPONIBLE',

    CONSTRAINT "Ejemplar_pkey" PRIMARY KEY ("idEjemplar")
);

-- CreateTable
CREATE TABLE "Prestamo" (
    "idPrestamo" SERIAL NOT NULL,
    "idEstudiante" INTEGER NOT NULL,
    "idBibliotecario" INTEGER NOT NULL,
    "idEjemplar" INTEGER NOT NULL,
    "fechaPrestamo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaDevolucion" TIMESTAMP(3),
    "estadoPrestamo" "EstadoPrestamo" NOT NULL,

    CONSTRAINT "Prestamo_pkey" PRIMARY KEY ("idPrestamo")
);

-- CreateIndex
CREATE UNIQUE INDEX "Estudiante_dniEstudiante_key" ON "Estudiante"("dniEstudiante");

-- CreateIndex
CREATE UNIQUE INDEX "Autor_ORCID_key" ON "Autor"("ORCID");

-- AddForeignKey
ALTER TABLE "Escuela" ADD CONSTRAINT "Escuela_idFacultad_fkey" FOREIGN KEY ("idFacultad") REFERENCES "Facultad"("idFacultad") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estudiante" ADD CONSTRAINT "Estudiante_idEscuela_fkey" FOREIGN KEY ("idEscuela") REFERENCES "Escuela"("idEscuela") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Libro" ADD CONSTRAINT "Libro_idArea_fkey" FOREIGN KEY ("idArea") REFERENCES "Area"("idArea") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Libro" ADD CONSTRAINT "Libro_idEditorial_fkey" FOREIGN KEY ("idEditorial") REFERENCES "Editorial"("idEditorial") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibroAutor" ADD CONSTRAINT "LibroAutor_idLibro_fkey" FOREIGN KEY ("idLibro") REFERENCES "Libro"("codigoLibro") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibroAutor" ADD CONSTRAINT "LibroAutor_idAutor_fkey" FOREIGN KEY ("idAutor") REFERENCES "Autor"("idAutor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ejemplar" ADD CONSTRAINT "Ejemplar_codigoLibro_fkey" FOREIGN KEY ("codigoLibro") REFERENCES "Libro"("codigoLibro") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_idEstudiante_fkey" FOREIGN KEY ("idEstudiante") REFERENCES "Estudiante"("idEstudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_idBibliotecario_fkey" FOREIGN KEY ("idBibliotecario") REFERENCES "Bibliotecario"("idBibliotecario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_idEjemplar_fkey" FOREIGN KEY ("idEjemplar") REFERENCES "Ejemplar"("idEjemplar") ON DELETE RESTRICT ON UPDATE CASCADE;
