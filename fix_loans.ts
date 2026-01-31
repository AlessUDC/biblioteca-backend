
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const prestamos = await prisma.prestamo.findMany();
    let fixedCount = 0;

    for (const p of prestamos) {
        if (p.fechaLimite < p.fechaPrestamo) {
            console.log(`Fixing Loan ${p.prestamoId}: Limite ${p.fechaLimite.toISOString()} < Prestamo ${p.fechaPrestamo.toISOString()}`);

            // Fix: Set limit to 7 days after loan start (default logic)
            const newLimit = new Date(p.fechaPrestamo);
            newLimit.setDate(newLimit.getDate() + 7);

            await prisma.prestamo.update({
                where: { prestamoId: p.prestamoId },
                data: { fechaLimite: newLimit }
            });
            fixedCount++;
        }
    }

    console.log(`Fixed ${fixedCount} loans.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
