package com.example.Rent.Boats.Service;

import com.example.Rent.Boats.Entity.Boat;
import com.example.Rent.Boats.Entity.Reservation;
import com.example.Rent.Boats.Entity.User;
import com.example.Rent.Boats.Repository.BoatRepository;
import com.example.Rent.Boats.Repository.ReservationRepository;
import com.example.Rent.Boats.Repository.UserRepository;
import jakarta.transaction.Transactional;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service

public class ReservationService {
    private static final Logger logger = LogManager.getLogger(ReservationService.class);

    private final ReservationRepository reservationRepository;
    private final BoatRepository boatRepository;
    private final UserRepository userRepository;

    @Autowired
    public ReservationService(ReservationRepository reservationRepository, BoatRepository boatRepository, UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.boatRepository = boatRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Reservation addReservation(Long boatId, Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        // Recupera la barca e l'utente dal repository
        Optional<Boat> optionalBoat = boatRepository.findById(boatId);
        Optional<User> optionalUser = userRepository.findById(userId);

        // Verifica se la barca e l'utente esistono
        if (optionalBoat.isPresent() && optionalUser.isPresent()) {
            Boat boat = optionalBoat.get();
            User user = optionalUser.get();

            // Crea una nuova prenotazione
            Reservation reservation = new Reservation();
            reservation.setBoat(boat);
            reservation.setUser(user);
            reservation.setStartDate(startDate);
            reservation.setEndDate(endDate);
            reservation.setReservationDate(LocalDate.now());

            // Salva la prenotazione nel repository
            return reservationRepository.save(reservation);
        } else {
            throw new IllegalArgumentException("Barca o utente non trovato con gli ID specificati");
        }
    }

    public Reservation updateReservation(Long reservationId, Long boatId, Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        Optional<Reservation> optionalReservation = reservationRepository.findById(reservationId);
        if (optionalReservation.isPresent()) {
            Reservation reservation = optionalReservation.get();

            if (boatId != null) {
                Optional<Boat> optionalBoat = boatRepository.findById(boatId);
                optionalBoat.ifPresent(reservation::setBoat);
            }

            if (userId != null) {
                Optional<User> optionalUser = userRepository.findById(userId);
                optionalUser.ifPresent(reservation::setUser);
            }

            if (startDate != null) {
                reservation.setStartDate(startDate);
            }

            if (endDate != null) {
                reservation.setEndDate(endDate);
            }

            return reservationRepository.save(reservation);
        } else {
            throw new IllegalArgumentException("Prenotazione non trovata con l'ID specificato");
        }
    }


    public List<Reservation> getAllReservation() {
        return reservationRepository.findAll();
    }

    public List<Reservation> getReservationsByBoatId(Long boatId) {
        return reservationRepository.findByBoatId(boatId);
    }


    public void deleteReservationById(Long id) {
        Optional<Reservation> reservationOptional = reservationRepository.findById(id);
        if (reservationOptional.isPresent()) {
            reservationRepository.delete(reservationOptional.get());
        } else {
            throw new IllegalArgumentException("Prestito non trovato con ID: " + id);
        }
    }

}

