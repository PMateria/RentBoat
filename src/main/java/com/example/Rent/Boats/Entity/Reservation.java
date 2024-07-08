package com.example.Rent.Boats.Entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "boat_id", nullable = false)
    private Boat boat;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name="reservation_date")
    private LocalDate reservationDate;

    @Column(name="start_date")
    private LocalDateTime startDate;

    @Column(name="end_date")
    private LocalDateTime endDate;

    // Costruttori, getter e setter

    public Reservation() {}

    public Reservation(Long id, Boat boat, User user, LocalDate reservationDate, LocalDateTime startDate, LocalDateTime endDate) {
        this.id = id;
        this.boat = boat;
        this.user = user;
        this.reservationDate = reservationDate;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boat getBoat() {
        return boat;
    }

    public void setBoat(Boat boat) {
        this.boat = boat;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getReservationDate() {
        return reservationDate;
    }

    public void setReservationDate(LocalDate reservationDate) {
        this.reservationDate = reservationDate;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }
}
