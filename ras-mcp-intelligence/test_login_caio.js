import axios from 'axios';

async function testLoginCaio() {
  try {
    const response = await axios.post("https://aplicativo.rastremix.com.br/auth/login", {
      email: 'contato@caiocutrimdesigner.com.br',
      password: 'Caio018@'
    });
    console.log('LOGIN SUCCESS! STATUS:', response.status);
    console.log('USER:', response.data.user?.name || response.data.name);
  } catch (error) {
    console.error('LOGIN FAILED:', error.response?.status, error.response?.data || error.message);
  }
}

testLoginCaio();
