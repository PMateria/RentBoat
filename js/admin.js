    document.addEventListener('DOMContentLoaded', () => {
        const addBoatForm = document.getElementById('addBoatForm');
        const usersList = document.getElementById('users-list');
        const boatsList = document.getElementById('boats-list') || document.createElement('div'); // Fallback se l'elemento non esiste
        const jwtToken = sessionStorage.getItem('jwtToken');

        function decodeJwt(token) {
            try {
                return JSON.parse(atob(token.split('.')[1]));
            } catch (e) {
                console.error('Errore nel decodificare il token JWT:', e);
                return null;
            }
        }

        function isTokenExpired(decodedToken) {
            if (!decodedToken || !decodedToken.exp) return true;
            const currentTime = Math.floor(Date.now() / 1000);
            return decodedToken.exp < currentTime;
        }

        const decodedToken = decodeJwt(jwtToken);
        console.log('Token decodificato:', decodedToken);
        console.log('Token scaduto:', isTokenExpired(decodedToken));
        console.log('Ruoli dell\'utente:', decodedToken ? decodedToken.roles : 'Nessun ruolo trovato');

        const isAdmin = () => {
            if (!decodedToken || !decodedToken.roles) {
                console.log('Token decodificato mancante o senza ruoli');
                return false;
            }
            return decodedToken.roles.includes('ROLE_ADMIN');
        };

        console.log('L\'utente è admin?', isAdmin());

        // Mostra/nascondi elementi in base al ruolo
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = isAdmin() ? 'block' : 'none';
        });

        // Gestire l'invio del modulo per aggiungere una barca
        if (addBoatForm) {
            addBoatForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                if (!isAdmin()) {
                    alert('Only administrators can add boats.');
                    return;
                }

                console.log('Form Submitted');
                const formData = new FormData(addBoatForm);
                const data = {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    places: Number(formData.get('places')),
                    price: parseFloat(formData.get('price')),
                    available: formData.get('available') === 'true'
                };

                console.log('Data to be sent:', data);

                try {
                    const response = await fetch('http://localhost:8080/barche/addBoats', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${jwtToken}`
                        },
                        body: JSON.stringify(data)
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.log('Error response:', errorText);
                        throw new Error(`Failed to add boat: ${errorText}`);
                    }

                    console.log('Boat added successfully');
                    alert('Boat added successfully');

                    // Ricarica la lista delle barche
                    await loadBoats();
                } catch (error) {
                    console.error('Error adding boat:', error);
                    alert('Failed to add boat');
                }
            });
        }

        // Carica la lista degli utenti all'avvio solo se l'utente è un admin
        if (isAdmin()) {
            loadUsers();
            loadBoats(); // Aggiungiamo anche il caricamento delle barche
            loadReservations();
        }

        // Funzione per caricare gli utenti
        async function loadUsers() {
            try {
                const response = await fetch('http://localhost:8080/api/utenti', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.log('Error response text:', errorText);
                    throw new Error('Errore nel recupero degli utenti');
                }

                const users = await response.json();
                renderUsers(users);
            } catch (error) {
                console.error('Errore durante il recupero degli utenti:', error);
            }
        }

        // Funzione per rendere visibili gli utenti
        function renderUsers(users) {
            if (!usersList) {
                console.error('Elemento users-list non trovato');
                return;
            }
            usersList.innerHTML = '';

            users.forEach(user => {
                console.log('Rendering user:', user);

                const userCard = document.createElement('div');
                userCard.className = 'user-card';

                const userName = user.username || 'Nome non disponibile';
                const userEmail = user.email || 'Email non disponibile';

                userCard.innerHTML = `
                    <div class="user-card-content">
                        <h3>${userName}</h3>
                        <p>${userEmail}</p>
                        <button class="delete-button" data-id="${user.id}">Elimina Utente</button>
                    </div>
                `;
                usersList.appendChild(userCard);
            });

            // Aggiungi event listeners ai pulsanti di eliminazione
            document.querySelectorAll('.delete-button').forEach(button => {
                button.addEventListener('click', async () => {
                    const userId = button.getAttribute('data-id');
                    await deleteUser(userId);
                });
            });
        }

        // Funzione per eliminare un utente
        async function deleteUser(userId) {
            if (!userId) {
                alert('Inserisci un ID utente');
                return;
            }
            
            try {
                const response = await fetch(`http://localhost:8080/api/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const deleteMessage = document.getElementById('delete-message');
                    if (deleteMessage) {
                        deleteMessage.textContent = 'Utente eliminato con successo';
                    }
                    await loadUsers(); // Ricarica la lista degli utenti dopo l'eliminazione
                } else if (response.status === 401 || response.status === 403) {
                    const errorMessage = document.getElementById('error-message');
                    if (errorMessage) {
                        errorMessage.style.display = 'block';
                    }
                } else {
                    const deleteMessage = document.getElementById('delete-message');
                    if (deleteMessage) {
                        deleteMessage.textContent = 'Eliminazione utente non riuscita';
                    }
                }
            } catch (error) {
                console.error('Errore durante l\'eliminazione dell\'utente:', error);
            }
        }

        // Funzione per caricare le barche
        async function loadBoats() {
            try {
                const response = await fetch('http://localhost:8080/barche/allBoats', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.log('Error response text:', errorText);
                    throw new Error('Errore nel recupero delle barche');
                }

                const boats = await response.json();
                renderBoats(boats);
            } catch (error) {
                console.error('Errore durante il recupero delle barche:', error);
            }
        }

        // Funzione per rendere visibili le barche
        function renderBoats(boats) {
            if (!boatsList) {
                console.error('Elemento boats-list non trovato');
                return;
            }
            boatsList.innerHTML = '';

            boats.forEach(boat => {
                console.log('Rendering boat:', boat);

                const boatCard = document.createElement('div');
                boatCard.className = 'boat-card';

                boatCard.innerHTML = `
                    <div class="boat-card-content">
                        <h3>Nome Barca: ${boat.name}</h3>
                        <p>Descrizione Barca: ${boat.description}</p>
                        <p>Posti: ${boat.places}</p>
                        <p>Prezzo: ${boat.price}</p>
                        <p>Disponibile: ${boat.available ? 'Sì' : 'No'}</p>
                        <button class="delete-boat-button" data-id="${boat.id}">Elimina Barca</button>
                    </div>
                `;
                boatsList.appendChild(boatCard);
            });

            // Aggiungi event listeners ai pulsanti di eliminazione delle barche
            document.querySelectorAll('.delete-boat-button').forEach(button => {
                button.addEventListener('click', async () => {
                    const boatId = button.getAttribute('data-id');
                    await deleteBoat(boatId);
                });
            });
        }

        // Funzione per eliminare una barca
        async function deleteBoat(boatId) {
            if (!boatId) {
                alert('Inserisci un ID barca');
                return;
            }

            try {
                const response = await fetch(`http://localhost:8080/barche/boats/${boatId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`,
                    }
                });

                if (response.ok) {
                    alert('Barca eliminata con successo');
                    await loadBoats(); // Ricarica la lista delle barche dopo l'eliminazione
                } else if (response.status === 401 || response.status === 403) {
                    console.log("boatId", boatId)
                    alert('Barca associata all utente', boatId);
                } else {
                    alert('Eliminazione della barca non riuscita');
                }
            } catch (error) {
                console.error('Errore durante l\'eliminazione della barca:', error);
            }
        }
        // Funzione per caricare le prenotazioni
        async function loadReservations() {
            try {
                const response = await fetch('http://localhost:8080/Reservation/allReservation', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`
                    }
                });
        
                if (!response.ok) {
                    const errorText = await response.text();
                    console.log('Error response text:', errorText);
                    throw new Error('Errore nel recupero delle prenotazioni');
                }
        
                const reservations = await response.json();
                console.log('Prenotazioni ricevute:', reservations); // Stampa i dati delle prenotazioni
                renderReservations(reservations);
            } catch (error) {
                console.error('Errore durante il recupero delle prenotazioni:', error);
            }
        }

    // Funzione per rendere visibili le prenotazioni
    function renderReservations(reservations) {
        const reservationsList = document.getElementById('reservations-list');
        if (!reservationsList) {
            console.error('Elemento reservations-list non trovato');
            return;
        }
        reservationsList.innerHTML = '';

        if (!Array.isArray(reservations) || reservations.length === 0) {
            reservationsList.innerHTML = '<p>Nessuna prenotazione disponibile.</p>';
            return;
        }

        reservations.forEach(reservation => {
            console.log('Rendering reservation user:', reservation.user); // Stampa i dati della prenotazione

            const reservationCard = document.createElement('div');
            reservationCard.className = 'reservation-card';

            reservationCard.innerHTML = `
                <div class="reservation-card-content">
                    <h3>ID Prenotazione: ${reservation.id}</h3>
                    <p>Utente: ${reservation.user.name}</p>
                    <button class="delete-reservation-button" data-id="${reservation.id}">Elimina Prenotazione</button>
                </div>
            `;

            reservationsList.appendChild(reservationCard);
        });

        // Aggiungi event listeners ai pulsanti di eliminazione delle prenotazioni
        document.querySelectorAll('.delete-reservation-button').forEach(button => {
            button.addEventListener('click', async () => {
                const reservationId = button.getAttribute('data-id');
                await deleteReservation(reservationId);
            });
        });
    }

    // Funzione per eliminare una prenotazione
    async function deleteReservation(reservationId) {
        if (!reservationId) {
            alert('Inserisci un ID prenotazione');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/Reservation/delete/${reservationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                }
            });

            if (response.ok) {
                alert('Prenotazione eliminata con successo');
                await loadReservations(); // Ricarica la lista delle prenotazioni dopo l'eliminazione
            } else if (response.status === 401 || response.status === 403) {
                alert('Non hai autorizzazione per eliminare questa prenotazione');
            } else {
                alert('Eliminazione della prenotazione non riuscita');
            }
        } catch (error) {
            console.error('Errore durante l\'eliminazione della prenotazione:', error);
        }
    }

    });
