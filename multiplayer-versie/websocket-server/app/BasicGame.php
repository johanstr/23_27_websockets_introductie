<?php
namespace App;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use SplObjectStorage;
use stdClass;

class BasicGame implements MessageComponentInterface
{
   protected const WINNING_POINTS = 2;         // Points to be gained when a player wins a round
   protected const DRAW_POINTS = 1;            // Points to be gained by both players in case of a draw
   
   protected const PLAYER_1 = 1;               // Player 1 number
   protected const PLAYER_2 = 2;               // Player 2 number
   
   // Possible commands in the communication
   public const CMD_ROOM_FULL = 0;             // Refuse connection because room is full
   public const CMD_START_GAME = 1;            // Game is starting, with starting player info
   public const CMD_YOUR_PLAYER_NUM = 2;       // For a new connection we send this
   public const CMD_WAITING_FOR_PLAYER = 3;    // If we only have one connection we send this
   public const CMD_RESET_GAME = 4;            // Reset the  game (NOT IMPLEMENTED YET)

   public const CMD_PLAYER_MOVE = 5;           // Info about the move of the other player
   public const CMD_NEW_ROUND = 6;             // Send when new round starts
   public const CMD_IS_WIN = 7;                // Send when there is a winner
   public const CMD_IS_DRAW = 8;               // Send when there is a draw
   public const CMD_PLAYER_TURN = 9;           // Send switch of player turn

   public const CMD_DEBUG = 99;                // Only for debug purposes, send all data

   // Client Data
   protected SplObjectStorage $clients;            // Stores the connection of connected players
   protected int $client_count = 0;                // Counting how many clients are connected

   // Game Data
   protected array $scores = [                     // Scores of the two players
      0,                                          // Score of player 1
      0                                           // Score of player 2
   ];
   protected int $round = 0;                       // Round number
   protected int $current_player = 0;              // Which player has the turn
   /*
   * game_board
   * Contains:
   *      0   if cell is empty and available for usage by a player
   *      1   Cell is occupied by player 1
   *      2   Cell is occupied by player 2
   */
   protected array $game_board = [
      0, 0, 0,                                    // Row 0 and Columns 0, 1, 2
      0, 0, 0,                                    // Row 1 and Columns 3, 4, 5
      0, 0, 0                                     // Row 2 and Columns 6, 7, 8
   ];
   
   /*
   * Constructor
   * -----------
   * Creates an SplObjectStorage object to store connected clients
   */
   public function __construct() 
   {
      $this->clients = new SplObjectStorage;
   }

   /**
    * Shows terminal messages with color
    * A string may contain color directives:
    *          @error......@endcolor       Red
    *          @success....@endcolor       Green
    *          @warning....@endcolor       Yellow
    *          @info....@endcolor          Cyan
    *          @accent....@endcolor        Light Magenta
    * @param string $str       String to show
    * @param string $type      Type of message
    *
    * @return void
    */
   private function colorLog(string $str, string $type = 'i') : void
   {
      $str = str_replace('@error', "\033[31m", $str);
      $str = str_replace('@warning', "\033[33m", $str);
      $str = str_replace('@success', "\033[32m", $str);
      $str = str_replace('@info', "\033[36m", $str);
      $str = str_replace('@accent', "\033[93m", $str);

      switch ($type) {
         case 'e':                               // Error
               $str = str_replace('@endcolor', "\033[0m\033[31m", $str);
               echo "\033[31m$str \033[0m\n";      // Red
               break;
         case 's':                               // Success
               $str = str_replace('@endcolor', "\033[0m\033[32m", $str);
               echo "\033[32m$str \033[0m\n";      // Green
               break;
         case 'w':                               // Warning
               $str = str_replace('@endcolor', "\033[0m\033[33m", $str);
               echo "\033[33m$str \033[0m\n";      // Yellow
               break;
         case 'i':                               // Info
               $str = str_replace('@endcolor', "\033[0m\033[36m", $str);
               echo "\033[36m$str \033[0m\n";      // Cyan
               break;
         case 'a':                               // Accent
               $str = str_replace('@endcolor', "\033[0m\033[93m", $str);
               echo "\033[93m$str \033[0m\n";      // Light Yellow
               break;
         default:
               # code...
               break;
      }
   }

