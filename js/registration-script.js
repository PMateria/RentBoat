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
  
        console.log('Response:', response);
  
        if (!response.ok) {
          throw new Error('Errore nella registrazione');
        }
  
        const data = await response.json();
        console.log('Dati:', data);
  
        registrationMessage.textContent = 'Registrazione riuscita!';
        window.location.href = '../index.html'; // Reindirizzamento dopo la registrazione riuscita
  
      } catch (error) {
        console.error('Errore durante la registrazione:', error);
        registrationMessage.textContent = 'Errore nella registrazione. Riprova.';
      }
    });
  });
  