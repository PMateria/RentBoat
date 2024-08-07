function initializeLocalStorage() {
    if (!localStorage.getItem('loanedBoats')) {
        localStorage.setItem('loanedBoats', JSON.stringify([]));
    }
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
}


function applyStylesToLinks() {
    const links = document.querySelectorAll('.navbar-nav .nav-link');
    links.forEach(link => {
        link.style.color = 'black';
        link.style.textDecoration = 'none';
    });
}


document.addEventListener('DOMContentLoaded', async () => {

    const currentPath = window.location.href;
    if (currentPath === 'http://localhost:8081/') {
        document.body.classList.add('special-background');
    } else {
        document.body.classList.remove('special-background');
    }
    if (currentPath === '/index.html') {
        window.location.href = '/';
        return; // Ferma l'esecuzione del resto dello script
    }
    const leftNav = document.getElementById('left-nav');
    const rightNav = document.getElementById('right-nav');

    let jwtToken = sessionStorage.getItem('jwtToken');
    let userId = sessionStorage.getItem('userId');
    let isAuthenticated = !!jwtToken; // Booleano che indica se l'utente è autenticato

    if (isAuthenticated) {
        showUserAvatar(true);
        try {
            const payload = JSON.parse(atob(jwtToken.split('.')[1]));
            userId = payload.sub;
            const roles = payload.roles;
            showUserAvatar(true);


            // Add other links
            const cartLink = document.createElement('ul');
            cartLink.className = 'nav-item';
            cartLink.innerHTML = '<a href="/html/cart.html" style="color: black !important;">Carrello</a>';
            leftNav.appendChild(cartLink);

            const summaryLink = document.createElement('ul');
            summaryLink.className = 'nav-item';
            summaryLink.innerHTML = '<a href="/html/summary.html" style= "color: black !important;" >Riepilogo</a>';
            leftNav.appendChild(summaryLink);

            const logoutLink = document.createElement('ul');
            logoutLink.className = 'nav-item';
            logoutLink.innerHTML = '<a href="#" id="logout-link" style= "color: black !important;" >Logout</a>';
            rightNav.appendChild(logoutLink);

            // Handle logout
            const logoutButton = document.getElementById('logout-link');
            logoutButton.className = 'nav-item';
            logoutButton.addEventListener('click', handleLogoutButtonClick);

            // Add admin link if needed
            if (roles && roles.includes('ROLE_ADMIN')) {
                const adminLink = document.createElement('ul');
                adminLink.className = 'nav-item';
                //adminLink.className = 'admin-link'; // Aggiungiamo una classe specifica
                adminLink.innerHTML = '<a href="/html/admin.html" style="color: black !important;">ADMIN</a>';
                rightNav.appendChild(adminLink);
            }

            applyStylesToLinks();

        } catch (error) {
            console.error('Errore nel parsing del token JWT:', error);
        }
    } else {
        appendLoginAndRegistrationLinks();
        showUserAvatar(false);
        applyStylesToLinks();
    }

    if (window.location.pathname.includes('html/cart.html')) {
        fetchCartItems();
    } else if (!window.location.pathname.includes('html/summary.html')) {
        await loadBoats(isAuthenticated);
    }

    addHomeButton();


    function addToCart(boatId) {
        try {
            console.log(`Tentativo di aggiungere la barca con ID: ${boatId}`);
            debugLocalStorage();

            if (!boatId) {
                console.error('Boat ID non disponibile');
                return;
            }

            // Verifica se la barca è disponibile
            if (!isBoatAvailable(boatId)) {
                alert('Questa barca non è attualmente disponibile per il noleggio.');
                return;
            }

            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingBoat = cart.find(item => item.boatId === boatId);

            // Verifica se la barca è già nel carrello
            if (existingBoat) {
                alert('Questa barca è già nel carrello.');
                return;
            }

            // Disabilita entrambi i pulsanti
            disableButtons(boatId);

            // Mostra il form per la selezione delle date
            showDateSelectionForm(boatId, 'cart');
        } catch (error) {
            console.error('Errore durante l\'aggiunta al carrello:', error);
            alert(`Errore durante l'aggiunta al carrello: ${error.message}`);
        }
    }

    function disableAddToCartButton(boatId) {
        const addToCartButton = document.querySelector(`.boat-card[data-id="${boatId}"] .blue-flag`);
        if (addToCartButton) {
            addToCartButton.disabled = true;
            addToCartButton.style.opacity = '0.5';
            addToCartButton.style.cursor = 'not-allowed';
        }
    }

    function enableAddToCartButton(boatId) {
        const addToCartButton = document.querySelector(`.boat-card[data-id="${boatId}"] .blue-flag`);
        if (addToCartButton) {
            addToCartButton.disabled = false;
            addToCartButton.style.opacity = '1';
            addToCartButton.style.cursor = 'pointer';
        }
    }


    function isBoatAvailable(boatId) {
        const loanedBoats = JSON.parse(localStorage.getItem('loanedBoats')) || [];
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const now = new Date();

        // Check loaned boats
        const isLoanedAndUnavailable = loanedBoats.some(boat => {
            return boat.boatId === boatId && new Date(boat.returnDateTime) > now;
        });

        // Check cart
        const isInCartAndUnavailable = cart.some(item => {
            return item.boatId === boatId && new Date(item.pickupDateTime) > now;
        });
        return !isLoanedAndUnavailable && !isInCartAndUnavailable;
    }

    //  Funzione per aggiornare lo stato delle barche e l'interfaccia utente
    function updateBoatsState() {
        saveLoanedBoatsState();
        const boatCards = document.querySelectorAll('.boat-card');
        boatCards.forEach(card => {
            const boatId = card.dataset.id;
            const addToCartButton = card.querySelector('.blue-flag');
            const purchaseButton = card.querySelector('.green-flag');

            if (isBoatAvailable(boatId)) {
                addToCartButton.disabled = false;
                purchaseButton.disabled = false;
                addToCartButton.style.opacity = '1';
                purchaseButton.style.opacity = '1';
            } else {
                addToCartButton.disabled = true;
                purchaseButton.disabled = true;
                addToCartButton.style.opacity = '0.5';
                purchaseButton.style.opacity = '0.5';
            }
        });
    }

    function showDateSelectionForm(boatId, action) {
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
        <button id="cancel-dates-${boatId}" class="cancel-button">Annulla</button>
    `;

        const boatCard = document.querySelector(`.boat-card[data-id="${boatId}"]`);
        boatCard.appendChild(dateForm);

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
                        if (action === 'cart') {
                            addToCartWithDates(boatId, pickupDate, pickupTime, returnDate, returnTime);
                        } else if (action === 'purchase') {
                            // Implementa la logica per l'acquisto diretto qui
                            console.log('Implementare la logica di acquisto diretto');
                        }
                        dateForm.remove();
                        // Non riabilitiamo i pulsanti qui, perché l'azione è stata completata
                    } else {
                        alert('La barca non è disponibile per le date selezionate.');
                        enableButtons(boatId);
                    }
                }
            } else {
                alert('Per favore, seleziona tutte le date e gli orari.');
            }
        });
        document.getElementById(`cancel-dates-${boatId}`).addEventListener('click', () => {
            dateForm.remove();
            enableButtons(boatId);
        });
    }

    function isBoatAvailableForDates(boatId, pickupDate, pickupTime, returnDate, returnTime) {
        const loanedBoats = JSON.parse(localStorage.getItem('loanedBoats')) || [];
        const requestedPickup = new Date(`${pickupDate}T${pickupTime}`);
        const requestedReturn = new Date(`${returnDate}T${returnTime}`);

        const now = new Date();

        // Controlla se la data di consegna richiesta è già passata
        if (requestedReturn < now) {
            console.log('La data di consegna richiesta è già passata, la barca può essere aggiunta al carrello.');
            return true;
        }

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

        // Controlla se la data e l'ora di ritiro sono nel passato
        if (pickup < now) {
            alert('La data e l\'ora di ritiro non possono essere nel passato.');
            return false;
        }

        // Controlla se la data e l'ora di consegna sono successive a quelle di ritiro
        if (return_ <= pickup) {
            alert('La data e l\'ora di consegna devono essere successive a quelle di ritiro.');
            return false;
        }

        // Controlla se il periodo di noleggio è di almeno un'ora
        const durationInHours = (return_ - pickup) / (1000 * 60 * 60);
        if (durationInHours < 1) {
            alert('Il periodo di noleggio deve essere di almeno un\'ora.');
            return false;
        }

        return true;
    }

    function isBoatAvailable(boatId) {
        const loanedBoats = JSON.parse(localStorage.getItem('loanedBoats')) || [];
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const now = new Date();

        // Check loaned boats
        const isLoanedAndUnavailable = loanedBoats.some(boat => {
            return boat.boatId === boatId && new Date(boat.returnDateTime) > now;
        });

        // Check cart
        const isInCartAndUnavailable = cart.some(item => {
            return item.boatId === boatId && new Date(item.pickupDateTime) > now;
        });

        return !isLoanedAndUnavailable && !isInCartAndUnavailable;
    }

    function enableBoatCardIfAvailable(boatId) {
        if (isBoatAvailable(boatId)) {
            enableButtons(boatId);
        }
    }

    function isBoatAvailableForDates(boatId, pickupDate, pickupTime, returnDate, returnTime) {
        const loanedBoats = JSON.parse(localStorage.getItem('loanedBoats')) || [];
        const requestedPickup = new Date(`${pickupDate}T${pickupTime}`);
        const requestedReturn = new Date(`${returnDate}T${returnTime}`);

        const now = new Date();

        // Controlla se la data di consegna richiesta è già passata
        if (requestedReturn < now) {
            console.log('La data di consegna richiesta è già passata, la barca può essere aggiunta al carrello.');
            return true;
        }

        const isOverlapping = loanedBoats.some(boat => {
            if (boat.boatId !== boatId) return false;

            const existingPickup = new Date(boat.pickupDateTime);
            const existingReturn = new Date(boat.returnDateTime);

            return (requestedPickup < existingReturn && requestedReturn > existingPickup);
        });

        return !isOverlapping;
    }


    function addToCartWithDates(boatId, pickupDate, pickupTime, returnDate, returnTime) {
        const boatCard = document.querySelector(`.boat-card[data-id="${boatId}"]`);
        const boatDetails = {
            boatId: boatId,
            userId: userId,
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

    function handlePurchase(boatId) {
        try {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const loanedBoats = JSON.parse(localStorage.getItem('loanedBoats')) || [];

            // Check if the boat is already in the cart
            const isInCart = cart.some(item => item.boatId === boatId);

            // Check if the boat is already loaned
            const isLoaned = loanedBoats.some(boat => boat.boatId === boatId);

            if (isInCart) {
                alert('Questa barca è già nel carrello.');
                return;
            }

            // Se la barca è nel riepilogo, controlla se la data di ritorno è passata
            const now = new Date();
            const existingLoanedBoat = loanedBoats.find(boat => boat.boatId === boatId);

            if (existingLoanedBoat) {
                const returnDateTime = new Date(existingLoanedBoat.returnDateTime);
                if (returnDateTime < now) {
                    // Se la data di ritorno è passata, mostra il modulo di selezione delle date senza messaggi
                    disableButtons(boatId);
                    showDateSelectionForm(boatId, 'purchase');
                    return;
                } else {
                    alert('Questa barca non è attualmente disponibile per il noleggio.');
                    return;
                }
            }

            // Se la barca non è nel riepilogo, mostra il modulo di selezione delle date
            disableButtons(boatId);
            showDateSelectionForm(boatId, 'purchase');
        } catch (error) {
            console.error('Errore durante l\'acquisto', error);
            alert(`Errore durante l'acquisto: ${error.message}`);
        }
    }

    function disableButtons(boatId) {
        const addToCartButton = document.querySelector(`.boat-card[data-id="${boatId}"] .blue-flag`);
        const purchaseButton = document.querySelector(`.boat-card[data-id="${boatId}"] .green-flag`);

        if (addToCartButton) {
            addToCartButton.disabled = true;
            addToCartButton.style.opacity = '0.5';
            addToCartButton.style.cursor = 'not-allowed';
        }

        if (purchaseButton) {
            purchaseButton.disabled = true;
            purchaseButton.style.opacity = '0.5';
            purchaseButton.style.cursor = 'not-allowed';
        }
    }

    function enableButtons(boatId) {
        const addToCartButton = document.querySelector(`.boat-card[data-id="${boatId}"] .blue-flag`);
        const purchaseButton = document.querySelector(`.boat-card[data-id="${boatId}"] .green-flag`);

        if (addToCartButton) {
            addToCartButton.disabled = false;
            addToCartButton.style.opacity = '1';
            addToCartButton.style.cursor = 'pointer';
        }

        if (purchaseButton) {
            purchaseButton.disabled = false;
            purchaseButton.style.opacity = '1';
            purchaseButton.style.cursor = 'pointer';
        }
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
            removeButton.style.backgroundColor = 'red';  // Imposta il colore di sfondo a rosso

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


    async function loadBoats(isAuthenticated) {
        try {
            const response = await fetch('http://localhost:8080/barche/allBoats');
            if (!response.ok) {
                throw new Error('Errore nel recupero delle barche');
            }
            const data = await response.json();
            renderBoats(data, isAuthenticated);
            startAvailabilityChecker(); // Start the availability checker
        } catch (error) {
            console.error('Errore durante il recupero delle barche:', error);
        }
    }

    function saveLoanedBoatsState() {
        const loanedBoats = JSON.parse(localStorage.getItem('loanedBoats')) || [];
        const now = new Date();

        // Filtra le barche ancora in noleggio
        const currentLoanedBoats = loanedBoats.filter(boat => new Date(boat.returnDateTime) > now);

        localStorage.setItem('loanedBoats', JSON.stringify(currentLoanedBoats));
    }

    function loadLoanedBoatsState() {
        return JSON.parse(localStorage.getItem('loanedBoats')) || [];
    }

    function renderBoats(data, isAuthenticated) {
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
            const imageUrl = boat.imageURL || 'https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/00/2c/5f.jpg';

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
            boatName.style.color = 'white'; // Cambia il colore a bianco

            const boatDescription = document.createElement('p');
            boatDescription.innerHTML = `<strong>${boat.description}</strong>`;
            boatDescription.style.color = 'black';

            const boatPrice = document.createElement('p');
            boatPrice.className = 'boat-price';
            boatPrice.textContent = `Price: ${boat.price} EUR`;

            // Aggiungi il numero di posti
            const boatPlaces = document.createElement('p');
            boatPlaces.className = 'boat-places';
            boatPlaces.textContent = `Posti disponibili: ${boat.places}`;

            const flags = document.createElement('div');
            flags.className = 'flags';

            if (isAuthenticated) {
                const addToCartButton = document.createElement('button');
                addToCartButton.className = 'flag blue-flag';
                addToCartButton.textContent = 'Aggiungi al carrello';

                const purchaseButton = document.createElement('button');
                purchaseButton.className = 'flag green-flag';
                purchaseButton.textContent = 'Affitta';

                // Aggiungi l'evento di clic per gestire il caso in cui la barca non è selezionabile
                addToCartButton.addEventListener('click', () => {
                    if (isBoatAvailable(boat.id)) {
                        addToCart(boat.id);
                    } else {
                        alert('Questa barca non è attualmente disponibile per il noleggio.');
                    }
                });

                purchaseButton.addEventListener('click', () => {
                    if (isBoatAvailable(boat.id)) {
                        handlePurchase(boat.id);
                    } else {
                        alert('Questa barca non è attualmente disponibile per il noleggio.');
                    }
                });

                if (!isBoatAvailable(boat.id)) {
                    addToCartButton.disabled = true;
                    purchaseButton.disabled = true;
                    addToCartButton.style.opacity = '0.5';
                    purchaseButton.style.opacity = '0.5';
                }

                flags.appendChild(addToCartButton);
                flags.appendChild(purchaseButton);
            } else {
                // Se non autenticato, non aggiungere i pulsanti
                const loginPrompt = document.createElement('p');
                loginPrompt.style.color = 'red';
                loginPrompt.textContent = 'Effettua il login per aggiungere al carrello o affittare una barca.';
                flags.appendChild(loginPrompt);
            }

            boatDetails.appendChild(boatName);
            boatDetails.appendChild(boatDescription);
            boatDetails.appendChild(boatPrice);
            boatDetails.appendChild(boatPlaces); // Aggiungi il numero di posti
            boatDetails.appendChild(flags);

            boatCard.appendChild(boatImage);
            boatCard.appendChild(boatDetails);

            boatsList.appendChild(boatCard);
        });
    }


    function startAvailabilityChecker() {
        setInterval(() => {
            const boatCards = document.querySelectorAll('.boat-card');
            boatCards.forEach(card => {
                const boatId = card.dataset.id;
                enableBoatCardIfAvailable(boatId);
            });
        }, 60000); // Check every minute
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
        sessionStorage.clear();
        localStorage.removeItem('cart');

        const remainingCart = localStorage.getItem('cart');

        if (remainingCart) {
            console.log('Cart still exists, forcing clear');
            localStorage.setItem('cart', '[]');
            console.log('Cart forcibly cleared');
        }

        // Reindirizza alla radice del sito
        setTimeout(() => {
            window.location.href = '/'; // Reindirizza alla radice del sito
        }, 100);
    }

    function appendLoginAndRegistrationLinks() {
        const leftNav = document.getElementById('left-nav');
        if (leftNav) {
            const loginLink = document.createElement('li');
            loginLink.className = 'nav-item';
            loginLink.innerHTML = '<a class="nav-link" href="/html/login.html">Login - Registrazione</a>';
            leftNav.appendChild(loginLink);
        }
    }


    function addHomeButton() {
        const currentPath = window.location.pathname;
        if (currentPath === '/index.html' || currentPath === '/') {
            return; // Non aggiungere il pulsante Home sulla pagina principale
        }

        const homeLink = document.createElement('li');
        homeLink.className = 'nav-item';
        const anchor = document.createElement('a');
        anchor.href = '/index.html';
        anchor.id = 'home-link';
        anchor.className = 'nav-link';
        anchor.textContent = 'Home';

        // Rimuovi il colore del testo
        anchor.style.color = inherit; // Puoi usare 'inherit' o una stringa vuota

        homeLink.appendChild(anchor);
        const leftNav = document.getElementById('left-nav');
        if (leftNav) {
            leftNav.insertBefore(homeLink, leftNav.firstChild);
        }
    }

    function showUserAvatar(isAuthenticated) {
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar) {
            userAvatar.style.display = isAuthenticated ? 'block' : 'none';
        }
    }

    function applyStylesToExistingLinks() {
        const navLinks = document.querySelectorAll('#left-nav a, #right-nav a');
        navLinks.forEach(link => {
            link.style.marginRight = '15px';
        });
    }

    function debugLocalStorage() {
        const data = localStorage.getItem('nome_chiave');
        if (data) {
            try {
                const parsedData = JSON.parse(data);
                console.log(parsedData);
            } catch (e) {
                console.error('Errore durante il parsing del JSON:', e);
            }
        } else {
            console.log('Nessun dato trovato nel Local Storage');
        }
    }

    function isAdminPage() {
        return window.location.pathname.includes('/html/admin.html');
    }

    // Uncomment the following line only if you want to reset the state for debugging
    // clearLocalStorageState();
    applyStylesToExistingLinks();

    debugLocalStorage();
});
