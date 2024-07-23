package com.example.Rent.Boats.Repository;

import com.example.Rent.Boats.Entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserId(Long id);

    List<Reservation> findByBoatId(Long boatId);
}
