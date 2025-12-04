const axios = require('axios');

async function testFacets() {
    try {
        const response = await axios.get('http://localhost:4001/search/facets?q=bluetooth');
        console.log('Success:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        }
    }
}

testFacets();
