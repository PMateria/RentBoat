package com.example.Rent.Boats.Repository;

import com.example.Rent.Boats.Entity.Boat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoatRepository extends JpaRepository<Boat, Long> {

}
