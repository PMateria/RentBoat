package com.example.Rent.Boats.Service;

import com.example.Rent.Boats.Entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Optional;

public interface UserService {

    User register(User user);

    Optional<User> login(String username, String password);

    List<User> getAllUsers();

    ResponseEntity<String> deleteUserById(Long id);

    UserDetails loadUserByUsername(String username);
}