   /**
    * Determines randomly the player who gets the first turn in a round/game
    * @return int
    */
   private function determineStartingPlayer() : int
   {
      return rand(1,2);
   }


   /**
    * Send the complete package to all clients
    *
    * @param array $msg    Contains specific info for a specific command
    *
    * @return void
    */
   private function sendToAll(array $msg) : void
   {
      $msg_struct = [
         'state' => [
               'scores' => $this->scores,
               'round' => $this->round,
               'current_player' => $this->current_player
         ],
         'data' => $msg
      ];
      
      foreach ($this->clients as $client) {
         $client->conn->send(json_encode($msg_struct));
      }
   }

   /**
    * Sends a complete package of info to a specific client
    *
    * @param ConnectionInterface $client   Client connection to send the package to
    * @param array $msg                    Specific info for specific command
    *
    * @return void
    */
   private function sendToClient(ConnectionInterface $client, array $msg) : void
   {
      $msg_struct = [
         'state' => [
               'scores' => $this->scores,
               'round' => $this->round,
               'current_player' => $this->current_player
         ],
         'data' => $msg
      ];

      if($client) {
         $client->send(json_encode($msg_struct));
      }
   }

   /**
    * Event Handling method. This method is called when a connection is made with the server.
    *
    * @param ConnectionInterface $conn     Websocket connection object
    *
    * @return void
    */
   public function onOpen(ConnectionInterface $conn) : void
   {
      // As long as we have less then 2 connections already registered it's ok to proceed
      if($this->clients->count() < 2) {
         // Increase the count of connected clients, this property determines also the new
         // player number for the new connected client
         $this->client_count++;

         // In a Standard PHP Class we save the connection info
         $new_client = new stdClass();
         $new_client->conn = $conn;
         $new_client->player_num = $this->client_count;

         // We attach the new client in clients property
         $this->clients->attach($new_client);

         // We send the new player number to the just connected and registered player
         $this->sendToClient($conn, [
               'command' => self::CMD_YOUR_PLAYER_NUM,
               'player_num' => $this->client_count,
               'message' => "Connected with resource id: {$conn->resourceId} and player number is {$this->client_count}"
         ]);
         // Terminal message
         $this->colorLog("New connection with ID: @accent{$conn->resourceId}@endcolor and Player number: @accent{$this->client_count}@endcolor");

         /*
            * Now we check if we already have two connected clients. If so we can start the game and will send
            * both clients the notification
            */
         if($this->clients->count() === 2) {
               $this->current_player = $this->determineStartingPlayer();   // Determine the player who can begin
               $this->round = 1;                                           // We start with round 1

               // Send start game to initialize the clients
               $this->sendToAll([
                  'command' => self::CMD_START_GAME,
                  'message' => "Game started..."
               ]);
               // Terminal message
               $this->colorLog("Game started");
         } else {
               /*
               * We don't have two connected clients yet. So we send the already connected client the notification
               * that we are still waiting for another player.
               */
               $this->sendToClient($conn, [
                  'command' => self::CMD_WAITING_FOR_PLAYER,
                  'message' => "Waiting for another player..."
               ]);
               // Terminal message
               $this->colorLog("Waiting for another player...", 'w');
         }
      } else {
         /*
            * Someone tries to connected while we already have to connected clients.
            * We send this client the message that the room is full and close the connection
            * to this client.
            */
         $message = [
               'command' => self::CMD_ROOM_FULL,
               'message' => 'Connection refused. Gameroom is full'
         ];
         // Terminal message
         $this->colorLog("Connection refused for @accent{$conn->resourceId}@endcolor, game room is full", 'e');

         // Send the notification
         $conn->send(json_encode($message));
         // Close the connection
         $conn->close();
      }
   }

