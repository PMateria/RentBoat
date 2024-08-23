async function loadImage(boatId) {
    try {
        const response = await fetch(`http://localhost:8080/barche/${boatId}/image`);
        if (!response.ok) {
            throw new Error('Immagine non trovata');
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('Errore nel recupero dell\'immagine:', error);
        return 'https://via.placeholder.com/150';
    }
}

async function loadSummaryData() {
    const summaryContainer = document.getElementById('summary-container');
    let loanedBoats = [];
    const userId = sessionStorage.getItem('userId');

    if (!summaryContainer) {
        console.error('Elemento con id "summary-container" non trovato');
        return;
    }

    if (!userId) {
        summaryContainer.innerHTML = '<p>Errore: Utente non autenticato.</p>';
        return;
    }

    try {
        loanedBoats = JSON.parse(localStorage.getItem('loanedBoats')) || [];
    } catch (error) {
        console.error('Errore nell\'accesso ai dati di storage:', error);
        summaryContainer.innerHTML = '<p>Errore: Impossibile caricare i dati.</p>';
        return;
    }

    const userLoanedBoats = loanedBoats.filter(boat => boat.userId === userId);

    if (userLoanedBoats.length === 0) {
        summaryContainer.innerHTML = '<p>Non ci sono barche prese in prestito.</p>';
        return;
    }

    summaryContainer.innerHTML = '';

    for (const boat of userLoanedBoats) {
        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';

        // Ottieni l'immagine dell'imbarcazione usando l'API
        const imageUrl = await loadImage(boat.boatId);

        // Controlla se le date di ritiro e consegna sono valide
        const pickupDateTime = new Date(boat.pickupDateTime);
        const returnDateTime = new Date(boat.returnDateTime);
        const pricePerHour = Number(boat.numericPrice); // Assicurati che sia un numero
        let totalPrice = 0;

        if (isNaN(pricePerHour)) {
            console.error('Prezzo non valido:', boat.numericPrice);
            totalPrice = pricePerHour; // O gestisci come preferisci
        } else {
            if (!isNaN(pickupDateTime) && !isNaN(returnDateTime)) {
                // Calcola la durata del noleggio in ore
                const rentalHours = (returnDateTime - pickupDateTime) / (1000 * 60 * 60); // Converte millisecondi in ore
                totalPrice = Math.max(0, rentalHours * pricePerHour); // Prezzo totale calcolato; non lasciar scendere sotto zero
            } else {
                totalPrice = pricePerHour; // Prezzo normale se le date non sono valide
            }
        }

        summaryItem.innerHTML = `
            <img src="${imageUrl}" alt="${boat.name}" class="boat-image">
            <h3>${boat.name}</h3>
            <p>Prezzo totale: €${totalPrice.toFixed(2)}</p>
            <p>Data e ora di ritiro: ${pickupDateTime.toLocaleString()}</p>
            <p>Data e ora di consegna: ${returnDateTime.toLocaleString()}</p>
        `;
        summaryContainer.appendChild(summaryItem);
    }
}

document.addEventListener('DOMContentLoaded', loadSummaryData);