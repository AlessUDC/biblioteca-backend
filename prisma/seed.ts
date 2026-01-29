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
    { nombre: 'Ingeniería' },
    { nombre: 'Ciencias de la Salud' },
    { nombre: 'Derecho y Ciencias Políticas' },
    { nombre: 'Ciencias Empresariales' },
    { nombre: 'Arquitectura y Diseño' },
    { nombre: 'Humanidades y Artes' },
    { nombre: 'Ciencias Sociales' },
  ];

  console.log('Seeding Facultades...');
  for (const data of facultades) {
    await prisma.facultad.create({ data });
  }

  // --- 2. Escuelas (7) ---
  const escuelas = [
    { nombre: 'Ingeniería de Sistemas', facultadId: 1 },
    { nombre: 'Ingeniería de Minas', facultadId: 1 },
    { nombre: 'Medicina Humana', facultadId: 2 },
    { nombre: 'Derecho', facultadId: 3 },
    { nombre: 'Contabilidad', facultadId: 4 },
    { nombre: 'Gastronomía', facultadId: 5 },
    { nombre: 'Psicología', facultadId: 6 },
  ];

  console.log('Seeding Escuelas...');
  for (const data of escuelas) {
    await prisma.escuela.create({
      data: {
        nombre: data.nombre,
        facultad: { connect: { facultadId: data.facultadId } }
      }
    });
  }

  // --- 3. Bibliotecarios (7) ---
  const bibliotecarios: Prisma.BibliotecarioCreateInput[] = [
    { nombre: 'Juan', apellidoPaterno: 'Pérez', apellidoMaterno: 'Gómez' },
    { nombre: 'María', apellidoPaterno: 'López', apellidoMaterno: 'Díaz' },
    { nombre: 'Carlos', apellidoPaterno: 'Ruiz', apellidoMaterno: 'Fernández' },
    { nombre: 'Ana', apellidoPaterno: 'Torres', apellidoMaterno: 'Vargas' },
    { nombre: 'Luis', apellidoPaterno: 'Mendoza', apellidoMaterno: 'Rojas' },
    { nombre: 'Elena', apellidoPaterno: 'Castro', apellidoMaterno: 'Silva' },
    { nombre: 'Roberto', apellidoPaterno: 'Morales', apellidoMaterno: 'Soto' },
  ];

  console.log('Seeding Bibliotecarios...');
  for (const data of bibliotecarios) {
    await prisma.bibliotecario.create({ data });
  }

  // --- 4. Categorias (ex Areas) (7) ---
  const categorias: Prisma.CategoriaCreateInput[] = [
    { nombre: 'Informática' },
    { nombre: 'Literatura' },
    { nombre: 'Historia' },
    { nombre: 'Ciencias Puras' },
    { nombre: 'Filosofía' },
    { nombre: 'Arte' },
    { nombre: 'Matemáticas' },
  ];

  console.log('Seeding Categorias...');
  for (const data of categorias) {
    await prisma.categoria.create({ data });
  }

  // --- 5. Editoriales (7) ---
  const editoriales: Prisma.EditorialCreateInput[] = [
    { nombre: 'Planeta' },
    { nombre: 'Alfaguara' },
    { nombre: 'Penguin Random House' },
    { nombre: 'McGraw-Hill' },
    { nombre: 'Pearson' },
    { nombre: 'Anagrama' },
    { nombre: 'Fondo de Cultura Económica' },
  ];

  console.log('Seeding Editoriales...');
  for (const data of editoriales) {
    await prisma.editorial.create({ data });
  }

  // --- 6. Autores (7) ---
  const autores: Prisma.AutorCreateInput[] = [
    { nombre: 'Gabriel', apellidoPaterno: 'García', apellidoMaterno: 'Márquez', ORCID: '0000-0001-1111-1111', nacionalidad: 'Colombiana' },
    { nombre: 'Isabel', apellidoPaterno: 'Allende', apellidoMaterno: 'Llona', ORCID: '0000-0002-2222-2222', nacionalidad: 'Chilena' },
    { nombre: 'Jorge Luis', apellidoPaterno: 'Borges', apellidoMaterno: 'Acevedo', ORCID: '0000-0003-3333-3333', nacionalidad: 'Argentina' },
    { nombre: 'Mario', apellidoPaterno: 'Vargas', apellidoMaterno: 'Llosa', ORCID: '0000-0004-4444-4444', nacionalidad: 'Peruana' },
    { nombre: 'Julio', apellidoPaterno: 'Cortázar', apellidoMaterno: 'Descotte', ORCID: '0000-0005-5555-5555', nacionalidad: 'Argentina' },
    { nombre: 'Pablo', apellidoPaterno: 'Neruda', apellidoMaterno: 'Basoalto', ORCID: '0000-0006-6666-6666', nacionalidad: 'Chilena' },
    { nombre: 'Stephen', apellidoPaterno: 'King', ORCID: '0000-0007-7777-7777', nacionalidad: 'Estadounidense', apellidoMaterno: null },
    { nombre: 'Anónimo', nacionalidad: null, ORCID: null, apellidoPaterno: null, apellidoMaterno: null },
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
    { nombre: 'Cien Años de Soledad', categoriaId: 2, editorialId: 1 },
    { nombre: 'Clean Code', categoriaId: 1, editorialId: 5 },
    { nombre: 'La Ciudad y los Perros', categoriaId: 2, editorialId: 2 },
    { nombre: 'Historia del Tiempo', categoriaId: 4, editorialId: 3 },
    { nombre: 'El Principito', categoriaId: 2, editorialId: 1 },
    { nombre: 'Rayuela', categoriaId: 2, editorialId: 6 },
    { nombre: 'It', categoriaId: 2, editorialId: 3 },
  ];

  console.log('Seeding Libros...');
  for (const data of libros) {
    await prisma.libro.create({
      data: {
        nombre: data.nombre,
        categoria: { connect: { categoriaId: data.categoriaId } },
        editorial: { connect: { editorialId: data.editorialId } }
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
          autor: { connect: { autorId: i } }
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
    { tipoDocumento: 'DNI', numeroDocumento: '60748729', nombre: 'Paolo Alessandro', apellidoPaterno: 'Ursua', apellidoMaterno: 'de la Cruz', escuelaId: 1 },
    { tipoDocumento: 'DNI', numeroDocumento: '70258228', nombre: 'Monica Jannet', apellidoPaterno: 'Ursua', apellidoMaterno: 'de la Cruz', escuelaId: 4 },
    { tipoDocumento: 'DNI', numeroDocumento: '61400979', nombre: 'Valeria Vanessa', apellidoPaterno: 'Vargas', apellidoMaterno: 'Gonzales', escuelaId: 6 },
    { tipoDocumento: 'DNI', numeroDocumento: '62141095', nombre: 'Fernando Daniel', apellidoPaterno: 'Garcia', apellidoMaterno: 'Herrera', escuelaId: 4, activo: false },
    { tipoDocumento: 'DNI', numeroDocumento: '60489498', nombre: 'Kamila Alejandra', apellidoPaterno: 'Dávila', apellidoMaterno: 'Chauca', escuelaId: 7 },
    { tipoDocumento: 'DNI', numeroDocumento: '60065416', nombre: 'Anderson', apellidoPaterno: 'Casaverde', apellidoMaterno: 'Huamán', escuelaId: 2 },
    { tipoDocumento: 'DNI', numeroDocumento: '70140569', nombre: 'Lucas Gabriel', apellidoPaterno: 'Navarro', apellidoMaterno: 'Santos', escuelaId: 3 },
  ];

  console.log('Seeding Estudiantes...');
  for (const data of estudiantes) {
    const { escuelaId, ...rest } = data;
    await prisma.estudiante.upsert({
      where: { numeroDocumento: data.numeroDocumento },
      update: rest,
      create: {
        ...rest,
        escuela: { connect: { escuelaId } }
      }
    });
  }

  // --- 11. Prestamos (7) ---
  const prestamos = [
    { estudianteId: 1, bibliotecarioId: 1, ejemplarId: 1, estadoPrestamo: EstadoPrestamo.ACTIVO, fechaDevolucion: null, fechaLimite: new Date(new Date().setDate(new Date().getDate() + 7)) },
    { estudianteId: 2, bibliotecarioId: 2, ejemplarId: 1, estadoPrestamo: EstadoPrestamo.DEVUELTO, fechaDevolucion: new Date(), fechaLimite: new Date(new Date().setDate(new Date().getDate() - 1)) },
    { estudianteId: 3, bibliotecarioId: 1, ejemplarId: 1, estadoPrestamo: EstadoPrestamo.ACTIVO, fechaDevolucion: null, fechaLimite: new Date(new Date().setDate(new Date().getDate() + 7)) },
  ];

  console.log('Seeding Prestamos...');
  for (const p of prestamos) {
    await prisma.prestamo.create({
      data: {
        estadoPrestamo: p.estadoPrestamo,
        fechaDevolucion: p.fechaDevolucion,
        fechaLimite: p.fechaLimite,
        estudiante: { connect: { estudianteId: p.estudianteId } },
        bibliotecario: { connect: { bibliotecarioId: p.bibliotecarioId } },
        ejemplar: { connect: { ejemplarId: p.ejemplarId } },
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
