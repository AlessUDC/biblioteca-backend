import { PrismaClient, EstadoPrestamo } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- 1. Facultades (7) ---
  const facultades = [
    { nombreFacultad: 'Ingeniería' },
    { nombreFacultad: 'Ciencias de la Salud' },
    { nombreFacultad: 'Derecho y Ciencias Políticas' },
    { nombreFacultad: 'Ciencias Empresariales' },
    { nombreFacultad: 'Arquitectura y Diseño' },
    { nombreFacultad: 'Humanidades y Educación' },
    { nombreFacultad: 'Ciencias Agrarias' },
  ];

  console.log('Seeding Facultades...');
  for (const data of facultades) {
    await prisma.facultad.create({ data });
  }

  // --- 2. Escuelas (7) - Asumiendo que se crearon con IDs 1-7 ---
  // Repartimos las escuelas entre las facultades creadas
  const escuelas = [
    { nombreEscuela: 'Ingeniería de Sistemas', idFacultad: 1 },
    { nombreEscuela: 'Ingeniería Civil', idFacultad: 1 },
    { nombreEscuela: 'Medicina Humana', idFacultad: 2 },
    { nombreEscuela: 'Derecho', idFacultad: 3 },
    { nombreEscuela: 'Contabilidad', idFacultad: 4 },
    { nombreEscuela: 'Arquitectura', idFacultad: 5 },
    { nombreEscuela: 'Psicología', idFacultad: 6 },
  ];

  console.log('Seeding Escuelas...');
  for (const data of escuelas) {
    await prisma.escuela.create({ data });
  }

  // --- 3. Bibliotecarios (7) ---
  const bibliotecarios = [
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
  const areas = [
    { nombreArea: 'Tecnología' },
    { nombreArea: 'Literatura' },
    { nombreArea: 'Historia' },
    { nombreArea: 'Ciencias' },
    { nombreArea: 'Filosofía' },
    { nombreArea: 'Arte' },
    { nombreArea: 'Matemáticas' },
  ];

  console.log('Seeding Areas...');
  for (const data of areas) {
    await prisma.area.create({ data });
  }

  // --- 5. Editoriales (7) ---
  const editoriales = [
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

  // --- 6. Autores (7) - Upsert para evitar duplicados si ya existen ---
  const autores = [
    { nombreAutor: 'Gabriel', apellidoPaterno: 'García', apellidoMaterno: 'Márquez', ORCID: '0000-0001-1111-1111' },
    { nombreAutor: 'Isabel', apellidoPaterno: 'Allende', apellidoMaterno: 'Llona', ORCID: '0000-0002-2222-2222' },
    { nombreAutor: 'Jorge Luis', apellidoPaterno: 'Borges', apellidoMaterno: 'Acevedo', ORCID: '0000-0003-3333-3333' },
    { nombreAutor: 'Mario', apellidoPaterno: 'Vargas', apellidoMaterno: 'Llosa', ORCID: '0000-0004-4444-4444' },
    { nombreAutor: 'Julio', apellidoPaterno: 'Cortázar', apellidoMaterno: 'Descotte', ORCID: '0000-0005-5555-5555' },
    { nombreAutor: 'Pablo', apellidoPaterno: 'Neruda', apellidoMaterno: 'Basoalto', ORCID: '0000-0006-6666-6666' },
    { nombreAutor: 'Stephen', apellidoPaterno: 'King', apellidoMaterno: 'King', ORCID: '0000-0007-7777-7777' },
  ];

  console.log('Seeding Autores...');
  for (const data of autores) {
    await prisma.autor.upsert({
      where: { ORCID: data.ORCID },
      update: {},
      create: data,
    });
  }

  // --- 7. Libros (7) ---
  // Asumiendo IDs 1-7 para areas y editoriales
  const libros = [
    { nombreLibro: 'Cien Años de Soledad', idArea: 2, idEditorial: 1 }, // Lit, Planeta
    { nombreLibro: 'Clean Code', idArea: 1, idEditorial: 5 },           // Tech, Pearson
    { nombreLibro: 'La Ciudad y los Perros', idArea: 2, idEditorial: 2 }, // Lit, Alfaguara
    { nombreLibro: 'Historia del Tiempo', idArea: 4, idEditorial: 3 },  // Ciencias, Penguin
    { nombreLibro: 'El Principito', idArea: 2, idEditorial: 1 },        // Lit, Planeta
    { nombreLibro: 'Rayuela', idArea: 2, idEditorial: 6 },              // Lit, Anagrama
    { nombreLibro: 'It', idArea: 2, idEditorial: 3 },                   // Lit, Penguin
  ];

  console.log('Seeding Libros...');
  for (const data of libros) {
    await prisma.libro.create({ data });
  }

  // --- 8. LibroAutor (Vinculando libros con autores) ---
  // Vinculamos 1 a 1 para simplificar, asumiendo IDs 1-7
  console.log('Seeding LibroAutor...');
  for (let i = 1; i <= 7; i++) {
    // Si ya existen registros, esto podría fallar si no usamos upsert o verificamos, 
    // pero como es seed inicial o "limpio", create está bien.
    // Usamos createMany o loop simple.
    // Nota: El modelo LibroAutor tiene @@unique([codigoLibro, idAutor])
    try {
      await prisma.libroAutor.create({
        data: { codigoLibro: i, idAutor: i }
      });
    } catch (e) {
      // Ignorar si ya existe la relación
      console.log(`Relacion Libro ${i} - Autor ${i} ya existe o falló.`);
    }
  }

  // --- 9. Ejemplares (7) ---
  const ejemplares = [
    { codigoLibro: 1 },
    { codigoLibro: 2 },
    { codigoLibro: 3 },
    { codigoLibro: 4 },
    { codigoLibro: 5 },
    { codigoLibro: 6 },
    { codigoLibro: 7 },
  ];

  console.log('Seeding Ejemplares...');
  for (const data of ejemplares) {
    await prisma.ejemplar.create({ data });
  }

  // --- 10. Estudiantes (7) ---
  const estudiantes = [
    { dniEstudiante: '11111111', nombreEstudiante: 'Estudiante1', apellidoPaterno: 'A', apellidoMaterno: 'B', idEscuela: 1 },
    { dniEstudiante: '22222222', nombreEstudiante: 'Estudiante2', apellidoPaterno: 'C', apellidoMaterno: 'D', idEscuela: 2 },
    { dniEstudiante: '33333333', nombreEstudiante: 'Estudiante3', apellidoPaterno: 'E', apellidoMaterno: 'F', idEscuela: 3 },
    { dniEstudiante: '44444444', nombreEstudiante: 'Estudiante4', apellidoPaterno: 'G', apellidoMaterno: 'H', idEscuela: 4 },
    { dniEstudiante: '55555555', nombreEstudiante: 'Estudiante5', apellidoPaterno: 'I', apellidoMaterno: 'J', idEscuela: 5 },
    { dniEstudiante: '66666666', nombreEstudiante: 'Estudiante6', apellidoPaterno: 'K', apellidoMaterno: 'L', idEscuela: 6 },
    { dniEstudiante: '77777777', nombreEstudiante: 'Estudiante7', apellidoPaterno: 'M', apellidoMaterno: 'N', idEscuela: 7 },
  ];

  console.log('Seeding Estudiantes...');
  for (const data of estudiantes) {
    await prisma.estudiante.upsert({
      where: { dniEstudiante: data.dniEstudiante },
      update: {},
      create: data
    });
  }

  // --- 11. Prestamos (7) ---
  const prestamos = [
    { idEstudiante: 1, idBibliotecario: 1, idEjemplar: 1, estadoPrestamo: EstadoPrestamo.ACTIVO, fechaDevolucion: null },
    { idEstudiante: 2, idBibliotecario: 2, idEjemplar: 2, estadoPrestamo: EstadoPrestamo.DEVUELTO, fechaDevolucion: new Date() },
    { idEstudiante: 3, idBibliotecario: 1, idEjemplar: 3, estadoPrestamo: EstadoPrestamo.ACTIVO, fechaDevolucion: null },
    { idEstudiante: 4, idBibliotecario: 2, idEjemplar: 4, estadoPrestamo: EstadoPrestamo.PERDIDO, fechaDevolucion: null },
    { idEstudiante: 5, idBibliotecario: 1, idEjemplar: 5, estadoPrestamo: EstadoPrestamo.ACTIVO, fechaDevolucion: null },
    { idEstudiante: 6, idBibliotecario: 2, idEjemplar: 6, estadoPrestamo: EstadoPrestamo.DEVUELTO, fechaDevolucion: new Date() },
    { idEstudiante: 7, idBibliotecario: 1, idEjemplar: 7, estadoPrestamo: EstadoPrestamo.ACTIVO, fechaDevolucion: null },
  ];

  console.log('Seeding Prestamos...');
  for (const data of prestamos) {
    await prisma.prestamo.create({ data });
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
