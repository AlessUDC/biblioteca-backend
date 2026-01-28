import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const books = await prisma.libro.findMany({ select: { codigoLibro: true } });

    for (const book of books) {
        const ejemplares = await prisma.ejemplar.findMany({
            where: { codigoLibro: book.codigoLibro },
            orderBy: { idEjemplar: 'asc' },
        });

        if (ejemplares.length > 1) {
            const keeper = ejemplares[0];
            const duplicates = ejemplares.slice(1);

            for (const dup of duplicates) {
                // Update loans to point to the keeper
                await prisma.prestamo.updateMany({
                    where: { idEjemplar: dup.idEjemplar },
                    data: { idEjemplar: keeper.idEjemplar },
                });

                // Delete the duplicate
                await prisma.ejemplar.delete({
                    where: { idEjemplar: dup.idEjemplar },
                });
            }
            console.log(`Consolidated ${ejemplares.length} ejemplares for book ${book.codigoLibro} into one.`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
