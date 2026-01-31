import { PrismaClient, EstadoPrestamo } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLoans() {
    try {
        const now = new Date();
        const overdueLoans = await prisma.prestamo.findMany({
            where: {
                estadoPrestamo: EstadoPrestamo.ACTIVO,
                fechaLimite: {
                    lt: now,
                },
            },
            include: {
                estudiante: true,
                ejemplar: {
                    include: {
                        libro: true
                    }
                }
            }
        });

        console.log(`Encontrados ${overdueLoans.length} préstamos vencidos (ACTIVOS con fecha límite pasada).`);

        overdueLoans.forEach(loan => {
            console.log(`- Prestamo ID: ${loan.prestamoId} | Libro: ${loan.ejemplar.libro.nombre} | Estudiante: ${loan.estudiante.nombre} ${loan.estudiante.apellidoPaterno} | Vence: ${loan.fechaLimite.toISOString()} | Ahora: ${now.toISOString()}`);
        });

    } catch (error) {
        console.error('Error checking loans:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLoans();
