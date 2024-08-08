document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const boatId = urlParams.get('id');

    if (boatId) {
        try {
            const response = await fetch(`http://localhost:8080/barche/${boatId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch boat details');
            }
            const boat = await response.json();
            displayBoatDetails(boat);
        } catch (error) {
            console.error('Error fetching boat details:', error);
            document.getElementById('boat-details-container').innerHTML = '<p>Error loading boat details.</p>';
        }
    } else {
        document.getElementById('boat-details-container').innerHTML = '<p>No boat ID provided.</p>';
    }

    document.getElementById('logout-btn').addEventListener('click', logout);
});

function displayBoatDetails(boat) {
    const container = document.getElementById('boat-details-container');
    const isAdmin = checkIfUserIsAdmin();

    let imageUploadHtml = '';
    if (isAdmin) {
        imageUploadHtml = '<input type="file" id="image-upload" accept="image/*">';
    }

    let imageUrl = 'https://via.placeholder.com/300'; // Default image
    if (boat.boat_image) {
        imageUrl = `data:image/jpeg;base64,${boat.boat_image}`;
    }

    container.innerHTML = `
        <h1>${boat.name}</h1>
        <img src="${imageUrl}" alt="${boat.name}" id="boat-image" class="boat-image">
        <p>Prezzo: ${boat.price} EUR</p>
        <p>Posti in barca: ${boat.places}</p>
        ${imageUploadHtml}
    `;

    if (isAdmin) {
        const imageUpload = document.getElementById('image-upload');
        imageUpload.addEventListener('change', (event) => handleImageUpload(event, boat.id));
    }
}

function checkIfUserIsAdmin() {
    const jwtToken = sessionStorage.getItem('jwtToken');
    if (jwtToken) {
        try {
            const payload = JSON.parse(atob(jwtToken.split('.')[1]));
            return payload.roles && payload.roles.includes('ROLE_ADMIN');
        } catch (error) {
            console.error('Error parsing JWT token:', error);
        }
    }
    return false;
}

function getSavedImage(boatId) {
    return localStorage.getItem(`boat-image-${boatId}`);
}

function handleImageUpload(event, boatId) {
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch(`http://localhost:8080/barche/${boatId}/image`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`
            }
        })
            .then(response => {
            if (!response.ok) {
                throw new Error('Failed to upload image');
            }
            return response.json(); // Assumiamo che il server restituisca l'oggetto barca aggiornato
        })
            .then(updatedBoat => {
            displayBoatDetails(updatedBoat); // Mostra i dettagli aggiornati della barca
        })
            .catch(error => {
            console.error('Error uploading image:', error);
            alert('Si è verificato un errore durante il caricamento dell\'immagine. Riprova.');
        });
    }
}

function saveImage(boatId, imageUrl) {
    localStorage.setItem(`boat-image-${boatId}`, imageUrl);
}

function resizeImage(base64String, maxWidth, maxHeight, callback) {
    const img = new Image();
    img.src = base64String;
    img.onload = function() {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const resizedBase64 = canvas.toDataURL();
        callback(resizedBase64);
    };
}

function logout() {
    sessionStorage.removeItem('jwtToken');
    localStorage.removeItem('userDetails');
    window.location.href = '../index.html';
}
