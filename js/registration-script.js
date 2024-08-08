document.addEventListener('DOMContentLoaded', function() {
  const registrationForm = document.getElementById('registration-form');
  const registrationMessage = document.getElementById('registration-message');

  registrationForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const iban = document.getElementById('iban').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;

    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, surname, username, password, iban, email, role }),
      });

      if (!response.ok) {
        throw new Error('Errore nella registrazione');
      }

      const data = await response.json();
      console.log('Dati ricevuti dal server:', data);

      if (data.id) {
        sessionStorage.setItem('userId', data.id);
        console.log('ID utente salvato nel sessionStorage:', data.id);
      } else {
        console.error('ID utente non trovato nei dati ricevuti');
      }

      registrationMessage.textContent = 'Registrazione riuscita!';
      showPopupMessage('Registrazione riuscita!', 'success');

      // Ritarda il reindirizzamento dopo 3 secondi
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 3000);

    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      registrationMessage.textContent = 'Errore nella registrazione. Riprova.';
      showPopupMessage('Errore nella registrazione. Riprova.', 'error');
    }
  });

  function showPopupMessage(message, type) {
    const popup = document.createElement('div');
    popup.className = `popup ${type}`;
    popup.textContent = message;

    document.body.appendChild(popup);

    // Rimuove il popup dopo 3 secondi
    setTimeout(() => {
      popup.remove();
    }, 3000);
  }
});
