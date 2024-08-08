    document.addEventListener('DOMContentLoaded', () => {
        const addBoatForm = document.getElementById('addBoatForm');
        const usersList = document.getElementById('users-list');
        const boatsList = document.getElementById('boats-list') || document.createElement('div'); // Fallback se l'elemento non esiste
        const jwtToken = sessionStorage.getItem('jwtToken');

        function decodeJwt(token) {
            try {
                return JSON.parse(atob(token.split('.')[1]));
            } catch (e) {
                console.error('Errore nella decodifica del token JWT:', e);
                return null;
            }
        }

        function isTokenExpired(decodedToken) {
            if (!decodedToken || !decodedToken.exp) return true;
            const currentTime = Math.floor(Date.now() / 1000);
            return decodedToken.exp < currentTime;
        }

        function loadLocalReservations() {
            const reservations = JSON.parse(localStorage.getItem('loanedBoats')) || [];
            console.log('Prenotazioni locali:', reservations); // Log per diagnosticare
            renderLocalReservations(reservations);
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
                    alert('Solo gli amministratori possono aggiungere barche.');
                    return;
                }

                console.log('Modulo inviato');
                const formData = new FormData(addBoatForm);
                const data = {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    places: Number(formData.get('places')),
                    price: parseFloat(formData.get('price')),
                    available: formData.get('available') === 'true'
                };

                console.log('Dati da inviare:', data);

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
                        console.log('Risposta di errore:', errorText);
                        throw new Error(`Impossibile aggiungere la barca: ${errorText}`);
                    }

                    console.log('Barca aggiunta con successo');
                    alert('Barca aggiunta con successo');

                    // Ricarica la lista delle barche
                    await loadBoats();
                } catch (error) {
                    console.error('Errore durante l\'aggiunta della barca:', error);
                    alert('Impossibile aggiungere la barca');
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
                    console.log('Risposta di errore:', errorText);
                    throw new Error('Errore nel recupero degli utenti');
                }

                const users = await response.json();
                renderUsers(users);
            } catch (error) {
                console.error('Errore durante il recupero degli utenti:', error);
            }
        }

        function renderLocalReservations(reservations) {
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
                const reservationCard = document.createElement('div');
                reservationCard.className = 'reservation-card';

                reservationCard.innerHTML = `
                <div class="reservation-card-content">
                    <h3>ID Barca: ${reservation.boatId}</h3>
                    <p>Nome: ${reservation.name}</p>
                    <p>Prezzo: ${reservation.price}</p>
                    <p>Nome Utente: ${reservation.userId}</p>
                    <p>Data di Ritiro: ${new Date(reservation.pickupDateTime).toLocaleString()}</p>
                    <p>Data di Restituzione: ${new Date(reservation.returnDateTime).toLocaleString()}</p>
                </div>
            `;

                reservationsList.appendChild(reservationCard);
            });
        }

        // Carica le prenotazioni locali all'avvio
        loadLocalReservations();

        // Carica le prenotazioni all'avvio e all'interno di loadReservations
        if (isAdmin()) {
            loadUsers();
            loadBoats(); // Carica anche le barche
            loadLocalReservations(); // Carica le prenotazioni dal localStorage
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

                // Verifica se l'elemento delete-message esiste
                const deleteMessage = document.getElementById('delete-message');
                const messageExists = deleteMessage !== null;

                if (response.ok) {
                    if (messageExists) {
                        deleteMessage.style.display = 'block';
                        deleteMessage.style.color = 'green';
                        deleteMessage.textContent = 'Utente eliminato con successo';
                    } else {
                        alert('Utente eliminato con successo');
                    }
                    await loadUsers(); // Ricarica la lista degli utenti dopo l'eliminazione
                } else if (response.status === 401 || response.status === 403) {
                    if (messageExists) {
                        deleteMessage.style.display = 'block';
                        deleteMessage.style.color = 'red';
                        deleteMessage.textContent = 'Non hai autorizzazione per eliminare questo utente';
                    } else {
                        alert('Non hai autorizzazione per eliminare questo utente');
                    }
                } else {
                    if (messageExists) {
                        deleteMessage.style.display = 'block';
                        deleteMessage.style.color = 'red';
                        deleteMessage.textContent = 'Eliminazione utente non riuscita';
                    } else {
                        alert('Eliminazione utente non riuscita');
                    }
                }

                // Nascondi il messaggio dopo 5 secondi se esiste
                if (messageExists) {
                    setTimeout(() => {
                        deleteMessage.style.display = 'none';
                    }, 5000);
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
                    console.log('Risposta di errore:', errorText);
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
                boatCard.className = `boat-card`;

                boatCard.innerHTML = `
                    <div class="boat-card-content">
                        <h3>Nome Barca: ${boat.name}</h3>
                        <p>Descrizione Barca: ${boat.description}</p>
                        <p>Posti: ${boat.places}</p>
                        <p>Prezzo: ${boat.price}</p>
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
                    alert('Non hai autorizzazione per eliminare questa barca');
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
                const response = localStorage.getItem('loanedBoats'); // Carica le prenotazioni locali

                if (!response) {
                    console.log('Nessuna prenotazione trovata.');
                    return [];
                }

                const reservations = JSON.parse(response);
                console.log('Prenotazioni ricevute:', reservations);
                renderReservations(reservations);
                renderMonthlyReservationsChart(reservations); // Aggiungi questa riga per il grafico
            } catch (error) {
                console.error('Errore durante il recupero delle prenotazioni:', error);
            }
        }

        console.log(reservations, "reservation grafico")

        function renderMonthlyReservationsChart(reservations) {
            const months = Array(12).fill(0); // Array per contare le prenotazioni per mese

            reservations.forEach(reservation => {
                const pickupDate = new Date(reservation.pickupDateTime);
                const month = pickupDate.getMonth(); // Ottiene il mese (da 0 a 11)
                months[month]++; // Incrementa il contatore per il mese
            });

            const ctx = document.getElementById('monthlyReservationsChart').getContext('2d');
            if (!ctx) {
                console.error('Contesto del canvas non trovato');
                return;
            }

            const chart = new Chart(ctx, {
                type: 'bar', // Tipo di grafico (puoi cambiarlo in base alle tue preferenze)
                data: {
                    labels: [
                        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
                    ],
                    datasets: [{
                        label: 'Prenotazioni Mensili',
                        data: months,
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
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
                const reservationCard = document.createElement('div');
                reservationCard.className = 'reservation-card';

                reservationCard.innerHTML = `
                <div class="reservation-card-content">
                    <h3>ID Prenotazione: ${reservation.id}</h3>
                    <p>Utente: ${reservation.name || 'N/A'}</p>
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