   /**
    * Send a new round info package to all the connected clients
    *
    * @param $player_num
    *
    * @return void
    */
   protected function sendNewRound($player_num) : void
   {
      // Send message for new round
      $this->round++;                 // Increase round number
      // Determine which player has the turn for this new round
      $this->current_player = ($player_num === self::PLAYER_1 ? self::PLAYER_2 : self::PLAYER_1);

      // Send the package
      $this->sendToAll([
         'command' => self::CMD_NEW_ROUND,
         'message' => "Round {$this->round} started"
      ]);
      // Terminal message
      $this->colorLog("Round @accent{$this->round}@endcolor started");
   }

   /**
    * Send to all the connected clients that we have a winner
    *
    * @param $player_num
    *
    * @return void
    */
   protected function sendWinningState($player_num) : void
   {
      // Increase score of the winning player
      $this->scores[$player_num - 1] += self::WINNING_POINTS;

      // Send the package
      $this->sendToAll([
         'command' => self::CMD_IS_WIN,
         'player_num' => $player_num,
         'message' => "Player {$player_num} has won the round"
      ]);
      // Terminal message
      $this->colorLog("Player @accent{$player_num}@endcolor has won the round", 's');

      // Clear the gameboard of the server
      $this->clearGameBoard();

      // Start a new round and send the package
      $this->sendNewRound($player_num);
   }

   /**
    * Checks the gameboard for a winner
    *
    * @return int  Player number of the player who has won
    */
   protected function checkForWinner() : int
   {
      $player_num = 0;
      if($this->game_board[0] === $this->game_board[1] && $this->game_board[1] === $this->game_board[2]) {        // Horizontal
         $player_num = $this->game_board[0];
      } elseif($this->game_board[3] === $this->game_board[4] && $this->game_board[4] === $this->game_board[5]) {  // Horizontal
         $player_num = $this->game_board[3];
      } elseif($this->game_board[6] === $this->game_board[7] && $this->game_board[7] === $this->game_board[8]) {  // Horizontal
         $player_num = $this->game_board[6];
      } elseif($this->game_board[0] === $this->game_board[3] && $this->game_board[3] === $this->game_board[6]) {  // Vertical
         $player_num = $this->game_board[0];
      } elseif($this->game_board[1] === $this->game_board[4] && $this->game_board[4] === $this->game_board[7]) {  // Vertical
         $player_num = $this->game_board[1];
      } elseif($this->game_board[2] === $this->game_board[5] && $this->game_board[5] === $this->game_board[8]) {  // Vertical
         $player_num = $this->game_board[2];
      } elseif($this->game_board[0] === $this->game_board[4] && $this->game_board[4] === $this->game_board[8]) {  // Diagonal
         $player_num = $this->game_board[0];
      } elseif($this->game_board[2] === $this->game_board[4] && $this->game_board[4] === $this->game_board[6]) {  // Diagonal
         $player_num = $this->game_board[2];
      }

      return $player_num;
   }

   /**
    * Send to both clients that we have a draw
    *
    * @return void
    */
   protected function sendDrawState() : void
   {
      // Both players get points
      $this->scores[0] += self::DRAW_POINTS;
      $this->scores[1] += self::DRAW_POINTS;

      // Send the package
      $this->sendToAll([
         'command' => self::CMD_IS_DRAW,
         'message' => "Game draw, no winner"
      ]);
      // Terminal message
      $this->colorLog("Game draw, no winner", 's');

      // Clear the gameboard of the server
      $this->clearGameBoard();

      // Start a new round and send the package to both clients
      $this->sendNewRound($this->current_player);
   }

   /**
    * Clear the gameboard of the server
    *
    * @return void
    */
   protected function clearGameBoard() : void
   {
      for($i = 0; $i < 9; $i++)
         $this->game_board[$i] = 0;
   }

