document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:8080/barche/allBoats')
    .then(response => response.json())
    .then(data => {
      const boatsList = document.getElementById('boats-list');
      data.forEach(boat => {
        const boatCard = document.createElement('div');
        boatCard.className = 'boat-card';

        const boatImage = document.createElement('img');
        boatImage.src = boat.imageURL || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpuyB602xvUBarJybSdC-bgjJ7HxePDpI9Ww&s';
        boatImage.alt = boat.name;
        boatImage.className = 'boat-image';

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

        const redFlag = document.createElement('button');
        redFlag.className = 'flag green-flag';
        redFlag.textContent = 'Affitta';

        const greenFlag = document.createElement('button');
        greenFlag.className = 'flag green-flag';
        greenFlag.textContent = 'Aggiungi al carrello';

        flags.appendChild(redFlag);
        flags.appendChild(greenFlag);

        boatDetails.appendChild(boatName);
        boatDetails.appendChild(boatDescription);
        boatDetails.appendChild(boatPrice);
        boatDetails.appendChild(flags);

        boatCard.appendChild(boatImage);
        boatCard.appendChild(boatDetails);

        boatsList.appendChild(boatCard);
      });
    })
    .catch(error => console.error('Error fetching boats:', error));
});
