document.addEventListener('DOMContentLoaded', () => {
    loadSummaryData();
});

function loadSummaryData() {
    const summaryContainer = document.getElementById('summary-container');
    const loanedBoats = JSON.parse(localStorage.getItem('loanedBoats')) || [];
    const userId = sessionStorage.getItem('userId'); // Ottieni l'ID utente dalla sessione

    // Filtra le barche in base all'ID utente
    const userLoanedBoats = loanedBoats.filter(boat => boat.userId === userId);

    if (userLoanedBoats.length === 0) {
        summaryContainer.innerHTML = '<p>Non ci sono barche prese in prestito.</p>';
        return;
    }

    summaryContainer.innerHTML = '';

    userLoanedBoats.forEach(boat => {
        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';
        summaryItem.innerHTML = `
            <h2>${boat.name}</h2>
            <p>Prezzo: ${boat.price}</p>
            <p>Data e ora di ritiro: ${new Date(boat.pickupDateTime).toLocaleString()}</p>
            <p>Data e ora di consegna: ${new Date(boat.returnDateTime).toLocaleString()}</p>
            <img src="${boat.imageURL}" alt="${boat.name}" class="summary-image">
        `;
        summaryContainer.appendChild(summaryItem);
    });
}
