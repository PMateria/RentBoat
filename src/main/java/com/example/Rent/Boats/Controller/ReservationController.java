package com.example.Rent.Boats.Controller;

import com.example.Rent.Boats.DTO.ReservationRequest;
import com.example.Rent.Boats.Entity.Boat;
import com.example.Rent.Boats.Entity.Reservation;
import com.example.Rent.Boats.Service.BoatService;
import com.example.Rent.Boats.Service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/Reservation")
public class ReservationController {

    private final ReservationService reservationService;

    @Autowired
    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

        @PostMapping("/addReservation")
        public ResponseEntity<Reservation> addReservation(@RequestBody ReservationRequest request) {
            try {
                Reservation reservation = reservationService.addReservation(
                        request.getBoatId(),
                        request.getUserId(),
                        request.getStartDate(),
                        request.getEndDate()
                );
                return ResponseEntity.ok(reservation);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }

    @GetMapping("/allReservation")
    public ResponseEntity<List<Reservation>> getAllReservation() {
        List<Reservation> reservations = reservationService.getAllReservation();
        return ResponseEntity.ok(reservations);
    }

    @PutMapping("/updateReservation/{id}")
    public ResponseEntity<Reservation> updateReservation(@PathVariable Long id, @RequestBody ReservationRequest request) {
        try {
            Reservation reservation = reservationService.updateReservation(
                    id,
                    request.getBoatId(),
                    request.getUserId(),
                    request.getStartDate(),
                    request.getEndDate()
            );
            return ResponseEntity.ok(reservation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/byBoatId/{boatId}")
    public ResponseEntity<List<Reservation>> getReservationsByBoatId(@PathVariable("boatId") Long boatId) {
        List<Reservation> reservations = reservationService.getReservationsByBoatId(boatId);
        if (reservations.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(reservations);
    }


    @DeleteMapping("delete/{id}")
    public ResponseEntity<String> deleteReservationById(@PathVariable Long id) {
        try {
            reservationService.deleteReservationById(id);
            return ResponseEntity.ok("Prestito cancellato con successo");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}




