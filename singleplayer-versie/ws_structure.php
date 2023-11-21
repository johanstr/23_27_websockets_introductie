<?php

$json_structure = [
   // STATE: De situatie waarin het spel verkeerd, Altijd aanwezig in de array
   'state' => [
      'scores'          => [0, 0],      // Array met scores, op index 0 de score van speler 1
      'round'           => 1,             // Ronde nummer
      'current_player'  => 1,             // Nummer van de speler die aan de beurt is
   ],

   // DATA: Specifieke gegevens afhankelijk van command
   'data' => [
      // Onderstaande twee gegevens zijn altijd aanwezig
      'command'         => 1,             // Nummer van de command
      'message'         => "Bericht",     // Tekst

      // Onderstaande twee gegevens worden afhankelijk van de command toegevoegd
      // Deze twee zijn dus niet altijd aanwezig (Zie handleiding)
      'player_num'      => 1,             // Nummer van de speler

      'cell'            => 0,             // Nummer van de cell in het speelveld
   ]
];

   $json_string =  json_encode($json_structure);

   $ontvangen_array = json_decode($json_string);

?>

<!DOCTYPE html>
<html lang="en">

<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Document</title>
</head>

<body>

   <script>

      let json_structuur = {
         // STATE: De situatie waarin het spel verkeerd, Altijd aanwezig in de array
         state: {
            scores: [0, 0],         // Array met scores, op index 0 de score van speler 1
            round: 1,               // Ronde nummer
            current_player: 1,      // Nummer van de speler die aan de beurt is
         },

         // DATA: Specifieke gegevens afhankelijk van command
         data: {
            // Onderstaande twee gegevens zijn altijd aanwezig
            command: 1,             // Nummer van de command
            message: "Bericht",     // Tekst

            // Onderstaande twee gegevens worden afhankelijk van de command toegevoegd
            // Deze twee zijn dus niet altijd aanwezig (Zie handleiding)
            player_num: 1,          // Nummer van de speler

            cell: 0                 // Nummer van de cell in het speelveld
         }
      };

      let json_string = JSON.stringify(json_structuur);

      let ontvangen_json_structuur = JSON.parse($json_string);

   </script>

</body>

</html>