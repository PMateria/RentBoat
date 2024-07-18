document.addEventListener('DOMContentLoaded', async () => {
  const leftNav = document.getElementById('left-nav');
  const rightNav = document.getElementById('right-nav');
  let payload = null; // Dichiarazione di payload fuori dal blocco try-catch

  const jwtToken = sessionStorage.getItem('jwtToken');
  if (jwtToken) {
      try {
          payload = JSON.parse(atob(jwtToken.split('.')[1])); // Assegna a payload
          const roles = payload.roles;

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
      try {
          const response = await fetch('http://localhost:8080/Reservation/allReservation', {
              headers: {
                  Authorization: `Bearer ${jwtToken}`
              }
          });
          if (!response.ok) {
              throw new Error('Errore nel recupero dei prestiti');
          }
          const data = await response.json();
          console.log('Prestiti effettuati:', data);
          // Eseguire qui la logica per visualizzare i prestiti nella UI
      } catch (error) {
          console.error('Errore durante il recupero dei prestiti:', error);
          // Gestione dell'errore: mostrare un messaggio all'utente
      }
  }

  function handleLogoutButtonClick() {
      // Rimuovi il token dalla sessionStorage
      sessionStorage.removeItem('jwtToken');
      // Reindirizza l'utente alla pagina di login
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
                  const jwtToken = sessionStorage.getItem('jwtToken');
                  if (!jwtToken) {
                      throw new Error('Token JWT non trovato in sessione');
                  }

                  const reservationDate = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD
                  const startDate = new Date().toISOString(); // Formato LocalDateTime
                  const endDate = new Date(new Date().setHours(new Date().getHours() + 2)).toISOString(); // Simulando 2 ore dopo

                  const response = await fetch('http://localhost:8080/Reservation/addReservation', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${jwtToken}`
                      },
                      body: JSON.stringify({
                          boatId: boat.id,
                          userId: payload.userId,
                          reservationDate: reservationDate,
                          startDate: startDate,
                          endDate: endDate
                      })
                  });

                  if (!response.ok) {
                      throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
                  }

                  alert('Barca aggiunta al carrello!');
                  // Reindirizza l'utente alla pagina cart.html
                  window.location.href = 'cart.html';
              } catch (error) {
                  console.error('Errore durante l\'aggiunta al carrello:', error);
                  // Gestione dell'errore: mostrare un messaggio all'utente in base all'errore specifico
                  if (error instanceof TypeError && error.message.includes('failed')) {
                      console.error('Fetch fallito:', error.message);
                  } else {
                      alert(`Errore durante l'aggiunta al carrello: ${error.message}`);
                  }
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
