const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Create HTTP server for serving static files
const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;
  if (filePath === './') filePath = './index.html';
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Game rooms storage
const gameRooms = new Map();

class GameRoom {
  constructor(roomId) {
    this.roomId = roomId;
    this.players = [];
    this.board = ['', '', '', '', '', '', '', '', ''];
    this.currentPlayer = 'X';
    this.gameActive = false;
    this.spectators = [];
  }

  addPlayer(ws, playerName) {
    if (this.players.length < 2) {
      const player = {
        ws,
        name: playerName,
        symbol: this.players.length === 0 ? 'X' : 'O',
        id: Date.now() + Math.random()
      };
      this.players.push(player);
      
      if (this.players.length === 2) {
        this.gameActive = true;
        this.broadcastToRoom({
          type: 'gameStart',
          players: this.players.map(p => ({ name: p.name, symbol: p.symbol })),
          currentPlayer: this.currentPlayer
        });
      }
      
      return player;
    }
    return null;
  }

  addSpectator(ws, spectatorName) {
    const spectator = {
      ws,
      name: spectatorName,
      id: Date.now() + Math.random()
    };
    this.spectators.push(spectator);
    return spectator;
  }

  removePlayer(ws) {
    this.players = this.players.filter(p => p.ws !== ws);
    this.spectators = this.spectators.filter(s => s.ws !== ws);
    
    if (this.players.length < 2) {
      this.gameActive = false;
      this.broadcastToRoom({
        type: 'playerDisconnected',
        message: 'A player disconnected. Waiting for new players...'
      });
    }
  }

  makeMove(playerWs, index) {
    if (!this.gameActive) return false;
    
    const player = this.players.find(p => p.ws === playerWs);
    if (!player || player.symbol !== this.currentPlayer) return false;
    
    if (this.board[index] !== '') return false;
    
    this.board[index] = this.currentPlayer;
    
    const winner = this.checkWinner();
    const isDraw = this.board.every(cell => cell !== '');
    
    if (winner || isDraw) {
      this.gameActive = false;
      this.broadcastToRoom({
        type: 'gameEnd',
        board: this.board,
        winner: winner,
        isDraw: isDraw && !winner,
        winnerName: winner ? player.name : null
      });
    } else {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      this.broadcastToRoom({
        type: 'move',
        board: this.board,
        currentPlayer: this.currentPlayer,
        moveBy: player.name
      });
    }
    
    return true;
  }

  checkWinner() {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    
    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return this.board[a];
      }
    }
    return null;
  }

  resetGame() {
    this.board = ['', '', '', '', '', '', '', '', ''];
    this.currentPlayer = 'X';
    this.gameActive = this.players.length === 2;
    
    this.broadcastToRoom({
      type: 'gameReset',
      board: this.board,
      currentPlayer: this.currentPlayer
    });
  }

  broadcastToRoom(message) {
    [...this.players, ...this.spectators].forEach(participant => {
      if (participant.ws.readyState === WebSocket.OPEN) {
        participant.ws.send(JSON.stringify(message));
      }
    });
  }

  getRoomInfo() {
    return {
      roomId: this.roomId,
      players: this.players.map(p => ({ name: p.name, symbol: p.symbol })),
      spectators: this.spectators.map(s => ({ name: s.name })),
      gameActive: this.gameActive,
      currentPlayer: this.currentPlayer,
      board: this.board
    };
  }
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'joinRoom':
          handleJoinRoom(ws, data);
          break;
          
        case 'createRoom':
          handleCreateRoom(ws, data);
          break;
          
        case 'makeMove':
          handleMakeMove(ws, data);
          break;
          
        case 'resetGame':
          handleResetGame(ws, data);
          break;
          
        case 'getRooms':
          handleGetRooms(ws);
          break;
          
        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
    // Remove player from all rooms
    gameRooms.forEach(room => {
      room.removePlayer(ws);
      if (room.players.length === 0 && room.spectators.length === 0) {
        gameRooms.delete(room.roomId);
      }
    });
  });
});

function handleJoinRoom(ws, data) {
  const { roomId, playerName, asSpectator } = data;
  
  if (!gameRooms.has(roomId)) {
    ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
    return;
  }
  
  const room = gameRooms.get(roomId);
  
  if (asSpectator) {
    const spectator = room.addSpectator(ws, playerName);
    ws.send(JSON.stringify({
      type: 'joinedAsSpectator',
      roomInfo: room.getRoomInfo()
    }));
  } else {
    const player = room.addPlayer(ws, playerName);
    if (player) {
      ws.send(JSON.stringify({
        type: 'joinedRoom',
        player: { name: player.name, symbol: player.symbol },
        roomInfo: room.getRoomInfo()
      }));
    } else {
      ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
    }
  }
}

function handleCreateRoom(ws, data) {
  const { playerName } = data;
  const roomId = generateRoomId();
  
  const room = new GameRoom(roomId);
  gameRooms.set(roomId, room);
  
  const player = room.addPlayer(ws, playerName);
  
  ws.send(JSON.stringify({
    type: 'roomCreated',
    roomId: roomId,
    player: { name: player.name, symbol: player.symbol },
    roomInfo: room.getRoomInfo()
  }));
}

function handleMakeMove(ws, data) {
  const { roomId, index } = data;
  
  if (!gameRooms.has(roomId)) {
    ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
    return;
  }
  
  const room = gameRooms.get(roomId);
  const success = room.makeMove(ws, index);
  
  if (!success) {
    ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }));
  }
}

function handleResetGame(ws, data) {
  const { roomId } = data;
  
  if (!gameRooms.has(roomId)) {
    ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
    return;
  }
  
  const room = gameRooms.get(roomId);
  const player = room.players.find(p => p.ws === ws);
  
  if (player) {
    room.resetGame();
  }
}

function handleGetRooms(ws) {
  const rooms = Array.from(gameRooms.values()).map(room => ({
    roomId: room.roomId,
    playerCount: room.players.length,
    spectatorCount: room.spectators.length,
    gameActive: room.gameActive
  }));
  
  ws.send(JSON.stringify({
    type: 'roomsList',
    rooms: rooms
  }));
}

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server is ready for connections`);
});