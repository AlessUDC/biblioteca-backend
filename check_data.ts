import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const counts = await prisma.ejemplar.groupBy({
        by: ['codigoLibro'],
        _count: {
            _all: true,
        },
    });
    console.log(JSON.stringify(counts, null, 2));
}

main().finally(() => prisma.$disconnect());
