<?php 
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use App\BasicGame;

require 'vendor/autoload.php';

$server = IoServer::factory(
   new HttpServer(
      new WsServer(
         new BasicGame()
      )
   ),
   3001
);

echo "\033[33mStarting server \033[0m\n";
$server->run();




