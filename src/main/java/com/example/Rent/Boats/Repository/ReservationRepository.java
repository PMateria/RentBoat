package com.example.Rent.Boats.Repository;

import com.example.Rent.Boats.Entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

}
