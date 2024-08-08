package com.example.Rent.Boats.Entity;

import jakarta.persistence.*;

@Entity
public class Boat {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    @Column(name = "name")
    private String name;

    @Column(name = "Description")
    private String description;

    @Column(name = "Places")
    private Integer places;

    @Column(name = "Price")
    private Float price;

    @Column(name = "Available")
    private Boolean available;

    @Lob
    @Column(name = "boat_image", columnDefinition = "LONGBLOB")
    private byte[] boat_image;


    public Boat() {
    }

    public Boat(Long id, String name, String description, Integer places, Float price, Boolean available, byte[] boat_image) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.places = places;
        this.price = price;
        this.available = available;
        this.boat_image = boat_image;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getPlaces() {
        return places;
    }

    public void setPlaces(Integer places) {
        this.places = places;
    }

    public Float getPrice() {
        return price;
    }

    public void setPrice(Float price) {
        this.price = price;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public byte[] getBoat_image() {
        return boat_image;
    }

    public void setBoat_image(byte[] boat_image) {
        this.boat_image = boat_image;
    }
}
