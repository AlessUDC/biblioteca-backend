// const fetch = require('node-fetch'); // Using native fetch within Node 18+

const BASE_URL = 'http://localhost:3000/api';

async function request(method, endpoint, data = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (data) options.body = JSON.stringify(data);

    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, options);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Failed: ${res.status} ${res.statusText} - ${text}`);
        }
        return await res.json();
    } catch (err) {
        console.error(`Error in ${method} ${endpoint}:`, err.message);
        throw err;
    }
}

async function testAutor() {
    console.log('\n--- Testing Autor ---');
    // 1. Create
    const newAutor = {
        nombreAutor: 'Gabriel',
        apellidoPaterno: 'Garcia',
        apellidoMaterno: 'Marquez',
        nacionalidad: 'Colombiana',
        ORCID: `0000-0000-0000-${Math.floor(Math.random() * 1000)}`
    };
    console.log('Creating Autor...');
    const created = await request('POST', '/autor', newAutor);
    console.log('Created:', created);

    // 2. Get All
    console.log('Fetching all Autors...');
    await request('GET', '/autor');

    // 3. Get One
    console.log('Fetching created Autor...');
    const fetched = await request('GET', `/autor/${created.idAutor}`);
    if (fetched.idAutor !== created.idAutor) throw new Error('Fetch One failed mismatch');

    // 4. Update
    console.log('Updating Autor...');
    const updated = await request('PATCH', `/autor/${created.idAutor}`, { nacionalidad: 'Mexicana' });
    console.log('Updated:', updated);
    if (updated.nacionalidad !== 'Mexicana') throw new Error('Update failed');

    // 5. Delete
    console.log('Deleting Autor...');
    await request('DELETE', `/autor/${created.idAutor}`);
    console.log('Deleted successfully');
}

async function testEjemplar() {
    console.log('\n--- Testing Ejemplar & Dependencies ---');

    // Prereqs: Area, Editorial, Autor, Libro
    console.log('Creating prereq: Area...');
    const area = await request('POST', '/area', { nombreArea: 'Realismo Magico' });

    console.log('Creating prereq: Editorial...');
    const editorial = await request('POST', '/editorial', { nombreEditorial: 'Sudamericana' });

    console.log('Creating prereq: Autor for Libro...');
    const autor = await request('POST', '/autor', {
        nombreAutor: 'Gabriel',
        apellidoPaterno: 'Garcia',
        apellidoMaterno: 'Marquez',
        nacionalidad: 'Colombiana',
        ORCID: `0000-0000-0000-${Math.floor(Math.random() * 1000)}`
    });

    console.log('Creating prereq: Libro...');
    const libro = await request('POST', '/libro', {
        nombreLibro: 'Cien Años de Soledad',
        idArea: area.idArea,
        idEditorial: editorial.idEditorial,
        autoresIds: [autor.idAutor]
    });
    console.log('Created Libro:', libro);

    // 1. Create Ejemplar
    console.log('Creating Ejemplar...');
    const newEjemplar = {
        codigoLibro: libro.codigoLibro,
        ubicacion: 'Estante A1',
        estado: 'Disponible'
    };
    const created = await request('POST', '/ejemplar', newEjemplar);
    console.log('Created Ejemplar:', created);

    // 2. Get All
    console.log('Fetching all Ejemplares...');
    await request('GET', '/ejemplar');

    // 3. Get One
    console.log('Fetching created Ejemplar...');
    await request('GET', `/ejemplar/${created.idEjemplar}`);

    // 4. Update
    console.log('Updating Ejemplar...');
    const updated = await request('PATCH', `/ejemplar/${created.idEjemplar}`, { estado: 'Prestado' });
    console.log('Updated:', updated);
    if (updated.estado !== 'Prestado') throw new Error('Update failed');

    // 5. Delete
    console.log('Deleting Ejemplar...');
    await request('DELETE', `/ejemplar/${created.idEjemplar}`);

    // Cleanup prereqs
    console.log('Cleaning up Libro...');
    await request('DELETE', `/libro/${libro.codigoLibro}`);
    console.log('Cleaning up Autor...');
    await request('DELETE', `/autor/${autor.idAutor}`);
    console.log('Cleaning up Editorial...');
    await request('DELETE', `/editorial/${editorial.idEditorial}`);
    console.log('Cleaning up Area...');
    await request('DELETE', `/area/${area.idArea}`);
}

async function run() {
    try {
        await testAutor();
        await testEjemplar();
        console.log('\n✅ All tests passed!');
    } catch (error) {
        console.error('\n❌ Tests failed:', error);
        process.exit(1);
    }
}

run();
