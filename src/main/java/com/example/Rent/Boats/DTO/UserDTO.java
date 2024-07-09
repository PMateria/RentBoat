package com.example.Rent.Boats.DTO;

import com.example.Rent.Boats.Entity.User;

public class UserDTO {
    private Long id;
    private String username;
    private String email;
    // Aggiungi altri campi se necessario
    private String role;
    public UserDTO() {
        // Costruttore vuoto necessario per deserializzazione JSON
    }

    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        // Inizializza altri campi se necessario
    }

    // Getter e setter

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

}
