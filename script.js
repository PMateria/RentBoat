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

        const now = new Date();

        document.getElementById(`confirm-dates-${boatId}`).addEventListener('click', () => {
            const pickupDate = document.getElementById(`pickup-date-${boatId}`).value;
            const pickupTime = document.getElementById(`pickup-time-${boatId}`).value;
            const returnDate = document.getElementById(`return-date-${boatId}`).value;
            const returnTime = document.getElementById(`return-time-${boatId}`).value;

            if (pickupDate && pickupTime && returnDate && returnTime) {
                if (validateDatesAndTimes(pickupDate, pickupTime, returnDate, returnTime)) {
                    // Verifica la disponibilità
                    if (isBoatAvailableForDates(boatId, pickupDate, pickupTime, returnDate, returnTime)) {
                        addToCartWithDates(boatId, pickupDate, pickupTime, returnDate, returnTime);
                        dateForm.remove();
                        enableButtons(boatId); // Assicurati di riabilitare i pulsanti dopo la conferma
                    } else {
                        alert('La barca è già noleggiata per gli orari scelti.');
                    }
                }
            } else {
                alert('Per favore, seleziona tutte le date e gli orari.');
            }
        });

        document.getElementById(`cancel-dates-${boatId}`).addEventListener('click', () => {
            dateForm.remove();
            enableButtons(boatId); // Riabilita i pulsanti se si annulla
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

        // Controlla se la barca è già presente nel carrello
        const existingItemInCart = cart.find(item => item.boatId === boatId);
        if (existingItemInCart) {
            alert('Questa barca è già nel carrello!');
            return; // Esci senza aggiungere la barca
        }

        // Aggiungi il nuovo oggetto barca al carrello
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

            // Controllo se la barca è già nel carrello
            const existingItemInCart = cart.find(item => item.boatId === boatId);
            const isInCart = !existingItemInCart;

            // Controllo se la barca è già noleggiata
            const isLoaned = loanedBoats.some(boat => boat.boatId === boatId);

            const now = new Date();

            // Se la barca è nel carrello, verifica se l'orario di ritiro è passato
            if (isInCart) {
                const returnDateTime = new Date(existingItemInCart.returnDateTime);
                if (returnDateTime < now) {
                    // Se l'orario di ritiro è passato, permetti all'utente di noleggiare la barca
                    showDateSelectionForm(boatId, 'purchase');
                    return;
                } else {
                    alert('Questa barca è già nel carrello e non è disponibile fino a dopo il ritorno.');
                    return;
                }
            }

            // Se la barca è già noleggiata
            if (isLoaned) {
                alert('Questa barca non è attualmente disponibile per il noleggio.');
                return;
            }

            // Se la barca non è nel carrello o già noleggiata, mostra il modulo di selezione delle date
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
            removeButton.style.marginTop = '10px'; // Aggiungi margine per separarlo dall'immagine

            removeButton.addEventListener('click', () => removeCartItem(item.boatId));

            // Aggiungi un contesto per itemDetails che include il bottone di rimozione
            const buttonContainer = document.createElement('div');
            buttonContainer.style.marginTop = '100px'; // Aggiungi margine superiore al contenitore del pulsante
            buttonContainer.appendChild(removeButton);

            cartItem.appendChild(itemDetails);
            cartItem.appendChild(buttonContainer); // Append il contenitore del bottone

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

    function safeSetItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.error('Quota exceeded. Please clean up some data.');
                // Esegui la logica per gestire l'errore di quota superata, come la pulizia dei dati.
            } else {
                console.error('Errore sconosciuto durante il salvataggio:', e);
            }
        }
    }

    function cleanOldData() {
        const now = new Date();
        let loanedBoats = JSON.parse(localStorage.getItem('loanedBoats')) || [];

        // Keep only non-expired rentals
        loanedBoats = loanedBoats.filter(boat => new Date(boat.returnDateTime) > now);

        // Sort by return date, keeping the most recent ones
        loanedBoats.sort((a, b) => new Date(b.returnDateTime) - new Date(a.returnDateTime));

        // Keep only the last 50 rentals (or adjust this number as needed)
        loanedBoats = loanedBoats.slice(0, 50);

        localStorage.setItem('loanedBoats', JSON.stringify(loanedBoats));
    }

    // Chiama questa funzione periodicamente o in un punto critico del tuo codice
    cleanOldData();

    function cleanLocalStorage() {
        // Rimuove dati obsoleti
        localStorage.removeItem('obsoleteDataKey');
    }


    function handleBoatImages(boats) {
        const imageCache = {};

        boats.forEach(boat => {
            // Usa l'URL dell'immagine direttamente dal server
            const imageUrl = boat.imageURL;

            // Crea un oggetto Image per precaricare l'immagine
            const img = new Image();
            img.src = imageUrl;

            // Memorizza l'URL dell'immagine in un oggetto cache in memoria
            imageCache[boat.id] = imageUrl;

            // Aggiungi un evento di fallback in caso l'immagine non si carichi
            img.onerror = () => {
                imageCache[boat.id] = 'https://via.placeholder.com/150';
            };
        });

        function getBoatImageUrl(boatId) {
            return imageCache[boatId] || 'https://via.placeholder.com/150';
        }

        return getBoatImageUrl;
    }

    function handleCheckout() {
        try {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                alert('Il carrello è vuoto.');
                return;
            }

            let existingLoanedBoats = JSON.parse(localStorage.getItem('loanedBoats')) || [];
            const updatedLoanedBoats = [...existingLoanedBoats, ...cart];

            // Remove old data before attempting to save
            cleanOldData();

            try {
                localStorage.setItem('loanedBoats', JSON.stringify(updatedLoanedBoats));
            } catch (storageError) {
                if (storageError.name === 'QuotaExceededError') {
                    console.warn('Storage quota exceeded. Attempting to free up space...');

                    // Remove the oldest loaned boats until we can save
                    while (existingLoanedBoats.length > 0) {
                        existingLoanedBoats.shift(); // Remove the oldest entry
                        const reducedLoanedBoats = [...existingLoanedBoats, ...cart];

                        try {
                            localStorage.setItem('loanedBoats', JSON.stringify(reducedLoanedBoats));
                            console.log('Successfully saved reduced data');
                            break; // If successful, exit the loop
                        } catch (e) {
                            if (e.name !== 'QuotaExceededError') throw e; // If it's a different error, throw it
                            // Otherwise, continue the loop and remove more items
                        }
                    }

                    if (existingLoanedBoats.length === 0) {
                        throw new Error('Unable to save order due to storage limitations. Please contact support.');
                    }
                } else {
                    throw storageError; // If it's not a QuotaExceededError, rethrow it
                }
            }

            localStorage.removeItem('cart');
            alert('Ordine effettuato con successo!');
            window.location.href = '../html/summary.html';
        } catch (error) {
            console.error('Errore durante il checkout:', error);
            alert(`Errore durante il checkout: ${error.message}`);
        }
    }



    async function loadBoats(isAuthenticated) {
        try {
            const response = await fetch('http://localhost:8080/barche/allBoats');
            if (!response.ok) {
                throw new Error('Errore nel recupero delle barche');
            }
            const data = await response.json();
            const getBoatImageUrl = handleBoatImages(data);
            renderBoats(data, isAuthenticated, getBoatImageUrl);
            startAvailabilityChecker();
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


    Copiare
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
            boatImage.alt = boat.name;
            boatImage.className = 'boat-image';
            boatImage.src = boat.imageURL || 'https://via.placeholder.com/150'; // Usa un'immagine di fallback

            boatImage.onerror = () => {
                boatImage.src = 'https://i.postimg.cc/W4NXfR6J/Clicca-qui-per-selezionare-una-foto.png'; // Fallback
            };

            // Prova a caricare l'immagine della barca
            fetch(`http://localhost:8080/barche/${boat.id}/image`)
                .then(response => {
                if (response.ok) {
                    return response.blob(); // Convertire la risposta in un blob
                } else {
                    throw new Error('Immagine non trovata');
                }
            })
                .then(blob => {
                boatImage.src = URL.createObjectURL(blob); // Crea un URL per il blob
            })
                .catch(err => {
                console.error('Errore nel recupero dell\'immagine:', err);
                console.log('Impostando immagine di fallback');
                boatImage.src = 'https://via.placeholder.com/150'; // URL dell'immagine di fallback
            });

            boatImage.className = 'boat-image';

            boatImage.addEventListener('click', () => {
                window.location.href = `../html/boat-details.html?id=${boat.id}`;
            });

            // Resto della tua logica per allestire e appendere i dettagli della barca
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
            boatPrice.textContent = `Prezzo: ${boat.price} EUR`;

            const boatPlaces = document.createElement('p');
            boatPlaces.className = 'boat-places';
            boatPlaces.textContent = `Posti disponibili: ${boat.places}`;



            boatDetails.appendChild(boatName);
            boatDetails.appendChild(boatDescription);
            boatDetails.appendChild(boatPrice);
            boatDetails.appendChild(boatPlaces);

            if (isAuthenticated) {
                const addToCartButton = document.createElement('button');
                addToCartButton.className = 'flag blue-flag';
                addToCartButton.textContent = 'Aggiungi al carrello';

                const purchaseButton = document.createElement('button');
                purchaseButton.className = 'flag green-flag';
                purchaseButton.textContent = 'Noleggia';

                // Logica per i pulsanti
                addToCartButton.addEventListener('click', () => addToCart(boat.id));
                purchaseButton.addEventListener('click', () => handlePurchase(boat.id));

                boatDetails.appendChild(addToCartButton);
                boatDetails.appendChild(purchaseButton);
            }
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
