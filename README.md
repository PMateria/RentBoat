<h1>Rental Boat Application</h1>

Descrizione
Questo progetto è un'applicazione di noleggio di barche sviluppata in Java, utilizzando i principi del pattern architetturale MVC (Model-View-Controller). È basato su Spring Boot per la gestione del backend, con autenticazione e autorizzazione tramite Spring Security e token JWT. Include anche test unitari con JUnit e Mockito per garantire la qualità del codice e l'integrità delle funzionalità.

Funzionalità principali
Gestione Utenti: Registrazione, login e gestione profili utente.
Gestione Barche: CRUD (Create, Read, Update, Delete) delle informazioni sulle barche disponibili per il noleggio.
Prenotazioni: Permette agli utenti registrati di prenotare barche disponibili per date specifiche.
Autenticazione e Autorizzazione: Utilizzo di Spring Security con token JWT per gestire l'autenticazione e l'autorizzazione delle API.
Tecnologie Utilizzate
Java
Spring Boot
Spring Security
JWT (JSON Web Token)
Hibernate (per la persistenza dei dati)
Database MySql (per lo sviluppo)
JUnit e Mockito (per i test unitari)
Maven (gestione delle dipendenze)
Struttura del Progetto
Il progetto è strutturato secondo il pattern MVC:

Controller: Gestisce le richieste HTTP e coordina il flusso di dati tra Model e View.
Service: Implementa la logica di business e l'interazione con il Model.
Repository: Interfaccia per l'accesso ai dati, utilizzando Hibernate per l'interazione con il database.
Model: Contiene le classi che rappresentano i dati dell'applicazione.
DTO (Data Transfer Object): Utilizzati per trasferire dati tra il frontend e il backend, garantendo un'interazione sicura e efficiente.
Setup del Progetto
Clonare il repository:
git clone https://github.com/PMateria/RentBoat.git


Per l'ambiente di produzione, configurare MySQL modificando application.properties con le credenziali corrette.
Build e avvio dell'applicazione:

bash
https://github.com/PMateria/RentBoat.git
mvn clean install
java -jar target/rental-boat-0.0.1-SNAPSHOT.jar

Autori
Pietro Materia (Junior Backend Developer)