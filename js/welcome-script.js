async function getUsers() {
    try {
        const response = await fetch('http://localhost:8080/api/utenti', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
        });

        if (!response.ok) {
            throw new Error('Errore nel recupero degli utenti');
        }

        const users = await response.json();
        const userList = document.getElementById('user-list');
        userList.innerHTML = '';

        users.forEach(user => {
            const listItem = document.createElement('li');
            listItem.textContent = `ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`;
            userList.appendChild(listItem);
        });

    } catch (error) {
        console.error('Errore durante il recupero degli utenti:', error);
    }
}

async function deleteUser() {
    const userId = document.getElementById('delete-user-id').value;

    if (!userId) {
        alert('Inserisci un ID utente valido');
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('Response:', response); // Log della risposta

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Errore nella risposta:', errorData); // Log dell'errore
            throw new Error('Errore nella cancellazione dell\'utente');
        }

        const data = await response.json();
        console.log('Dati:', data);

        document.getElementById('delete-message').textContent = 'Utente eliminato con successo';
    } catch (error) {
        console.error('Errore durante la cancellazione dell\'utente:', error);
        document.getElementById('delete-message').textContent = 'Errore nella cancellazione dell\'utente. Riprova.';
    }
}