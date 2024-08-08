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
        // Restituisci una foto di fallback
        return 'https://via.placeholder.com/150'; // o l'URL di un'immagine di fallback
    }
}

async function loadSummaryData() {
    const summaryContainer = document.getElementById('summary-container');
    let loanedBoats = [];
    let userId = sessionStorage.getItem('userId');

    if (!summaryContainer) {
        console.error('Elemento con id "summary-container" non trovato');
        return;
    }

    try {
        loanedBoats = JSON.parse(localStorage.getItem('loanedBoats')) || [];
    } catch (error) {
        console.error('Errore nell\'accesso ai dati di storage:', error);
        summaryContainer.innerHTML = '<p>Errore: Impossibile caricare i dati.</p>';
        return;
    }

    if (!userId) {
        summaryContainer.innerHTML = '<p>Errore: Utente non autenticato.</p>';
        return;
    }

    const userLoanedBoats = loanedBoats.filter(boat => boat.userId === userId); // Aggiungi confronto a userId specifico

    if (userLoanedBoats.length === 0) {
        summaryContainer.innerHTML = '<p>Non ci sono barche prese in prestito.</p>';
        return;
    }

    summaryContainer.innerHTML = '';

    for (const boat of userLoanedBoats) {
        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';

        // Ottieni l'immagine dell'imbarcazione usando l'API
        const imageUrl = await loadImage(boat.boatId); // Assicurati che boat.boatId sia l'ID corretto della barca.

        summaryItem.innerHTML = `
            <img src="${imageUrl}" alt="${boat.name}" class="boat-image">
            <h3>${boat.name}</h3>
            <p>Prezzo: ${boat.price}</p>
            <p>Data e ora di ritiro: ${new Date(boat.pickupDateTime).toLocaleString()}</p>
            <p>Data e ora di consegna: ${new Date(boat.returnDateTime).toLocaleString()}</p>
        `;
        summaryContainer.appendChild(summaryItem);
    }
}

document.addEventListener('DOMContentLoaded', loadSummaryData);