const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

loginForm.addEventListener('submit', async function(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:8080/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Errore nel login');
    }

    const token = await response.text();

    if (token.startsWith('eyJ')) {
      loginMessage.textContent = 'Login riuscito!';
      localStorage.setItem('jwtToken', token);
      window.location.href = 'html/welcome.html'; // Reindirizzamento dopo il login
    } else {
      throw new Error('Token JWT non valido');
    }

  } catch (error) {
    console.error('Errore durante il login:', error);
    loginMessage.textContent = 'Credenziali non valide. Riprova.';
  }
});
