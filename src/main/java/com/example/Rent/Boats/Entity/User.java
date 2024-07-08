package com.example.Rent.Boats.Entity;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.*;
import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name="Client")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="name")
    private String name;

    @Column(name="surname")
    private String surname;

    @Column(name="num_persons")
    private String numPersons;

    @Column(name="username")
    private String username;

    @Column(name="email", unique = true)
    private String email;
    @Column(name="password")
    private String password;

    @Column(name="iban")
    private String iban;


    public User() {}

    public User(Long id, String name, String surname, String numPersons, String username, String password, String iban, String email) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.numPersons = numPersons;
        this.username = username;
        this.password = password;
        this.iban = iban;
        this.email= email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getNumPersons() {
        return numPersons;
    }

    public void setNumPersons(String numPersons) {
        this.numPersons = numPersons;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getIban() {
        return iban;
    }

    public void setIban(String iban) {
        this.iban = iban;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
