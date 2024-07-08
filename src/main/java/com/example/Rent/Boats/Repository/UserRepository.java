package com.example.Rent.Boats.Repository;

import com.example.Rent.Boats.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long > {
        Optional<User> findByUsername(String username);

         Optional<User> findByEmail(String email);


}