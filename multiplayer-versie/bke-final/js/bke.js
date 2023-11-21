/***************************************************
 * bke.js
 * -------------------------------------------------
 * In dit bestand staat alle javascript code
 * om ons spel te laten werken.
 *
 **************************************************/

// SERVER COMMANDS
const CMD_ROOM_FULL = 0;            // Connection refused

const CMD_START_GAME = 1;           // Game started, starting player determined by server
const CMD_YOUR_PLAYER_NUM = 2;      // My player number
const CMD_WAITING_FOR_PLAYER = 3;   // Waiting for a second player to connect to server
const CMD_RESET_GAME = 4;           // Reset the game

const CMD_PLAYER_MOVE = 5;          // SEND: I make a move on the gameboard
                                    // RECEIVE: other player makes a move
const CMD_NEW_ROUND = 6;            // New round started
const CMD_IS_WIN = 7;               // We have a winner
const CMD_IS_DRAW = 8;              // It's a draw
const CMD_PLAYER_TURN = 9;          // We switch player turn

// LOCAL DATA
let my_player_num = 1;      // Player number given by the server
let current_player = 0;     // Number of the player who's turn it is
let cellen;                 // Alle cellen van het speelveld
let game_messages;          // Shows game messages, for example from server
let beurt_num;              // Nummer van de speler die aan de beurt is
let beurt_img;              // Afbeelding van de speler die aan de beurt is
let score_speler1;          // Hier houden we de score van speler 1 bij, getal
let score_speler2;          // Hier houden we de score van speler 2 bij, getal
let ronde;                  // Welke ronde is het, een getal
let ronde_info;             // Het element in mijn html waarin ik aangeef welke
                            // ronde we spelen.
let timer_info;             // Ronde tijd
let timerID;                // ID van de interval
let elapsedTimeInSeconds;   // Tijd in seconden
let score_speler1_info;     // Het element waarin we de score laten zien van speler 1
let score_speler2_info;     // Het element waarin we de score laten zien van speler 2
let name_player_1;          // Element with the name of player 1
let name_player_2;          // Element with the name of player 2

// LOCAL CONSTANTS
const _PLAYER1 = 1;         // Constante, waarde gaat nooit veranderen. Speler 1
const _PLAYER2 = 2;         // Constante, waarde gaat nooit veranderen. Speler 2
const _EMPTY = 0;           // Constante, waarde gaat nooit veranderen. Leeg
const _DRAW = 3;            // Constante, waarde gaat nooit veranderen. Gelijk spel
const _CONTINUE_GAME = -1;  // Constante, waarde gaat nooit veranderen. Doorgaan met spelen

//               _EMPTY = 0        _PLAYER1 = 1      _PLAYER2 = 2
const _IMAGES = [ 'img/empty.jpg', 'img/cross.jpg', 'img/circle.jpg' ];

// SERVER CONNECTION, Here we make the connection to the server and save the connection in a global variable
const socket = new WebSocket('ws://localhost:3001');

/*
 * Dit is de functie die aan het begin gelijk wordt uitgevoerd.
 * We zorgen in deze functie voor het volgende:
 * - Elementen uit de HTML ophalen en beschikbaar stellen in JavaScript (caching)
 * - Click events toevoegen aan cellen en de button
 */
window.onload = function() {

   // Connection opened
   socket.addEventListener('open', onOpenConnectionToServer);

   // Listen for messages from server
   socket.addEventListener('message', onMessageFromServer);

   // Listen for closing events from the server
   socket.addEventListener('close', onCloseConnectionToServer);

   // Cellen = Our local gameboard (name of variable is remnant of old code
   cellen = document.querySelectorAll('#speelveld table tr td img');
   // Element in which we show the text messages from the server
   game_messages = document.querySelector('.game-messages');
   // Elements in which we show who's turn it is (names are remnants of old code)
   beurt_num = document.querySelector('.players-turn tr td:last-child');
   beurt_img = document.querySelector('.players-turn tr td:first-child img');
   // Element to show the round on screen (name if remnant of old code)
   ronde_info = document.querySelector('.rounds-info tr:last-child td:last-child');
   // Elements to show the scores of both players (names are remnants of old code)
   score_speler1_info = document.querySelector('.rounds-info tr:first-child td:last-child');
   score_speler2_info = document.querySelector('.rounds-info tr:nth-child(2) td:last-child');
   // Element to show the round timer (old code)
   timer_info = document.querySelector('.timer');
   // Elements to show the player names on screen
   name_player_1 = document.querySelector('#name_player_1');
   name_player_2 = document.querySelector('#name_player_2');

   timerID = null;
   elapsedTimeInSeconds = 0;
};

