function loadSummaryData() {
    const summaryContainer = document.getElementById('summary-container');
    let loanedBoats = [];
    let userId = sessionStorage.getItem('userId');
    console.log('Raw userId from sessionStorage:', userId);
    console.log('Type of userId:', typeof userId);

    if (!summaryContainer) {
        console.error('Element with id "summary-container" not found');
        return;
    }

    try {
        loanedBoats = JSON.parse(localStorage.getItem('loanedBoats')) || [];
        console.log('Raw loanedBoats from localStorage:', localStorage.getItem('loanedBoats'));
    } catch (error) {
        console.error('Errore nell\'accesso ai dati di storage:', error);
        summaryContainer.innerHTML = '<p>Errore: Impossibile caricare i dati.</p>';
        return;
    }

    console.log('ID Utente Corrente:', userId);
    console.log('Tutte le barche prese in prestito:', loanedBoats);

    if (!userId) {
        console.warn('userId is falsy:', userId);
        summaryContainer.innerHTML = '<p>Errore: Utente non autenticato.</p>';
        return;
    }

    const userLoanedBoats = loanedBoats.filter(boat => userId == userId);

    console.log('Barche prese in prestito dall\'utente:', userLoanedBoats);

    if (userLoanedBoats.length === 0) {
        summaryContainer.innerHTML = '<p>Non ci sono barche prese in prestito.</p>';
        return;
    }

    summaryContainer.innerHTML = '';

    userLoanedBoats.forEach(boat => {
        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';
        summaryItem.innerHTML = `
            <img src="${boat.imageURL}" alt="${boat.name}" class="boat-image">
            <h3>${boat.name}</h3>
            <p>Prezzo: ${boat.price}</p>
            <p>Data e ora di ritiro: ${new Date(boat.pickupDateTime).toLocaleString()}</p>
            <p>Data e ora di consegna: ${new Date(boat.returnDateTime).toLocaleString()}</p>
        `;
        summaryContainer.appendChild(summaryItem);
    });
}

document.addEventListener('DOMContentLoaded', loadSummaryData);