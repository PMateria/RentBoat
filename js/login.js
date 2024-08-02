const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const popupMessage = document.getElementById('popup-message');
const popup = document.getElementById('popup');

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
            throw new Error('Credenziali non valide. Riprova.');
        }

        const data = await response.json();
        
        if (data.token && data.token.startsWith('eyJ')) {
            loginMessage.textContent = 'Login riuscito!';
            loginMessage.style.color = 'green'; // Imposta il colore a verde
            sessionStorage.setItem('jwtToken', data.token);
            sessionStorage.setItem('userId', data.userId);

            setTimeout(() => {
                window.location.href = '../index.html';
            }, 3000);
        } else {
            throw new Error('Token JWT non valido');
        }

    } catch (error) {
        console.error('Errore durante il login:', error);
        loginMessage.textContent = 'Credenziali non valide. Riprova.';
        loginMessage.style.color = 'red'; // Imposta il colore a rosso in caso di errore
    }
});
