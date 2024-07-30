document.addEventListener('DOMContentLoaded', async () => {
  const leftNav = document.getElementById('left-nav');
  const rightNav = document.getElementById('right-nav');

  let jwtToken = sessionStorage.getItem('jwtToken');
  let selectedBoatId = sessionStorage.getItem('selectedBoatId'); // Retrieve selectedBoatId from sessionStorage
  let userId= sessionStorage.getItem('userId')

  console.log("userId", userId)
  if (jwtToken) {
      try {
          const payload = JSON.parse(atob(jwtToken.split('.')[1]));
          console.log('Payload:', payload);
          
          userId = payload.sub;
          console.log('User ID:', userId);

          const roles = payload.roles;

          if (window.location.pathname.includes('html/cart.html')) {
              if (jwtToken) {
                  await fetchReservations(); // Carica le prenotazioni se l'utente è loggato
              } else {
                  console.error('Token JWT non trovato');
              }
          } else {
              await loadBoats();
          }



          // Aggiungi pulsante Carrello
          const cartLink = document.createElement('li');
          cartLink.innerHTML = '<a href="/html/cart.html" id="cart-link">Carrello</a>'; // Use absolute path
          leftNav.appendChild(cartLink);

          const cartButton = document.getElementById('cart-link');
          cartButton.addEventListener('click', handleCartButtonClick);

          // Aggiungi pulsante Logout
          const logoutLink = document.createElement('li');
          logoutLink.innerHTML = '<a href="#" id="logout-link">Logout</a>';
          rightNav.appendChild(logoutLink);

          const logoutButton = document.getElementById('logout-link');
          logoutButton.addEventListener('click', handleLogoutButtonClick);

          
          // Aggiungi pulsante Admin se l'utente ha il ruolo di amministratore
          if (roles && roles.includes('ROLE_ADMIN')) {
              const adminLink = document.createElement('li');
              adminLink.innerHTML = '<a href="/html/admin.html">ADMIN</a>';
              rightNav.appendChild(adminLink);
          }
      } catch (error) {
          console.error('Errore nel parsing del token JWT:', error);
      }
  } else {
      appendLoginAndRegistrationLinks();
  }

  // Call loadBoats function to populate boat list if not on the cart page
  if (!window.location.pathname.includes('html/cart.html')) {
      await loadBoats();
  }

  function handleCartButtonClick(event) {
      event.preventDefault(); // Prevent default link behavior
      window.location.href = '/html/cart.html'; // Redirect to cart page
  }

  async function addToCart() {
    try {
        console.log('Current Boat ID from sessionStorage:', selectedBoatId);

        if (!selectedBoatId) {
            console.error('Boat ID non disponibile');
            return;
        }

        if (!jwtToken) {
            throw new Error('Token JWT non trovato in sessione');
        }

        console.log('Adding to cart with Boat ID:', selectedBoatId);

        const reservationDate = new Date().toISOString().slice(0, 10);
        const startDate = new Date().toISOString();
        const endDate = new Date(new Date().setHours(new Date().getHours() + 2)).toISOString();

        const requestBody = {
            boatId: selectedBoatId,
            userId: sessionStorage.getItem('userId'),
            reservationDate: reservationDate,
            startDate: startDate,
            endDate: endDate
        };

        console.log("requestBody.userId", userId);

        const response = await fetch('http://localhost:8080/Reservation/addReservation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(requestBody)
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error text:', errorText);
            if (response.status === 403 || response.status === 409) {
                // Assuming 409 Conflict is used for boat already booked
                alert('La barca è già prenotata per il periodo richiesto. Dovrà prima essere cancellata dall Amministratore');
            } else {
                throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}\n${errorText}`);
            }
            return;
        }

        const responseData = await response.json();
        console.log('Server response:', responseData);

        sessionStorage.setItem('selectedBoatId', selectedBoatId);

        console.log('Barca aggiunta al carrello!');
        alert('Barca aggiunta al carrello!');
        window.location.href = '/html/cart.html';
    } catch (error) {
        console.error('Errore dettagliato durante l\'aggiunta al carrello:', error);
        alert(`Errore durante l'aggiunta al carrello: ${error.message}`);
    }
}
  
  async function fetchReservations() {
    const userId= sessionStorage.getItem('userId')
      try {
          if (!userId) {
              console.error('Boat ID non disponibile');
              return;
          }
          console.log("userId",userId)
          const response = await fetch(`http://localhost:8080/Reservation/byUserId/${userId}`, {
              headers: {
                  Authorization: `Bearer ${jwtToken}`
              }
          });

          if (!response.ok) {
              throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
          }

          const data = await response.json();
          console.log('Prenotazioni effettuate:', data);

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
      sessionStorage.removeItem('selectedBoatId');
      window.location.href = '/index.html'; // Assicurati che il percorso sia corretto
  }

  function appendLoginAndRegistrationLinks() {
      const loginLink = document.createElement('li');
      loginLink.innerHTML = '<a href="/html/login.html">Login</a>'; // Use absolute path
      leftNav.appendChild(loginLink);

      const registrationLink = document.createElement('li');
      registrationLink.innerHTML = '<a href="/html/registration.html">Registrazione</a>'; // Use absolute path
      leftNav.appendChild(registrationLink);
  }

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
      }
  }

  function renderBoats(data) {
      const boatsList = document.getElementById('boats-list');

      if (!boatsList) {
          console.error('Elemento con ID "boats-list" non trovato');
          return;
      }

      boatsList.innerHTML = '';

      data.forEach(boat => {
          const boatCard = document.createElement('div');
          boatCard.className = 'boat-card';

          const boatImage = document.createElement('img');
          const imageUrl = boat.imageURL || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpuyB602xvUBarJybSdC-bgjJ7HxePDpI9Ww&s';
          
          boatImage.src = imageUrl;
          boatImage.alt = boat.name;
          boatImage.className = 'boat-image';

          // Aggiungi log per il debugging
          console.log('Rendering boat image:', imageUrl);

          boatImage.onerror = () => {
              console.error('Impossibile caricare l\'immagine:', imageUrl);
              boatImage.src = 'https://via.placeholder.com/150'; // URL di fallback per errori di caricamento
          };

          boatImage.onload = () => {
              console.log('Immagine caricata con successo:', imageUrl);
          };

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

          // Logica per la pagina admin
          if (window.location.pathname.includes('html/admin.html')) {
              const deleteButton = document.createElement('button');
              deleteButton.className = 'delete-boat-button';
              deleteButton.textContent = 'Elimina Barca';
              deleteButton.setAttribute('data-id', boat.id);
              deleteButton.addEventListener('click', async () => {
                  await deleteBoat(boat.id);
              });
              flags.appendChild(deleteButton);
          } else {
              const rentButton = document.createElement('button');
              rentButton.className = 'flag green-flag';
              rentButton.textContent = 'Affitta';

              const addToCartButton = document.createElement('button');
              addToCartButton.className = 'flag green-flag';
              addToCartButton.textContent = 'Aggiungi al carrello';

              addToCartButton.addEventListener('click', async () => {
                  try {
                      sessionStorage.setItem('selectedBoatId', boat.id);
                      selectedBoatId = boat.id;
                      await addToCart();
                  } catch (error) {
                      console.error('Errore durante l\'aggiunta al carrello:', error);
                      alert(`Errore durante l'aggiunta al carrello: ${error.message}`);
                  }
              });

              flags.appendChild(rentButton);
              flags.appendChild(addToCartButton);
          }

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
