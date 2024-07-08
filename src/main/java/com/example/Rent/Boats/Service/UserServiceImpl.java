package com.example.Rent.Boats.Service;

import com.example.Rent.Boats.Entity.User;
import com.example.Rent.Boats.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService, UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Override
    public User register(User user) {
        try {
            // Controllo se l'username è già presente nel database
            Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
            if (existingUser.isPresent()) {
                throw new IllegalArgumentException("Username già esistente");
            }
            // Cripta la password prima di salvarla nel database
            String encodedPassword = passwordEncoder.encode(user.getPassword());
            user.setPassword(encodedPassword);

            // Salva l'utente nel database
            return userRepository.save(user);
        } catch (Exception e) {
            // Log dell'eccezione
            e.printStackTrace();
            // Puoi anche rilanciare un'eccezione più specifica o personalizzata, se necessario
            throw new RuntimeException("Errore durante la registrazione dell'utente: " + e.getMessage());
        }
    }

    @Override
    public Optional<User> login(String username, String password) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return Optional.of(user);
            } else {
                // Password non corrisponde
                return Optional.empty();
            }
        } else {
            // Utente non trovato
            return Optional.empty();
        }
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void deleteUserById(Long id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            userRepository.delete(userOptional.get());
        } else {
            throw new IllegalArgumentException("Utente non trovato con ID: " + id);
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        return org.springframework.security.core.userdetails.User
                .withUsername(user.get().getUsername())
                .password(user.get().getPassword())
                .roles("USER") // Puoi specificare i ruoli dell'utente qui
                .build();
    }
}
