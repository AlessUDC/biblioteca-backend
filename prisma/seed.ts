import { PrismaClient, EstadoPrestamo, Prisma } from '@prisma/client';

const EstadoEjemplar = {
  DISPONIBLE: 'DISPONIBLE',
  PRESTADO: 'PRESTADO',
  REPARACION: 'REPARACION',
  PERDIDO: 'PERDIDO',
} as const;

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- 1. Facultades (7) ---
  const facultades: Prisma.FacultadCreateInput[] = [
    { nombreFacultad: 'Ingeniería' },
    { nombreFacultad: 'Ciencias de la Salud' },
    { nombreFacultad: 'Derecho y Ciencias Políticas' },
    { nombreFacultad: 'Ciencias Empresariales' },
    { nombreFacultad: 'Arquitectura y Diseño' },
    { nombreFacultad: 'Humanidades y Artes' },
    { nombreFacultad: 'Ciencias Sociales' },
  ];

  console.log('Seeding Facultades...');
  for (const data of facultades) {
    await prisma.facultad.create({ data });
  }

  // --- 2. Escuelas (7) ---
  const escuelas = [
    { nombreEscuela: 'Ingeniería de Sistemas', idFacultad: 1 },
    { nombreEscuela: 'Ingeniería de Minas', idFacultad: 1 },
    { nombreEscuela: 'Medicina Humana', idFacultad: 2 },
    { nombreEscuela: 'Derecho', idFacultad: 3 },
    { nombreEscuela: 'Contabilidad', idFacultad: 4 },
    { nombreEscuela: 'Gastronomía', idFacultad: 5 },
    { nombreEscuela: 'Psicología', idFacultad: 6 },
  ];

  console.log('Seeding Escuelas...');
  for (const data of escuelas) {
    await prisma.escuela.create({
      data: {
        nombreEscuela: data.nombreEscuela,
        facultad: { connect: { idFacultad: data.idFacultad } }
      }
    });
  }

  // --- 3. Bibliotecarios (7) ---
  const bibliotecarios: Prisma.BibliotecarioCreateInput[] = [
    { nombreBibliotecario: 'Juan', apellidoPaterno: 'Pérez', apellidoMaterno: 'Gómez' },
    { nombreBibliotecario: 'María', apellidoPaterno: 'López', apellidoMaterno: 'Díaz' },
    { nombreBibliotecario: 'Carlos', apellidoPaterno: 'Ruiz', apellidoMaterno: 'Fernández' },
    { nombreBibliotecario: 'Ana', apellidoPaterno: 'Torres', apellidoMaterno: 'Vargas' },
    { nombreBibliotecario: 'Luis', apellidoPaterno: 'Mendoza', apellidoMaterno: 'Rojas' },
    { nombreBibliotecario: 'Elena', apellidoPaterno: 'Castro', apellidoMaterno: 'Silva' },
    { nombreBibliotecario: 'Roberto', apellidoPaterno: 'Morales', apellidoMaterno: 'Soto' },
  ];

  console.log('Seeding Bibliotecarios...');
  for (const data of bibliotecarios) {
    await prisma.bibliotecario.create({ data });
  }

  // --- 4. Áreas (7) ---
  const areas: Prisma.AreaCreateInput[] = [
    { nombreArea: 'Informática' },
    { nombreArea: 'Literatura' },
    { nombreArea: 'Historia' },
    { nombreArea: 'Ciencias Puras' },
    { nombreArea: 'Filosofía' },
    { nombreArea: 'Arte' },
    { nombreArea: 'Matemáticas' },
  ];

  console.log('Seeding Areas...');
  for (const data of areas) {
    await prisma.area.create({ data });
  }

  // --- 5. Editoriales (7) ---
  const editoriales: Prisma.EditorialCreateInput[] = [
    { nombreEditorial: 'Planeta' },
    { nombreEditorial: 'Alfaguara' },
    { nombreEditorial: 'Penguin Random House' },
    { nombreEditorial: 'McGraw-Hill' },
    { nombreEditorial: 'Pearson' },
    { nombreEditorial: 'Anagrama' },
    { nombreEditorial: 'Fondo de Cultura Económica' },
  ];

  console.log('Seeding Editoriales...');
  for (const data of editoriales) {
    await prisma.editorial.create({ data });
  }

  // --- 6. Autores (7) ---
  const autores: Prisma.AutorCreateInput[] = [
    { nombreAutor: 'Gabriel', apellidoPaterno: 'García', apellidoMaterno: 'Márquez', ORCID: '0000-0001-1111-1111', nacionalidad: 'Colombiana' },
    { nombreAutor: 'Isabel', apellidoPaterno: 'Allende', apellidoMaterno: 'Llona', ORCID: '0000-0002-2222-2222', nacionalidad: 'Chilena' },
    { nombreAutor: 'Jorge Luis', apellidoPaterno: 'Borges', apellidoMaterno: 'Acevedo', ORCID: '0000-0003-3333-3333', nacionalidad: 'Argentina' },
    { nombreAutor: 'Mario', apellidoPaterno: 'Vargas', apellidoMaterno: 'Llosa', ORCID: '0000-0004-4444-4444', nacionalidad: 'Peruana' },
    { nombreAutor: 'Julio', apellidoPaterno: 'Cortázar', apellidoMaterno: 'Descotte', ORCID: '0000-0005-5555-5555', nacionalidad: 'Argentina' },
    { nombreAutor: 'Pablo', apellidoPaterno: 'Neruda', apellidoMaterno: 'Basoalto', ORCID: '0000-0006-6666-6666', nacionalidad: 'Chilena' },
    { nombreAutor: 'Stephen', apellidoPaterno: 'King', ORCID: '0000-0007-7777-7777', nacionalidad: 'Estadounidense', apellidoMaterno: null },
    { nombreAutor: 'Anónimo', nacionalidad: null, ORCID: null, apellidoPaterno: null, apellidoMaterno: null },
  ];

  console.log('Seeding Autores...');
  for (const data of autores) {
    await prisma.autor.upsert({
      where: { ORCID: data.ORCID || 'undefined' },
      update: data as Prisma.AutorUpdateInput,
      create: data,
    });
  }

  // --- 7. Libros (7) ---
  const libros = [
    { nombreLibro: 'Cien Años de Soledad', idArea: 2, idEditorial: 1 },
    { nombreLibro: 'Clean Code', idArea: 1, idEditorial: 5 },
    { nombreLibro: 'La Ciudad y los Perros', idArea: 2, idEditorial: 2 },
    { nombreLibro: 'Historia del Tiempo', idArea: 4, idEditorial: 3 },
    { nombreLibro: 'El Principito', idArea: 2, idEditorial: 1 },
    { nombreLibro: 'Rayuela', idArea: 2, idEditorial: 6 },
    { nombreLibro: 'It', idArea: 2, idEditorial: 3 },
  ];

  console.log('Seeding Libros...');
  for (const data of libros) {
    await prisma.libro.create({
      data: {
        nombreLibro: data.nombreLibro,
        area: { connect: { idArea: data.idArea } },
        editorial: { connect: { idEditorial: data.idEditorial } }
      }
    });
  }

  // --- 8. LibroAutor ---
  console.log('Seeding LibroAutor...');
  for (let i = 1; i <= 7; i++) {
    try {
      await prisma.libroAutor.create({
        data: {
          libro: { connect: { codigoLibro: i } },
          autor: { connect: { idAutor: i } }
        }
      });
    } catch (e) {
      console.log(`Relacion Libro ${i} - Autor ${i} ya existe.`);
    }
  }

  // --- 9. Ejemplares (Stock Model) ---
  const ejemplares: Prisma.EjemplarCreateInput[] = [
    { libro: { connect: { codigoLibro: 1 } }, ubicacion: 'A-1', estado: 'PRESTADO', cantidadTotal: 10, cantidadDisponible: 5 },
    { libro: { connect: { codigoLibro: 2 } }, ubicacion: 'B-1', estado: 'DISPONIBLE', cantidadTotal: 10, cantidadDisponible: 10 },
    { libro: { connect: { codigoLibro: 3 } }, ubicacion: 'C-1', estado: 'PRESTADO', cantidadTotal: 10, cantidadDisponible: 2 },
    { libro: { connect: { codigoLibro: 4 } }, ubicacion: 'D-1', estado: 'PERDIDO', cantidadTotal: 10, cantidadDisponible: 0 },
    { libro: { connect: { codigoLibro: 5 } }, ubicacion: 'E-1', estado: 'PRESTADO', cantidadTotal: 10, cantidadDisponible: 8 },
    { libro: { connect: { codigoLibro: 6 } }, ubicacion: 'F-1', estado: 'DISPONIBLE', cantidadTotal: 10, cantidadDisponible: 10 },
    { libro: { connect: { codigoLibro: 7 } }, ubicacion: 'G-1', estado: 'PRESTADO', cantidadTotal: 10, cantidadDisponible: 4 },
  ];

  console.log('Seeding Ejemplares...');
  for (const data of ejemplares) {
    const codLibro = (data.libro.connect as any).codigoLibro;
    await prisma.ejemplar.upsert({
      where: { codigoLibro: codLibro },
      update: {
        ubicacion: data.ubicacion,
        estado: data.estado,
        cantidadTotal: data.cantidadTotal,
        cantidadDisponible: data.cantidadDisponible
      },
      create: data,
    });
  }

  // --- 10. Estudiantes (7) ---
  const estudiantes = [
    { dniEstudiante: '60748729', nombreEstudiante: 'Paolo Alessandro', apellidoPaterno: 'Ursua', apellidoMaterno: 'de la Cruz', idEscuela: 1 },
    { dniEstudiante: '70258228', nombreEstudiante: 'Monica Jannet', apellidoPaterno: 'Ursua', apellidoMaterno: 'de la Cruz', idEscuela: 4 },
    { dniEstudiante: '61400979', nombreEstudiante: 'Valeria Vanessa', apellidoPaterno: 'Vargas', apellidoMaterno: 'Gonzales', idEscuela: 6 },
    { dniEstudiante: '62141095', nombreEstudiante: 'Fernando Daniel', apellidoPaterno: 'Garcia', apellidoMaterno: 'Herrera', idEscuela: 4, activo: false },
    { dniEstudiante: '60489498', nombreEstudiante: 'Kamila Alejandra', apellidoPaterno: 'Dávila', apellidoMaterno: 'Chauca', idEscuela: 7 },
    { dniEstudiante: '60065416', nombreEstudiante: 'Anderson', apellidoPaterno: 'Casaverde', apellidoMaterno: 'Huamán', idEscuela: 2 },
    { dniEstudiante: '70140569', nombreEstudiante: 'Lucas Gabriel', apellidoPaterno: 'Navarro', apellidoMaterno: 'Santos', idEscuela: 3 },
  ];

  console.log('Seeding Estudiantes...');
  for (const data of estudiantes) {
    const { idEscuela, ...rest } = data;
    await prisma.estudiante.upsert({
      where: { dniEstudiante: data.dniEstudiante },
      update: rest,
      create: {
        ...rest,
        escuela: { connect: { idEscuela } }
      }
    });
  }

  // --- 11. Prestamos (7) ---
  const prestamos = [
    { idEstudiante: 1, idBibliotecario: 1, idEjemplar: 1, estadoPrestamo: EstadoPrestamo.ACTIVO, fechaDevolucion: null, fechaLimite: new Date(new Date().setDate(new Date().getDate() + 7)) },
    { idEstudiante: 2, idBibliotecario: 2, idEjemplar: 1, estadoPrestamo: EstadoPrestamo.DEVUELTO, fechaDevolucion: new Date(), fechaLimite: new Date(new Date().setDate(new Date().getDate() - 1)) },
    { idEstudiante: 3, idBibliotecario: 1, idEjemplar: 1, estadoPrestamo: EstadoPrestamo.ACTIVO, fechaDevolucion: null, fechaLimite: new Date(new Date().setDate(new Date().getDate() + 7)) },
  ];

  console.log('Seeding Prestamos...');
  for (const p of prestamos) {
    await prisma.prestamo.create({
      data: {
        estadoPrestamo: p.estadoPrestamo,
        fechaDevolucion: p.fechaDevolucion,
        fechaLimite: p.fechaLimite,
        estudiante: { connect: { idEstudiante: p.idEstudiante } },
        bibliotecario: { connect: { idBibliotecario: p.idBibliotecario } },
        ejemplar: { connect: { idEjemplar: p.idEjemplar } },
      }
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
