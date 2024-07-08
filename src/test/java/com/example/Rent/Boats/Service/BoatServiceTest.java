package com.example.Rent.Boats.Service;

import com.example.Rent.Boats.Entity.Boat;
import com.example.Rent.Boats.Repository.BoatRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class BoatServiceTest {

    @Mock
    private BoatRepository boatRepository;

    @InjectMocks
    private BoatService boatService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testAddBoat() {
        Boat boat = new Boat();
        boat.setName("Test Boat");

        when(boatRepository.save(boat)).thenReturn(boat);

        Boat result = boatService.addBoat(boat);

        assertNotNull(result);
        assertEquals("Test Boat", result.getName());
        verify(boatRepository, times(1)).save(boat);
    }

    @Test
    void testGetAllBoats() {
        Boat boat1 = new Boat();
        boat1.setName("Boat 1");

        Boat boat2 = new Boat();
        boat2.setName("Boat 2");

        when(boatRepository.findAll()).thenReturn(Arrays.asList(boat1, boat2));

        List<Boat> result = boatService.getAllBoats();

        assertEquals(2, result.size());
        assertEquals("Boat 1", result.get(0).getName());
        assertEquals("Boat 2", result.get(1).getName());
        verify(boatRepository, times(1)).findAll();
    }

    @Test
    void testGetBoatById() {
        Long boatId = 1L;
        Boat boat = new Boat();
        boat.setId(boatId);
        boat.setName("Test Boat");

        when(boatRepository.findById(boatId)).thenReturn(Optional.of(boat));

        Optional<Boat> result = boatService.getBoatById(boatId);

        assertTrue(result.isPresent());
        assertEquals("Test Boat", result.get().getName());
        verify(boatRepository, times(1)).findById(boatId);
    }

    @Test
    void testUpdateBoat() {
        Long boatId = 1L;
        Boat existingBoat = new Boat();
        existingBoat.setId(boatId);
        existingBoat.setName("Existing Boat");

        Boat updatedBoat = new Boat();
        updatedBoat.setName("Updated Boat");

        when(boatRepository.findById(boatId)).thenReturn(Optional.of(existingBoat));
        when(boatRepository.save(any(Boat.class))).thenReturn(existingBoat);

        Boat result = boatService.updateBoat(boatId, updatedBoat);

        assertNotNull(result);
        assertEquals("Updated Boat", result.getName());
        verify(boatRepository, times(1)).findById(boatId);
        verify(boatRepository, times(1)).save(existingBoat);
    }

    @Test
    void testDeleteBoatById() {
        Long boatId = 1L;
        Boat boat = new Boat();
        boat.setId(boatId);

        when(boatRepository.findById(boatId)).thenReturn(Optional.of(boat));

        boatService.deleteBoatById(boatId);

        verify(boatRepository, times(1)).findById(boatId);
        verify(boatRepository, times(1)).delete(boat);
    }

    @Test
    void testUpdateBoatNotFound() {
        Long boatId = 1L;
        Boat updatedBoat = new Boat();
        updatedBoat.setName("Updated Boat");

        when(boatRepository.findById(boatId)).thenReturn(Optional.empty());

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            boatService.updateBoat(boatId, updatedBoat);
        });

        assertEquals("Barca non trovata con ID: " + boatId, exception.getMessage());
        verify(boatRepository, times(1)).findById(boatId);
        verify(boatRepository, never()).save(any(Boat.class));
    }

    @Test
    void testDeleteBoatByIdNotFound() {
        Long boatId = 1L;

        when(boatRepository.findById(boatId)).thenReturn(Optional.empty());

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            boatService.deleteBoatById(boatId);
        });

        assertEquals("Utente non trovato con ID: " + boatId, exception.getMessage());
        verify(boatRepository, times(1)).findById(boatId);
        verify(boatRepository, never()).delete(any(Boat.class));
    }
}