/*
   Shows the message received from the server on screen
 */
function setMessage(msg)
{
   game_messages.innerHTML = msg + '<br />' + game_messages.innerHTML;
}

/*
   This function is called when a connection to the server is honored
 */
function onOpenConnectionToServer(event)
{
   setMessage("Connected to server");
}

/*
   This function is called when our connection is closed
 */
function onCloseConnectionToServer(event)
{
   setMessage('Connection to server closed');
}

/*
   Shows all the game info on screen
 */
function showGameState(state)
{
   // Show who's turn it is
   beurt_num.innerHTML = state.current_player;
   beurt_img.src = _IMAGES[state.current_player];

   // Show the round number
   ronde_info.innerHTML = state.round;

   // Show the current scores
   score_speler1_info.innerHTML = state.scores[0];
   score_speler2_info.innerHTML = state.scores[1];
}

/*
   When we receive a message from the server this function is automatically called.
   This function handles all the messages.

   The parameter event holds all the info
 */
function onMessageFromServer(event)
{
   // First transform the received JSON-string to a JSON-object
   let command_data = JSON.parse(event.data);

   // Now we check which command is send by the server and we act accordingly
   switch(command_data.data.command) {
      case CMD_ROOM_FULL:                     // No connection made because max clients reached on server
         // Show message that the connection was refused
         setMessage(command_data.data.message);
         break;

      case CMD_YOUR_PLAYER_NUM:               // We get our player number from the server
         // Save our given player number
         my_player_num = command_data.data.player_num;

         // Show on screen which player number we have
         if(my_player_num === 1)
               name_player_1.innerHTML = "Player 1 - You";
         else
               name_player_2.innerHTML = "Player 2 - You";

         // Show the message on screen
         setMessage(command_data.data.message);
         break;

      case CMD_WAITING_FOR_PLAYER:            // Server tells us we have to wait for a second player
         // Show the message on screen
         setMessage('Waiting for another player');
         break;

      case CMD_START_GAME:                    // Game is started with round 1
         // Save which player has the turn for the round
         current_player = command_data.state.current_player;

         // Show the message on screen
         setMessage(command_data.data.message);

         // Show the correct game state info
         showGameState(command_data.state);

         // Initialize the game in this client so we can play
         initializeGame();
         break;

      case CMD_PLAYER_MOVE:               // Server confirms and sent us the move a player made
         // We only show our move or a move from the other player after we get this confirmation
         showPlayerMove(command_data);

         // Show the message on screen
         setMessage(command_data.data.message);
         break;

      case CMD_PLAYER_TURN:               // Server tells us another player gets the turn
         // Save the player who has the turn
         current_player = command_data.state.current_player;

         // Check if we have the turn
         if(current_player === my_player_num) {
               // Yes, It's our turn. Now we can activate the cell click events
               activateCellClicks();
         } else {
               // Other player has the turn, so we deactivate our cell click events
               deactivateCellClicks();
         }

         // Show the current game state info
         showGameState(command_data.state);

         // Remnant of old code
         setRoundsTimer();
         break;

      case CMD_NEW_ROUND:                 // Server tells us a new round has started
         // We reset our game client for the new round
         resetGame();

         // We show the current game state info
         showGameState(command_data.state);

         // If we have the turn
         if(current_player === my_player_num)
               // Then we activate the cell click events
               activateCellClicks();
         break;

      case CMD_IS_WIN:                    // Server tells us we have a winner
         // We reset our client
         resetGame();
         // We show the current game state info
         showGameState(command_data.state);
         // We show the message on screen
         setMessage(command_data.data.message);
         // We show an alert to inform the player of this
         alert(`Player ${command_data.data.player_num} has won this round, this player gets the max points.`);
         break;

      case CMD_IS_DRAW:                   // Server tells us we have a draw
         // We reset our client
         resetGame();
         // We show the current game state info
         showGameState(command_data.state);
         // We show the message on screen
         setMessage(command_data.data.message);
         // We show an alert to inform the player of this
         alert('This round is a draw, both players get points.');
         break;

      case CMD_RESET_GAME:                // NOT IMPLEMENTED YET
         //resetGame();
         //setMessage(command_data.data.message);
         break;
   }
}

