function checkUserRole() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        console.error('Token JWT non trovato nel localStorage');
        // Gestire il caso in cui il token non è presente (reindirizza o mostra un messaggio di errore)
        return;
    }

    // Decodifica il payload del JWT
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decodedToken = JSON.parse(atob(base64));

    // Recupera il ruolo dall'oggetto decodificato
    const roles = decodedToken.roles;

    // Mostra o nascondi le card in base al ruolo
    if (roles === 'ROLE_Admin') { // Verifica se l'utente ha il ruolo amministratore
        document.getElementById('get-users-card').style.display = 'block';
        document.getElementById('delete-user-card').style.display = 'block';
        document.getElementById('error-message').style.display = 'none'; // Nascondi eventuali messaggi di errore
    } else {
        document.getElementById('get-users-card').style.display = 'none';
        document.getElementById('delete-user-card').style.display = 'none';
        document.getElementById('error-message').style.display = 'block'; // Mostra un messaggio di errore generico
    }
}