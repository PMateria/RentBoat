document.addEventListener('DOMContentLoaded', async () => {
  const leftNav = document.getElementById('left-nav');
  const rightNav = document.getElementById('right-nav');

  let userId = null; // Dichiarata come variabile let
  let jwtToken = sessionStorage.getItem('jwtToken');

  if (jwtToken) {
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      console.log('Payload:', payload);
      
      userId = payload.sub; // Estrai l'ID utente dal campo 'sub'
      console.log('User ID:', userId);

      const roles = payload.roles;

      if (window.location.pathname.includes('html/cart.html')) {
        await fetchReservations();
      } else {
        // Altrimenti, carichiamo le barche (se siamo nella pagina principale)
        await loadBoats();
      }

      // Mostra il link del carrello nel leftNav
      const cartLink = document.createElement('li');
      cartLink.innerHTML = '<a href="cart.html" id="cart-link">Carrello</a>';
      leftNav.appendChild(cartLink);

      // Gestione del click sul link del carrello
      const cartButton = document.getElementById('cart-link');
      cartButton.addEventListener('click', handleCartButtonClick);

      // Mostra il link di logout nel rightNav
      const logoutLink = document.createElement('li');
      logoutLink.innerHTML = '<a href="#" id="logout-link">Logout</a>';
      rightNav.appendChild(logoutLink);

      // Gestione del click sul link di logout
      const logoutButton = document.getElementById('logout-link');
      logoutButton.addEventListener('click', handleLogoutButtonClick);

      if (roles && roles.includes('ROLE_ADMIN')) {
        // Se l'utente è admin, mostra il link admin nel rightNav
        const adminLink = document.createElement('li');
        adminLink.innerHTML = '<a href="#admin">ADMIN</a>';
        rightNav.appendChild(adminLink);
      }
    } catch (error) {
      console.error('Errore nel parsing del token JWT:', error);
    }
  } else {
    // Mostra i link di login e registrazione se l'utente non è autenticato
    appendLoginAndRegistrationLinks();
  }

  // Funzione per caricare e visualizzare la lista delle barche
  await loadBoats();

  function handleCartButtonClick() {
    fetchReservations();
  }
  
  async function fetchReservations() {
    selectedBoatId= boat.id;
    try {
      console.log("selectedBoatId", selectedBoatId)
      if (!selectedBoatId) {
        console.error('Boat ID non disponibile');
        return;
      }
  
      const response = await fetch(`http://localhost:8080/Reservation/byBoatId/${selectedBoatId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log('Prenotazioni effettuate:', data);
  
      // Verifica se data è un array e contiene elementi
      if (Array.isArray(data) && data.length > 0) {
        // Accedi ai dati della prima prenotazione (se ce ne sono più di una)
        data.forEach(reservation => {
          console.log("Boat ID:", reservation.boat.id);
          console.log("User ID:", reservation.user.id);
        });
      } else if (data.boat && data.user) {
        // Se data non è un array ma contiene direttamente i dati della prenotazione
        console.log("Boat ID:", data.boat.id);
        console.log("User ID:", data.user.id);
      } else {
        console.log("Struttura dati non riconosciuta:", data);
      }
  
      renderReservations(data);
    } catch (error) {
      console.error('Errore durante il recupero delle prenotazioni:', error);
    }
  }
  

  function renderReservations(reservations) {
    const reservationList = document.getElementById('reservations-list');

    if (!reservationList) {
      console.error('Elemento con ID "reservations-list" non trovato');
      return;
    }
    reservationList.innerHTML = '';

    const reservationsArray = Array.isArray(reservations) ? reservations : [reservations];

    reservationsArray.forEach(reservation => {
      const reservationCard = document.createElement('div');
      reservationCard.className = 'reservation-card';

      const reservationImage = document.createElement('img');
      reservationImage.src = reservation.boat.imageURL || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpuyB602xvUBarJybSdC-bgjJ7HxePDpI9Ww&s';
      reservationImage.alt = reservation.boat.name;
      reservationImage.className = 'reservation-image';

      const reservationDetails = document.createElement('div');
      reservationDetails.className = 'reservation-details';

      const reservationInfo = document.createElement('p');
      reservationInfo.textContent = `Barca: ${reservation.boat.name}, Data prenotazione: ${reservation.reservationDate}, Inizio: ${reservation.startDate}, Fine: ${reservation.endDate}`;

      reservationDetails.appendChild(reservationInfo);
      reservationCard.appendChild(reservationImage);
      reservationCard.appendChild(reservationDetails);

      reservationList.appendChild(reservationCard);
    });
  }

  function handleLogoutButtonClick() {
    sessionStorage.removeItem('jwtToken');
    window.location.href = 'index.html';
  }

  function appendLoginAndRegistrationLinks() {
    const loginLink = document.createElement('li');
    loginLink.innerHTML = '<a href="html/login.html">Login</a>';
    leftNav.appendChild(loginLink);

    const registrationLink = document.createElement('li');
    registrationLink.innerHTML = '<a href="html/registration.html">Registrazione</a>';
    leftNav.appendChild(registrationLink);
  }

  // Funzione per caricare e visualizzare la lista delle barche
  async function loadBoats() {
    try {
      const response = await fetch('http://localhost:8080/barche/allBoats');
      if (!response.ok) {
        throw new Error('Errore nel recupero delle barche');
      }
      const data = await response.json();
      renderBoats(data);
    } catch (error) {
      console.error('Errore durante il recupero delle barche:', error);
      // Gestione dell'errore: mostrare un messaggio all'utente
    }
  }

  // Funzione per renderizzare le barche nella pagina
  function renderBoats(data) {
      const boatsList = document.getElementById('boats-list');

    if (!boatsList) {
      console.error('Elemento con ID "boats-list" non trovato');
      return; // Esci dalla funzione se l'elemento non esiste
    }

    boatsList.innerHTML = ''; // Pulisce il contenuto precedente

    data.forEach(boat => {
      const boatCard = document.createElement('div');
      boatCard.className = 'boat-card';

        const boatImage = document.createElement('img');
        boatImage.src = boat.imageURL || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpuyB602xvUBarJybSdC-bgjJ7HxePDpI9Ww&s';
        boatImage.alt = boat.name;
        boatImage.className = 'boat-image';

        const boatDetails = document.createElement('div');
        boatDetails.className = 'boat-details';

        const boatName = document.createElement('h2');
        boatName.textContent = boat.name;

        const boatDescription = document.createElement('p');
        boatDescription.textContent = boat.description;

        const boatPrice = document.createElement('p');
        boatPrice.className = 'boat-price';
        boatPrice.textContent = `Price: ${boat.price} EUR`;

        const flags = document.createElement('div');
        flags.className = 'flags';

        const redFlag = document.createElement('button');
        redFlag.className = 'flag green-flag';
        redFlag.textContent = 'Affitta';

        const greenFlag = document.createElement('button');
        greenFlag.className = 'flag green-flag';
        greenFlag.textContent = 'Aggiungi al carrello';
  
        greenFlag.addEventListener('click', async () => {
          try {
            if (!jwtToken) {
              throw new Error('Token JWT non trovato in sessione');
            }
  
            const reservationDate = new Date().toISOString().slice(0, 10);
            const startDate = new Date().toISOString();
            const endDate = new Date(new Date().setHours(new Date().getHours() + 2)).toISOString();
  
            const requestBody = {
              boatId: boat.id,
              userId: userId,
              reservationDate: reservationDate,
              startDate: startDate,
              endDate: endDate
            };
            console.log('Request body:', requestBody);
            console.log("boatId: " + boat.id);
  
            const response = await fetch('http://localhost:8080/Reservation/addReservation', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`
              },
              body: JSON.stringify(requestBody)
            });
  
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}\n${JSON.stringify(errorData)}`);
            }
  
            alert('Barca aggiunta al carrello!');
            window.location.href = 'html/cart.html';
          } catch (error) {
            console.error('Errore durante l\'aggiunta al carrello:', error);
            alert(`Errore durante l'aggiunta al carrello: ${error.message}`);
          }
        });

        flags.appendChild(redFlag);
        flags.appendChild(greenFlag);

        boatDetails.appendChild(boatName);
        boatDetails.appendChild(boatDescription);
        boatDetails.appendChild(boatPrice);
        boatDetails.appendChild(flags);

        boatCard.appendChild(boatImage);
        boatCard.appendChild(boatDetails);

        boatsList.appendChild(boatCard);
    });
}
});
