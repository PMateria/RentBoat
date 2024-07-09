package com.example.Rent.Boats.Controller;

    import com.example.Rent.Boats.DTO.UserDTO;
    import com.example.Rent.Boats.Entity.User;
    import com.example.Rent.Boats.Service.JwtService;
    import com.example.Rent.Boats.Service.UserService;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.security.core.Authentication;
    import org.springframework.security.core.GrantedAuthority;
    import org.springframework.security.core.authority.SimpleGrantedAuthority;
    import org.springframework.security.core.context.SecurityContextHolder;
    import org.springframework.security.core.userdetails.UserDetails;
    import org.springframework.web.bind.annotation.*;

    import java.util.ArrayList;
    import java.util.List;
    import java.util.Optional;
    import java.util.stream.Collectors;


@RestController
    @RequestMapping("/api")
    public class UserController {
        private final UserService userService;
        private final JwtService jwtService;

        @Autowired
        public UserController(UserService userService, JwtService jwtService) {
            this.userService = userService;
            this.jwtService = jwtService;
        }

        @PostMapping("/register")
        public ResponseEntity<UserDTO> registerUser(@RequestBody User user) {
            try {
                User savedUser = userService.register(user);
                UserDTO userDTO = new UserDTO(savedUser);
                return ResponseEntity.ok(userDTO);
            } catch (Exception e) {
                return ResponseEntity.status(500).body(null);
            }
        }

        @PostMapping("/login")
        public ResponseEntity<String> loginUser(@RequestBody User user) {
            Optional<User> loggedInUser = userService.login(user.getUsername(), user.getPassword());
            if (loggedInUser.isPresent()) {

                List<GrantedAuthority> aut = new ArrayList<GrantedAuthority>();
                aut.add(new SimpleGrantedAuthority("ROLE_" + loggedInUser.get().getRole()));
                org.springframework.security.core.userdetails.User userDetails = new org.springframework.security.core.userdetails.User(loggedInUser.get().getUsername(),loggedInUser.get().getPassword(),aut);
                String token = jwtService.generateToken(userDetails);
                System.out.println("Generated token: " + token);
                return ResponseEntity.ok(token);
            } else {
                return ResponseEntity.status(401).body("Username o password errati");
            }
        }

        @GetMapping("/utenti")
        public ResponseEntity<List<UserDTO>> getAllUsers() {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                List<User> users = userService.getAllUsers();
                List<UserDTO> userDTOs = users.stream().map(UserDTO::new).collect(Collectors.toList());
                return ResponseEntity.ok(userDTOs);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUserById(@PathVariable Long id) {
        return userService.deleteUserById(id);
    }
    }