/*
   Shows the sign in the gameboard of the player how did a move on the gameboard
 */
function showPlayerMove(command_data)
{
   /*
      command_data contains
      command                 CMD_PLAYER_MOVE
      cell                    Number of the cell
      player_num              Number of the player
      message                 Message
   */
   cellen[command_data.data.cell].src = _IMAGES[command_data.data.player_num];
}

/*
 * Ronde tijd bijhouden
 * Remnant of old code
 */
function roundsTimer() {
   let elapsedTimeInMinutes = 0;

   elapsedTimeInSeconds++;

   if(elapsedTimeInSeconds >= 60) {
      elapsedTimeInMinutes = parseInt(elapsedTimeInSeconds / 60);
      timer_info.innerHTML = '' + elapsedTimeInMinutes + ' min. ' +
                              parseInt((elapsedTimeInSeconds % 60)) + ' sec.';
   } else {
      timer_info.innerHTML = '' + elapsedTimeInSeconds + ' sec.';
   }
}

/*
   Start een ronde timer
   Remnant of old code
 */
function setRoundsTimer() {
   if(timerID != null) {
      unsetRoundsTimer();
   }
      
   timerID = setInterval( roundsTimer, 1000 );
}

/*
   Stopt een ronde timer
   Remnant of old code
 */
function unsetRoundsTimer() {
   if(timerID != null) {
      clearInterval(timerID);
      timerID = null;
      elapsedTimeInSeconds = 0;
   }
}

/*
   Activate click events on cells which are not occupied by a player yet
 */
function activateCellClicks()
{
   // First we check if we have the turn
   if(current_player === my_player_num) {
      // We have the turn
      for (let cell_num = 0; cell_num < cellen.length; cell_num++) {
         // Check if the cell is occupied by a player
         if (cellen[cell_num].src.indexOf(_IMAGES[_EMPTY]) >= 0)
               // Only activate when cell is still empty
               activateCellClick(cell_num);
      }
   }
}

/*
   Activate click event on given cell
 */
function activateCellClick(cell_num)
{
   cellen[cell_num].addEventListener('click', celClick);
}

/*
   Deactivate click event on given cell
 */
function deactivateCellClick(cell_num)
{
   cellen[cell_num].removeEventListener('click', celClick);
}

/*
   Deactivate click events on all cells
 */
function deactivateCellClicks()
{
   for(let cell_num = 0; cell_num < cellen.length; cell_num++) {
      deactivateCellClick(cell_num)
   }
}

/*
   Clear our local gameboard
 */
function clearGameBoard()
{
   for(let kolom = 0; kolom < cellen.length; kolom++) {
      cellen[kolom].src = _IMAGES[_EMPTY];
   }
}

/*
   Reset our client
 */
function resetGame()
{
   clearGameBoard();
   deactivateCellClicks();
}

/*
 * Initialize our game client
 */
function initializeGame() {
    // We start a new, so we can clear our local gameboard
   clearGameBoard();

   // Only activate click handlers when it's my turn
   activateCellClicks();

   // Remnant of old code, just for fun still active
   timer_info.innerHTML = '0 sec.';
   setRoundsTimer();
}


/*
 * Cell Click Event Handler
 */
function celClick(e) {
   // Is the cell available?
   if(e.target.src.indexOf(_IMAGES[_PLAYER1]) >= 0 || e.target.src.indexOf(_IMAGES[_PLAYER2]) >= 0)
      return;     // No, then return without doing anything

   // Determine the index in cellen of the clicked event target
   let cell_num = Array.from(cellen).indexOf(e.target);

   // Send our move to the server
   let command_data = {
      command: CMD_PLAYER_MOVE,           // Command to be sent to server
      cell: cell_num,                     // Cell number clicked
      player_num: my_player_num           // Our player number
   };
   // We now really send the command by tansforming the JSON-object to a JSON-string
   socket.send(JSON.stringify(command_data));
}


