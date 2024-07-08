package com.example.Rent.Boats.Controller;

import com.example.Rent.Boats.Entity.Boat;
import com.example.Rent.Boats.Entity.User;
import com.example.Rent.Boats.Service.BoatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/barche")
public class BoatController {

    private final BoatService boatService;

    @Autowired
    public BoatController(BoatService boatService) {
        this.boatService = boatService;
    }
    @PostMapping("/addBoats")
    public ResponseEntity<Boat> createBoat(@RequestBody Boat boat) {
        Boat createdBoat = boatService.addBoat(boat);
        return ResponseEntity.ok(createdBoat);
    }

    @GetMapping("/allBoats")
    public ResponseEntity<List<Boat>> getAllBoats() {
        List<Boat> boats = boatService.getAllBoats();
        return ResponseEntity.ok(boats);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Boat> getBoatById(@PathVariable Long id) {
        Optional<Boat> boatOptional = boatService.getBoatById(id);
        return boatOptional.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PutMapping("/boats/{id}")
    public ResponseEntity<Boat> updateBoat(@PathVariable Long id, @RequestBody Boat updatedBoat) {
        try {
            Boat updated = boatService.updateBoat(id, updatedBoat);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    @DeleteMapping("boats/{id}")
    public ResponseEntity<String> deleteBoatById(@PathVariable Long id) {
        try {
            boatService.deleteBoatById(id);
            return ResponseEntity.ok("Barca cancellato con successo");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}
