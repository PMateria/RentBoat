package com.example.Rent.Boats.Repository;

import com.example.Rent.Boats.Entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {


    List<Reservation> findByUserId(Long userId);

    @Query("SELECT r FROM Reservation r WHERE r.boat.id = :boatId " +
            "AND ((r.startDate <= :endDate AND r.endDate >= :startDate) " +
            "OR (r.startDate >= :startDate AND r.startDate <= :endDate))")
    List<Reservation> findByBoatIdAndDateRange(
            @Param("boatId") Long boatId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
    List<Reservation> findByBoatId(Long boatId);
}
