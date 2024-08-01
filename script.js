document.addEventListener('DOMContentLoaded', async () => {
  const leftNav = document.getElementById('left-nav');
  const rightNav = document.getElementById('right-nav');
  const boatsList = document.getElementById('boats-list');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const checkoutButton = document.getElementById('checkout-button');
  
  let jwtToken = sessionStorage.getItem('jwtToken');
  let userId = sessionStorage.getItem('userId');
  
  if (jwtToken) {
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      userId = payload.sub;
      const roles = payload.roles;
      
      // Add Home link (except on index.html)
      if (!window.location.pathname.endsWith('index.html')) {
        const homeLink = document.createElement('li');
        homeLink.innerHTML = '<a href="/index.html">Home</a>';
        leftNav.appendChild(homeLink);
      }
      
      // Add Cart link
      const cartLink = document.createElement('li');
      cartLink.innerHTML = '<a href="/html/cart.html">Carrello</a>';
      leftNav.appendChild(cartLink);
      
      // Add Summary link
      const summaryLink = document.createElement('li');
      summaryLink.innerHTML = '<a href="/html/summary.html">Riepilogo</a>';
      leftNav.appendChild(summaryLink);
      
      // Add Logout link
      const logoutLink = document.createElement('li');
      logoutLink.innerHTML = '<a href="#" id="logout-link">Logout</a>';
      rightNav.appendChild(logoutLink);
      
      const logoutButton = document.getElementById('logout-link');
      logoutButton.addEventListener('click', handleLogoutButtonClick);
      
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
  
  if (window.location.pathname.includes('html/cart.html')) {
    fetchCartItems();
  } else if (!window.location.pathname.includes('html/summary.html')) {
    await loadBoats();
  }
  
  addHomeButton();
  
  function handleCartButtonClick(event) {
    event.preventDefault();
    window.location.href = '/html/cart.html';
  }
  
 async function addToCart(boatId) {
    try {
      console.log(`Tentativo di aggiungere la barca con ID: ${boatId}`);
      debugLocalStorage();

      if (!boatId) {
        console.error('Boat ID non disponibile');
        return;
      }
      
      if (!isBoatAvailable(boatId)) {
        alert('Questa barca non è attualmente disponibile per il noleggio.');
        return;
      }

      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingBoat = cart.find(item => item.boatId === boatId);

      if (existingBoat) {
        alert('Questa barca è già nel carrello.');
        return;
      }

      const boatCard = document.querySelector(`.boat-card[data-id="${boatId}"]`);
      if (!boatCard) {
        throw new Error('Boat card not found');
      }

      // Mostra il form per la selezione delle date
      showDateSelectionForm(boatId);
    } catch (error) {
      console.error('Errore durante l\'aggiunta al carrello:', error);
      alert(`Errore durante l'aggiunta al carrello: ${error.message}`);
    }
  }

  function isBoatAvailable(boatId) {
    const loanedBoats = JSON.parse(localStorage.getItem('loanedBoats')) || [];
    const now = new Date();

    // Controlla se la barca è già in prestito e se la data di consegna non è ancora passata
    const isBoatLoaned = loanedBoats.some(boat => {
      return boat.boatId === boatId && new Date(boat.returnDateTime) > now;
    });

    return !isBoatLoaned;
  }
 
  function showDateSelectionForm(boatId) {
    const dateForm = document.createElement('div');
    dateForm.className = 'date-selection-form';
    dateForm.innerHTML = `
      <h3>Seleziona le date e gli orari per il noleggio</h3>
      <div class="form-group">
        <label for="pickup-date-${boatId}">Data di ritiro:</label>
        <input type="date" id="pickup-date-${boatId}" required>
      </div>
      <div class="form-group">
        <label for="pickup-time-${boatId}">Orario di ritiro:</label>
        <input type="time" id="pickup-time-${boatId}" required>
      </div>
      <div class="form-group">
        <label for="return-date-${boatId}">Data di consegna:</label>
        <input type="date" id="return-date-${boatId}" required>
      </div>
      <div class="form-group">
        <label for="return-time-${boatId}">Orario di consegna:</label>
        <input type="time" id="return-time-${boatId}" required>
      </div>
      <button id="confirm-dates-${boatId}" class="confirm-button">Conferma</button>
    `;
  
    const boatCard = document.querySelector(`.boat-card[data-id="${boatId}"]`);
    boatCard.appendChild(dateForm);
  
    // Imposta la data minima per il ritiro a oggi
    const today = new Date().toISOString().split('T')[0];
    document.getElementById(`pickup-date-${boatId}`).min = today;
    document.getElementById(`return-date-${boatId}`).min = today;

    document.getElementById(`confirm-dates-${boatId}`).addEventListener('click', () => {
      const pickupDate = document.getElementById(`pickup-date-${boatId}`).value;
      const pickupTime = document.getElementById(`pickup-time-${boatId}`).value;
      const returnDate = document.getElementById(`return-date-${boatId}`).value;
      const returnTime = document.getElementById(`return-time-${boatId}`).value;
      
      if (pickupDate && pickupTime && returnDate && returnTime) {
        if (validateDatesAndTimes(pickupDate, pickupTime, returnDate, returnTime)) {
          if (isBoatAvailableForDates(boatId, pickupDate, pickupTime, returnDate, returnTime)) {
            addToCartWithDates(boatId, pickupDate, pickupTime, returnDate, returnTime);
            dateForm.remove();
          } else {
            alert('La barca non è disponibile per le date selezionate.');
          }
        }
      } else {
        alert('Per favore, seleziona tutte le date e gli orari.');
      }
    });
  }

  function isBoatAvailableForDates(boatId, pickupDate, pickupTime, returnDate, returnTime) {
    const loanedBoats = JSON.parse(localStorage.getItem('loanedBoats')) || [];
    const requestedPickup = new Date(`${pickupDate}T${pickupTime}`);
    const requestedReturn = new Date(`${returnDate}T${returnTime}`);

    // Controlla se c'è una sovrapposizione con le prenotazioni esistenti
    const isOverlapping = loanedBoats.some(boat => {
      if (boat.boatId !== boatId) return false;

      const existingPickup = new Date(boat.pickupDateTime);
      const existingReturn = new Date(boat.returnDateTime);

      return (requestedPickup < existingReturn && requestedReturn > existingPickup);
    });

    return !isOverlapping;
  }



  function validateDatesAndTimes(pickupDate, pickupTime, returnDate, returnTime) {
    const now = new Date();
    const pickup = new Date(`${pickupDate}T${pickupTime}`);
    const return_ = new Date(`${returnDate}T${returnTime}`);

    if (pickup < now) {
      alert('La data e l\'ora di ritiro non possono essere nel passato.');
      return false;
    }

    if (return_ <= pickup) {
      alert('La data e l\'ora di consegna devono essere successive a quelle di ritiro.');
      return false;
    }

    return true;
  }
 
  function addToCartWithDates(boatId, pickupDate, pickupTime, returnDate, returnTime) {
    const boatCard = document.querySelector(`.boat-card[data-id="${boatId}"]`);
    const boatDetails = {
      boatId: boatId,
      name: boatCard.querySelector('.boat-details h2').textContent,
      price: boatCard.querySelector('.boat-price').textContent,
      imageURL: boatCard.querySelector('.boat-image').src,
      pickupDateTime: new Date(`${pickupDate}T${pickupTime}`).toISOString(),
      returnDateTime: new Date(`${returnDate}T${returnTime}`).toISOString()
    };

    const priceMatch = boatDetails.price.match(/(\d+(\.\d+)?)/);
    if (priceMatch) {
      boatDetails.numericPrice = parseFloat(priceMatch[0]);
    } else {
      console.error('Impossibile estrarre il prezzo numerico');
      boatDetails.numericPrice = 0;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(boatDetails);
    localStorage.setItem('cart', JSON.stringify(cart));

    alert('Barca aggiunta al carrello!');
  }

     const priceMatch = boatDetails.price.match(/(\d+(\.\d+)?)/);
    if (priceMatch) {
      boatDetails.numericPrice = parseFloat(priceMatch[0]);
    } else {
      console.error('Impossibile estrarre il prezzo numerico');
      boatDetails.numericPrice = 0;
    }

  async function handlePurchase(boatId) {
    try {
        // Check if the boat is already loaned
        const loanedBoats = JSON.parse(localStorage.getItem('loanedBoats')) || [];
        const isBoatLoaned = loanedBoats.some(boat => boat.boatId === boatId);

        if (isBoatLoaned) {
            alert('Questa barca è già stata presa in prestito e non è disponibile per l\'acquisto.');
            return;
        }
        showDateSelectionForm(boatId);

        const boatCard = document.querySelector(`.boat-card[data-id="${boatId}"]`);
        if (!boatCard) {
            throw new Error('Boat card not found');
        }

        const pickupDate = boatCard.querySelector('#pickup-date').value;
        const returnDate = boatCard.querySelector('#return-date').value;

        if (!pickupDate || !returnDate) {
            alert('Per favore, inserisci sia la data di ritiro che la data di consegna.');
            return;
        }

        const boatDetails = {
            boatId: boatId,
            name: boatCard.querySelector('.boat-details h2').textContent,
            price: boatCard.querySelector('.boat-price').textContent,
            imageURL: boatCard.querySelector('.boat-image').src,
            pickupDate: new Date(pickupDate).toISOString(), // Save pickup date
            returnDate: new Date(returnDate).toISOString() // Save return date
        };

        const updatedLoanedBoats = [...loanedBoats, boatDetails];
        localStorage.setItem('loanedBoats', JSON.stringify(updatedLoanedBoats));
        
        alert('Barca acquistata con successo! Puoi vederla nella pagina di riepilogo.');
        window.location.href = '/html/summary.html';
    } catch (error) {
        console.error('Errore durante l\'acquisto', error);
        alert(`Errore durante l'acquisto: ${error.message}`);
    }
}



  async function addToSummary(boatDetails) {
    const loanedBoats = JSON.parse(localStorage.getItem('loanedBoats')) || [];
    const existingBoat = loanedBoats.find(boat => boat.boatId === boatDetails.boatId);
  
    if (existingBoat) {
      alert('Questa barca è già stata acquistata.');
      return;
    }
  
    loanedBoats.push(boatDetails);
    localStorage.setItem('loanedBoats', JSON.stringify(loanedBoats));
  }
  
  async function fetchCartItems() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    cartItemsContainer.innerHTML = '';
    
    let total = 0;

    cart.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      
      const itemDetails = document.createElement('div');
      itemDetails.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.price}</p>
        <img src="${item.imageURL}" alt="${item.name}" class="cart-image">
      `;
      
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Rimuovi';
      removeButton.addEventListener('click', () => removeCartItem(item.boatId));
      
      cartItem.appendChild(itemDetails);
      cartItem.appendChild(removeButton);
      
      cartItemsContainer.appendChild(cartItem);

      // Add item price to total
      total += item.numericPrice || 0;
    });

    // Display total
    cartTotalElement.innerHTML = `
      <div class="cart-total">
        <p>Totale: ${total.toFixed(2)} EUR</p>
      </div>
    `;
    
    const checkoutButton = document.getElementById('checkout-button');
    checkoutButton.addEventListener('click', handleCheckout);
  }
  
  function removeCartItem(boatId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.boatId !== boatId);
    localStorage.setItem('cart', JSON.stringify(cart));
    fetchCartItems();
  }
  
  function handleCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
      alert('Il carrello è vuoto.');
      return;
    }
    
    // Ottieni le barche già in prestito
    const existingLoanedBoats = JSON.parse(localStorage.getItem('loanedBoats')) || [];
    
    // Aggiungi le nuove barche dal carrello
    const updatedLoanedBoats = [...existingLoanedBoats, ...cart];
    
    // Memorizza le barche prese in prestito nel localStorage
    localStorage.setItem('loanedBoats', JSON.stringify(updatedLoanedBoats));
    
    alert('Ordine effettuato con successo!');
    localStorage.removeItem('cart'); // Pulisce il carrello
    window.location.href = '/html/summary.html'; // Reindirizza alla pagina summary
  }
  
  function clearLocalStorageState() {
    localStorage.removeItem('cart');
    localStorage.removeItem('loanedBoats');
    console.log('Local Storage pulito');
    debugLocalStorage();
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
      boatCard.dataset.id = boat.id;
      
      const boatImage = document.createElement('img');
      const imageUrl = boat.imageURL || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpuyB602xvUBarJybSdC-bgjJ7HxePDpI9Ww&s';
      
      boatImage.src = imageUrl;
      boatImage.alt = boat.name;
      boatImage.className = 'boat-image';
      
      boatImage.onerror = () => {
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
      
      if (window.location.pathname.includes('html/admin.html')) {
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-boat-button';
        deleteButton.setAttribute('data-id', boat.id);
        deleteButton.addEventListener('click', async () => {
          await deleteBoat(boat.id);
        });
        flags.appendChild(deleteButton);
      } else {
        const addToCartButton = document.createElement('button');
        addToCartButton.className = 'flag blue-flag';
        addToCartButton.textContent = 'Aggiungi al carrello';
        
        addToCartButton.addEventListener('click', () => {
          addToCart(boat.id);
        });
        
        const purchaseButton = document.createElement('button');
        purchaseButton.className = 'flag green-flag';
        purchaseButton.textContent = 'Acquista';
        
        purchaseButton.addEventListener('click', () => {
          handlePurchase(boat.id);
        });
        
        flags.appendChild(addToCartButton);
        flags.appendChild(purchaseButton);
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
  
  async function deleteBoat(boatId) {
    try {
      const response = await fetch(`http://localhost:8080/barche/delete/${boatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Errore nella cancellazione della barca');
      }
      alert('Barca eliminata con successo');
      location.reload();
    } catch (error) {
      console.error('Errore durante l\'eliminazione della barca:', error);
      alert(`Errore durante l'eliminazione: ${error.message}`);
    }
  }
  
  function handleLogoutButtonClick(event) {
    event.preventDefault();
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('userId');
    window.location.href = '/index.html';
  }
  
  function appendLoginAndRegistrationLinks() {
    const loginLink = document.createElement('li');
    loginLink.innerHTML = '<a href="/html/login.html">Login</a>';
    leftNav.appendChild(loginLink);
    
    const registerLink = document.createElement('li');
    registerLink.innerHTML = '<a href="/html/register.html">Registrati</a>';
    leftNav.appendChild(registerLink);
  }
  
  function addHomeButton() {
    const homeLink = document.createElement('li');
    homeLink.innerHTML = '<a href="/index.html" id="home-link">Home</a>';
    
    if (!window.location.pathname.endsWith('index.html')) {
      leftNav.appendChild(homeLink);
    }
  }
  
  function debugLocalStorage() {
    console.log('Local Storage State:');
    console.log('cart:', JSON.parse(localStorage.getItem('cart')));
    console.log('loanedBoats:', JSON.parse(localStorage.getItem('loanedBoats')));
  }

  // Uncomment the following line only if you want to reset the state for debugging
  // clearLocalStorageState();
  debugLocalStorage();
});
