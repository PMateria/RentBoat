package com.example.Rent.Boats.Service;


import com.example.Rent.Boats.Entity.Boat;
import com.example.Rent.Boats.Entity.User;
import com.example.Rent.Boats.Repository.BoatRepository;
import com.example.Rent.Boats.Repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional

public class BoatService {
    private final BoatRepository boatRepository;

    @Autowired
    public BoatService(BoatRepository boatRepository) {
        this.boatRepository = boatRepository;
    }


    public Boat addBoat(Boat boat) {
        return boatRepository.save(boat);
    }

    public List<Boat> getAllBoats() {
        return boatRepository.findAll();
    }

    public Optional<Boat> getBoatById(Long id) {
        return boatRepository.findById(id);
    }

    public Boat updateBoat(Long id, Boat updatedBoat) {
        Optional<Boat> optionalBoat = boatRepository.findById(id);
        if (optionalBoat.isPresent()) {
            Boat existingBoat = optionalBoat.get();

            // Aggiorna i campi
            if (updatedBoat.getDescription() != null) {
                existingBoat.setDescription(updatedBoat.getDescription());
            }

            if (updatedBoat.getName() != null) {
                existingBoat.setName(updatedBoat.getName());
            }
            if (updatedBoat.getPlaces() != null) {
                existingBoat.setPlaces(updatedBoat.getPlaces());
            }
            if (updatedBoat.getPrice() != null) {
                existingBoat.setPrice(updatedBoat.getPrice());
            }
            if (updatedBoat.getAvailable() != null) {
                existingBoat.setAvailable(updatedBoat.getAvailable());
            }

            // Salva e restituisci la barca aggiornata
            return boatRepository.save(existingBoat);
        } else {
            throw new IllegalArgumentException("Barca non trovata con ID: " + id);
        }
    }
    public void deleteBoatById(Long id) {
        Optional<Boat> boatOptional = boatRepository.findById(id);
        if (boatOptional.isPresent()) {
            boatRepository.delete(boatOptional.get());
        } else {
            throw new IllegalArgumentException("Utente non trovato con ID: " + id);
        }
    }

}