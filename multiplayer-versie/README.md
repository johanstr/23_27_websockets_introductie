# Multiplayer Boter-Kaas-Eieren
### Versie 1.0
Je vindt in deze repo een demonstratie van een simpele multiplayer BKE game. 
De code is ten behoeve van lessen rondom het thema websockets met PHP en JavaScript.  
  
# Hoe haal je deze repo binnen?
Open een terminal (of commandline tool) in de map waarin je de code wil osplaan. Bij voorkeur is dit een map
in de rootmap van je lokale webserver. Voer daarna de volgende commandline opdrachten uit:  
  
```bash
    git clone https://github.com/johanstr/multiplayer-bke
```  
  
In de map multiplayer-bke vind je nu de volgende submappen:  
1. websocket-server  
In deze map vind je de code voor de server. De code is geschreven in vanilla PHP.  
   
2. bke-final  
In deze map vind je de game-client. De game-client is geschreven in JavaScript. In het bestand bke.js
   vind je de code.
     
Na het binnenhalen van de repo moet je nog wel even het volgende doen:  
* Ga naar de map websocket-server
* Tik daarna de volgende commandline opdracht in:  
```bash
    composer install
```  
Hiermee installeer je de benodigde packages. Zonder deze packages gaat de server niet werken.  

# Hoe start je de server?
Je start de server met de volgende commandline opdracht:  
```bash
    php bkeserver.php
```  
Sluit daarna je terminal venster NIET, want dan stop je de server weer. Houd dit venster dus open. 
Je kunt eveneens in dit scherm de meldingen van de server volgen.  

# De game-client
Beste is om via een lokale webserver de game-client in een browser te openen. 
LET OP!!!! Het kan soms zijn dat als je de game-client twee keer in één browser opent de tweede client geen 
verbinding kan maken met de server. Tip is dan de ene client te openen in b.v. chrome en de andere client in
b.v. firefox.

# TODO's
1. Game Info update niet volledig (SOLVED)
2. Beurt van een speler wordt niet goed aangegeven (SOLVED)
3. Na een spel te hebben gespeeld is er geen mogelijkheid een nieuwe spel te starten (SOLVED)
