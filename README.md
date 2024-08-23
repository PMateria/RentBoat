# RentBoat Application
[![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)](https://github.com/tuo-username/tuo-progetto/releases)

## Descrizione

RentBoat è un'applicazione web progettata per il noleggio di barche. Consente agli utenti di prenotare barche per periodi specifici attraverso un'interfaccia intuitiva basata su calendario. L'app è configurata per soddisfare le esigenze sia degli utenti finali che degli amministratori, rendendo il processo di noleggio semplice ed efficace.

## Caratteristiche Principali

### Prenotazione Barche:
Gli utenti possono facilmente selezionare la data e l'ora di inizio e fine del noleggio direttamente nel calendario integrato.

### Autenticazione Utente:

### Supporto per due tipi di utenti:

### User: Può cercare e prenotare barche.

### Admin: Ha accesso a funzionalità avanzate come:

1. Inserimento e cancellazione di barche.

2. Eliminazione di utenti.

3. Visualizzazione dei noleggi effettuati tramite grafici interattivi.

4. Grafici Interattivi: Utilizza React per visualizzare in modo dinamico e intuitivo i dati relativi ai noleggi.


Backend Robusto: Sviluppato in Java utilizzando il framework Spring Boot e gestito con un database MySQL.

Sicurezza Avanzata: Implementazione di JWT (JSON Web Token) per gestire l'autenticazione e la sicurezza, insieme alla gestione dei ruoli tramite Spring Security.

## Prerequisiti

```
Assicurati di avere installato i seguenti requisiti:

Java: Versione 11 o superiore.

Node.js: Per il backend e il frontend.

MySQL: Sistema di gestione di database relazionali.
```

## Installazione

Segui questi passaggi per installare e avviare l'applicazione:

- [JDK 8+](https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html)
- [IntelliJ IDEA](https://www.jetbrains.com/idea/)

## Clona la repository:


1. git clone https://github.com/PMateria/RentBoat.git
2. cd RentBoat

## Crea il database:

Assicurati di creare un database in MySQL chiamato rentboats. Una volta creato il database, le rispettive tabelle verranno create e aggiornate automaticamente.


```

spring.jpa.hibernate.ddl-auto=update


Più nello specifico:

update: Hibernate (il provider JPA predefinito in Spring Boot) confronta il modello delle entità con il database esistente e applica le modifiche necessarie per allineare il database con il modello. Se mancano tabelle o colonne, verranno aggiunte; se ci sono campi obsoleti, non verranno rimossi, quindi è importante usare update con cautela in ambienti di produzione.
```

## Configura il database:

Modifica il file src/main/resources/application.properties per inserire le tue credenziali MySQL:


1. spring.datasource.url=jdbc:mysql://localhost:3306/rentboats
2. spring.datasource.username=YOUR_USERNAME
3. spring.datasource.password=YOUR_PASSWORD
```

## Costruisci e avvia l'applicazione:

### Backend:

1. Apri un terminale nella directory del backend.
2. Usa Maven per avviare il server: (mvn spring-boot:run)

### Frontend:

Apri un altro terminale nella directory del frontend.
Installa le dipendenze e avvia il server HTTP:
npm install,
npm start
```
Si può avviare sia il Backend che il Frontend con il comando npm start.


## Accesso all'applicazione:

Una volta avviata l'applicazione, naviga su http://localhost:8081 per accedere all'interfaccia utente.

## Struttura dei Pacchetti

### L'applicazione è organizzata come segue:

### Backend: 
Contiene il codice Java per il server e le logiche di business, inclusi i Controller, i service e i repository, il backand è stato strutturato secondo pattern MVC (Model-View-Controller)

### Frontend:
Comporta il codice React responsabile per la visualizzazione dei grafici.

## Autorizzazioni

Assicurati di gestire le autorizzazioni per gli utenti in base ai loro ruoli (User o Admin). Puoi configurare le regole di accesso nel file di configurazione di Spring Security.

## Licenza

Questo progetto è per uso didattico e non a scopo di lucro, ma solo ed esclusivamente per esercitazioni .

## Contributi

Se desideri contribuire al progetto, sei invitato a inviare una Pull Request. Sarà molto apprezzato!

## Link alla Repository

Puoi trovare la repository su GitHub all'indirizzo:
https://github.com/PMateria/RentBoat/tree/BE_FE


Spero che queste informazioni siano utili per gli sviluppatori e gli utenti che desiderano utilizzare o contribuire al progetto RentBoat!