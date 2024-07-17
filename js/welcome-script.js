document.addEventListener('DOMContentLoaded', () => {
    const getUsersButton = document.querySelector('#get-users-button');
    const deleteUserButton = document.querySelector('#delete-user-button');
    const getUsersCard = document.getElementById('get-users-card');
    const deleteUserCard = document.getElementById('delete-user-card');

    const token = localStorage.getItem('jwtToken');
    if (!token) {
        console.error('Token JWT non trovato nel localStorage.');
        return;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const roles = payload.roles;

    if (roles.includes('ROLE_ADMIN')) {
        getUsersCard.style.display = 'block';
        deleteUserCard.style.display = 'block';
    } else {
        getUsersCard.style.display = 'none';
        deleteUserCard.style.display = 'none';
    }

    getUsersButton.addEventListener('click', getUsers);
    deleteUserButton.addEventListener('click', deleteUser);

    async function getUsers() {
        try {
            const response = await fetch('http://localhost:8080/api/utenti', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const users = await response.json();
                displayUsers(users);
            } else if (response.status === 401 || response.status === 403) {
                document.getElementById('error-message').style.display = 'block';
            } else {
                console.error('Errore durante il recupero degli utenti:', response.statusText);
            }
        } catch (error) {
            console.error('Errore durante il recupero degli utenti:', error);
        }
    }

    function displayUsers(users) {
        const userListElement = document.getElementById('user-list');
        userListElement.innerHTML = ''; // Pulisce la lista degli utenti prima di aggiungere gli elementi

        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = `${user.username} (${user.email})`;
            userListElement.appendChild(li);
        });
    }

    async function deleteUser() {
        const userId = document.getElementById('delete-user-id').value;

        if (!userId) {
            alert('Inserisci un ID utente');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const deleteMessage = document.getElementById('delete-message');
                deleteMessage.textContent = 'Utente eliminato con successo';
            } else if (response.status === 401 || response.status === 403) {
                document.getElementById('error-message').style.display = 'block';
            } else {
                const deleteMessage = document.getElementById('delete-message');
                deleteMessage.textContent = 'Eliminazione utente non riuscita';
            }
        } catch (error) {
            console.error('Errore durante l\'eliminazione dell\'utente:', error);
        }
    }
});
