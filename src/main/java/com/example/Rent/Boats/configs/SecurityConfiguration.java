package com.example.Rent.Boats.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration  {
    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfiguration(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            AuthenticationProvider authenticationProvider
    ) {
        this.authenticationProvider = authenticationProvider;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disabilita CSRF per le API RESTful
                .cors(withDefaults()) // Abilita le configurazioni CORS definite sotto
                .authorizeHttpRequests((requests) -> requests
                        .requestMatchers("/api/register", "/api/login").permitAll() // Permetti l'accesso a /api/register e /api/login senza autenticazione
                        .requestMatchers("/api/utenti").authenticated() // Richiede autenticazione per /api/utenti
                        .requestMatchers("/api/{id}").hasRole("ADMIN")
                        .requestMatchers("/barche/addBoats").hasRole("ADMIN")
                        .requestMatchers("/barche/boats/{id}").hasRole("ADMIN")
                        .requestMatchers("/barche/**").authenticated()
                        .requestMatchers("/Reservation/**").authenticated()
                        .requestMatchers("/Reservation/delete/{id}").hasRole("ADMIN")
                        // tutte le altre rotte richiedono l'autenticazione dell'utente tramite Token JWT
                        .requestMatchers("/api/**").authenticated() // Richiedi autenticazione per tutte le altre rotte API
                        .anyRequest().authenticated() // Richiedi autenticazione per tutte le altre richieste
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Usa sessioni stateless
                )
                .authenticationProvider(authenticationProvider) // Configura il provider di autenticazione personalizzato
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class); // Aggiungi il filtro JWT prima del filtro di autenticazione di default

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of("http://localhost:8081"));
        configuration.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization","Content-Type"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