   /**
    * Check if we have a draw
    * As long as we have at least one empty cell we do not have a draw
    *
    * @return bool     True - We have a draw, every cell in the board is occupied
    */
   protected function checkForDraw() : bool
   {
      // We only need to check if there is still an empty cell
      for($i = 0; $i < 9; $i++) {
         if($this->game_board[$i] === 0)
               return false;           // No, we have an empty cell left on the board
      }

      return true;                    // Yes, all cells are occupied
   }

   /**
    * Send a package to all the clients to tell them that another player has the turn
    *
    * @return void
    */
   protected function sendPlayerTurnSwitch() : void
   {
      // Switch of player turn
      $this->current_player = ($this->current_player === self::PLAYER_1 ? self::PLAYER_2 : self::PLAYER_1);

      // Send the package
      $this->sendToAll([
         'command' => self::CMD_PLAYER_TURN,
         'message' => "Turn goes to player {$this->current_player}"
      ]);

      // terminal message
      $this->colorLog("Turn goes to player @accent{$this->current_player}@endcolor");
   }

   /**
    * Sends a package with player move info to all clients
    *
    * @param stdClass $command_data    Contains info about the cell clicked and the player number
    *
    * @return void
    */
   protected function sendPlayerMove(stdClass $command_data) : void
   {
      // Set the cell to the player who clicked it
      $this->game_board[$command_data->cell] = $command_data->player_num;

      // Send the package
      $this->sendToAll([
         'command' => self::CMD_PLAYER_MOVE,
         'cell' => $command_data->cell,
         'player_num' => $command_data->player_num,
         'message' => "Player {$command_data->player_num} clicked on cell {$command_data->cell}"
      ]);

      // Terminal message
      $this->colorLog("Player @accent{$command_data->player_num}@endcolor clicked on cell @accent{$command_data->cell}@endcolor");

      // We switch turn and send the package
      $this->sendPlayerTurnSwitch();
   }

   /**
    * Event handling method for web sockets
    * Every message send by clients will be handled by this method
    *
    * @param ConnectionInterface $from     Connection from whom the message comes
    * @param string $msg                   Message in JSON-string format
    *
    * @return void
    */
   public function onMessage(ConnectionInterface $from, $msg) : void
   {
      // We first have to decode the JSON-string and make a stdClass of the message
      $client_command = json_decode($msg);

      // Check which command is send by a client
      switch($client_command->command) {
         case self::CMD_PLAYER_MOVE:                         // A player did a move on the board
               $this->sendPlayerMove($client_command);
               
               // Checking if there is a winner
               if($player_num = $this->checkForWinner()) {
                  // Send winning state with new round
                  $this->sendWinningState($player_num);
               } elseif($this->checkForDraw()) {
                  // Send draw state with new round
                  $this->sendDrawState();
               }
               break;

               // For future expansions the switch - case is chosen
         default:
               break;
      }
   }

   /**
    * Event handling method
    * Responds to a closing connection event.
    *
    * @param ConnectionInterface $conn
    *
    * @return void
    */
   public function onClose(ConnectionInterface $conn) : void
   {
      // @TODO The connection is closed, remove it, as we can no longer send it messages.
      // @TODO Check if the closed connection is one of the players

      // @TODO If so we send WAITING FOR PLAYER to the other player

      // @TODO Otherwise just close the connection

      // Detach the client from the registration
      $this->clients->detach($conn);              // @TODO Needs to be adjusted to our needs

      // Terminal message
      $this->colorLog("Connection @accent{$conn->resourceId}@endcolor has disconnected", 'w');
   }

   /**
    * Event Handling method
    * Handles error events
    *
    * @param ConnectionInterface $conn     Which connection caused the error
    * @param \Exception $e                 Error info
    *
    * @return void
    */
   public function onError(ConnectionInterface $conn, \Exception $e) : void
   {
      $this->colorLog("An error has occurred: {$e->getMessage()}", 'e');

      $conn->close();
   }
}