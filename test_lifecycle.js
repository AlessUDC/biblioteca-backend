
const axios = require('axios');

async function testEstudianteLifecycle() {
    const baseUrl = 'http://localhost:3000/api/estudiante';
    let studentId;

    // 1. Create Estudiante
    try {
        console.log('1. Creating Estudiante...');
        const createRes = await axios.post(baseUrl, {
            dniEstudiante: '99999999',
            nombreEstudiante: 'Test',
            apellidoPaterno: 'User',
            apellidoMaterno: 'Delete',
            idEscuela: 1
        });
        studentId = createRes.data.idEstudiante;
        console.log('   Created ID:', studentId);
    } catch (e) {
        console.error('   Creation Failed:', e.response?.data || e.message);
        return;
    }

    // 2. Delete Estudiante (First Time)
    try {
        console.log(`2. Deleting Estudiante ${studentId}...`);
        const deleteRes = await axios.delete(`${baseUrl}/${studentId}`);
        if (deleteRes.data.activo === false) {
            console.log('   Success: Record marked as inactive.');
        } else {
            console.log('   Warning: Record returned but active status is:', deleteRes.data.activo);
        }
    } catch (e) {
        console.error('   Delete Failed:', e.response?.data || e.message);
    }

    // 3. Get Estudiante (Should be 404)
    try {
        console.log(`3. Getting Estudiante ${studentId} (Expect 404)...`);
        await axios.get(`${baseUrl}/${studentId}`);
        console.log('   Error: Record found (should be hidden).');
    } catch (e) {
        if (e.response?.status === 404) {
            console.log('   Success: Record not found (404).');
        } else {
            console.error('   Get Failed with unexpected status:', e.response?.status, e.message);
        }
    }

    // 4. Delete Estudiante Again (Should be 404)
    try {
        console.log(`4. Deleting Estudiante ${studentId} again (Expect 404)...`);
        await axios.delete(`${baseUrl}/${studentId}`);
        console.log('   Error: Delete succeeded on already deleted record.');
    } catch (e) {
        if (e.response?.status === 404) {
            console.log('   Success: Delete returned 404.');
        } else {
            console.error('   Delete Again Failed with unexpected status:', e.response?.status, e.message);
        }
    }
}

testEstudianteLifecycle();
