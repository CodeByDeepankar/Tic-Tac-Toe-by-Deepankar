// Multiplayer WebSocket Client for Tic Tac Toe
class MultiplayerManager {
  constructor(game) {
    this.game = game;
    this.ws = null;
    this.isConnected = false;
    this.currentRoom = null;
    this.playerInfo = null;
    this.isMultiplayer = false;
    this.isSpectator = false;
    
    this.setupUI();
  }
  
  setupUI() {
    // Add multiplayer controls to the existing UI
    const controlsContainer = document.querySelector('.game-controls');
    
    // Create multiplayer button
    const multiplayerBtn = document.createElement('button');
    multiplayerBtn.className = 'control-btn multiplayer-btn';
    multiplayerBtn.innerHTML = `
      <i class="fas fa-users"></i>
      <span>Multiplayer</span>
    `;
    multiplayerBtn.onclick = () => this.showMultiplayerModal();
    
    controlsContainer.appendChild(multiplayerBtn);
    
    // Create multiplayer modal
    this.createMultiplayerModal();
  }
  
  createMultiplayerModal() {
    const modalHTML = `
      <div id="multiplayerModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <i class="fas fa-users"></i>
            <h2>Multiplayer Game</h2>
            <button class="close-btn" onclick="multiplayerManager.closeMultiplayerModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div id="connectionStatus" class="connection-status">
              <i class="fas fa-circle status-indicator"></i>
              <span>Disconnected</span>
            </div>
            
            <div id="playerSetup" class="player-setup">
              <div class="input-group">
                <label for="playerName">Your Name:</label>
                <input type="text" id="playerName" placeholder="Enter your name" maxlength="20">
              </div>
              
              <div class="multiplayer-options">
                <button class="option-btn create-room-btn" onclick="multiplayerManager.createRoom()">
                  <i class="fas fa-plus"></i>
                  Create Room
                </button>
                <button class="option-btn join-room-btn" onclick="multiplayerManager.showJoinRoom()">
                  <i class="fas fa-sign-in-alt"></i>
                  Join Room
                </button>
                <button class="option-btn browse-rooms-btn" onclick="multiplayerManager.browseRooms()">
                  <i class="fas fa-list"></i>
                  Browse Rooms
                </button>
              </div>
            </div>
            
            <div id="joinRoomSection" class="join-room-section" style="display: none;">
              <div class="input-group">
                <label for="roomId">Room ID:</label>
                <input type="text" id="roomId" placeholder="Enter room ID" maxlength="6">
              </div>
              <div class="join-options">
                <button class="option-btn" onclick="multiplayerManager.joinRoom(false)">
                  Join as Player
                </button>
                <button class="option-btn spectator-btn" onclick="multiplayerManager.joinRoom(true)">
                  Join as Spectator
                </button>
              </div>
              <button class="back-btn" onclick="multiplayerManager.showPlayerSetup()">
                <i class="fas fa-arrow-left"></i> Back
              </button>
            </div>
            
            <div id="roomsList" class="rooms-list" style="display: none;">
              <div class="rooms-container">
                <!-- Rooms will be populated here -->
              </div>
              <button class="back-btn" onclick="multiplayerManager.showPlayerSetup()">
                <i class="fas fa-arrow-left"></i> Back
              </button>
            </div>
            
            <div id="gameRoom" class="game-room" style="display: none;">
              <div class="room-info">
                <h3>Room: <span id="currentRoomId"></span></h3>
                <div class="room-players">
                  <div class="player-slot" id="playerX">
                    <i class="fas fa-user"></i>
                    <span>Waiting...</span>
                  </div>
                  <div class="vs-divider">VS</div>
                  <div class="player-slot" id="playerO">
                    <i class="fas fa-user"></i>
                    <span>Waiting...</span>
                  </div>
                </div>
                <div class="spectators" id="spectatorsList" style="display: none;">
                  <h4>Spectators:</h4>
                  <div class="spectator-list"></div>
                </div>
              </div>
              <div class="room-controls">
                <button class="control-btn" onclick="multiplayerManager.leaveRoom()">
                  <i class="fas fa-sign-out-alt"></i>
                  Leave Room
                </button>
                <button class="control-btn" onclick="multiplayerManager.copyRoomId()">
                  <i class="fas fa-copy"></i>
                  Copy Room ID
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
  
  showMultiplayerModal() {
    document.getElementById('multiplayerModal').classList.add('show');
    this.connectToServer();
  }
  
  closeMultiplayerModal() {
    document.getElementById('multiplayerModal').classList.remove('show');
  }
  
  connectToServer() {
    if (this.isConnected) return;
    
    // Determine the WebSocket URL based on the current page context
    let wsUrl;
    if (typeof window !== 'undefined') {
      // Client-side: construct URL from current location
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Use the current host, or default to localhost:3000 if developing locally
      const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'localhost:3000' 
        : window.location.host;
      wsUrl = `${protocol}//${host}`;
    } else {
      // Server-side or testing environment: default to localhost
      wsUrl = 'ws://localhost:3000';
    }
    
    try {
      console.log('Attempting to connect to:', wsUrl);
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connection opened');
        this.isConnected = true;
        this.updateConnectionStatus('Connected', 'connected');
      };
      
      this.ws.onmessage = (event) => {
        console.log('Received message:', event.data);
        this.handleMessage(JSON.parse(event.data));
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.isConnected = false;
        this.updateConnectionStatus('Disconnected', 'disconnected');
        // Attempt to reconnect after delay
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          this.connectToServer();
        }, 3000);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.updateConnectionStatus('Connection Error', 'error');
      };
      
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.updateConnectionStatus('Connection Failed', 'error');
    }
  }
  
  updateConnectionStatus(text, status) {
    const statusElement = document.getElementById('connectionStatus');
    const indicator = statusElement.querySelector('.status-indicator');
    const span = statusElement.querySelector('span');
    
    span.textContent = text;
    indicator.className = `fas fa-circle status-indicator ${status}`;
  }
  
  handleMessage(data) {
    switch (data.type) {
      case 'roomCreated':
        this.handleRoomCreated(data);
        break;
      case 'joinedRoom':
        this.handleJoinedRoom(data);
        break;
      case 'joinedAsSpectator':
        this.handleJoinedAsSpectator(data);
        break;
      case 'playerJoined':
        this.handlePlayerJoined(data);
        break;
      case 'readyToStart':
        this.handleReadyToStart(data);
        break;
      case 'gameStart':
        this.handleGameStart(data);
        break;
      case 'move':
        this.handleMove(data);
        break;
      case 'gameEnd':
        this.handleGameEnd(data);
        break;
      case 'gameReset':
        this.handleGameReset(data);
        break;
      case 'playerDisconnected':
        this.handlePlayerDisconnected(data);
        break;
      case 'waitingForPlayers':
        this.handleWaitingForPlayers(data);
        break;
      case 'roomsList':
        this.handleRoomsList(data);
        break;
      case 'error':
        this.showError(data.message);
        break;
    }
  }
  
  createRoom() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
      this.showError('Please enter your name');
      return;
    }
    
    this.sendMessage({
      type: 'createRoom',
      playerName: playerName
    });
  }
  
  showJoinRoom() {
    document.getElementById('playerSetup').style.display = 'none';
    document.getElementById('joinRoomSection').style.display = 'block';
  }
  
  joinRoom(asSpectator = false) {
    const playerName = document.getElementById('playerName').value.trim();
    const roomId = document.getElementById('roomId').value.trim().toUpperCase();
    
    if (!playerName) {
      this.showError('Please enter your name');
      return;
    }
    
    if (!roomId) {
      this.showError('Please enter room ID');
      return;
    }
    
    this.sendMessage({
      type: 'joinRoom',
      roomId: roomId,
      playerName: playerName,
      asSpectator: asSpectator
    });
  }
  
  browseRooms() {
    this.sendMessage({ type: 'getRooms' });
  }
  
  handleRoomCreated(data) {
    this.currentRoom = data.roomId;
    this.playerInfo = data.player;
    this.isMultiplayer = true;
    this.isSpectator = false;
    this.showGameRoom(data.roomInfo);
    this.game.switchToMultiplayer();
  }
  
  handleJoinedRoom(data) {
    this.currentRoom = data.roomInfo.roomId;
    this.playerInfo = data.player;
    this.isMultiplayer = true;
    this.isSpectator = false;
    this.showGameRoom(data.roomInfo);
    this.game.switchToMultiplayer();
  }
  
  handlePlayerJoined(data) {
    // Update the room display when a player joins
    this.updateRoomPlayers(data);
    
    // If we're the host and waiting for a second player, update status
    if (this.playerInfo && this.playerInfo.symbol === 'X' && data.playerCount === 2) {
      this.game.updateStatus('Second player joined! Click Start Game to begin.');
    } else if (data.playerCount < 2) {
      this.game.updateStatus('Waiting for another player...');
    }
  }
  
  handleReadyToStart(data) {
    // Show the start game button if this player is the host (X)
    if (this.playerInfo && this.playerInfo.symbol === 'X') {
      this.showStartGameButton();
      this.game.updateStatus('Both players joined! Click Start Game to begin.');
    } else {
      this.game.updateStatus('Waiting for host to start the game...');
    }
    
    // Update player display
    this.updateRoomPlayers({ players: data.players, spectators: [] });
  }
  
  handleWaitingForPlayers(data) {
    this.game.updateStatus(data.message || 'Waiting for players...');
    
    // Update player display to show current players
    this.updateRoomPlayers({
      players: data.players || [],
      spectators: []
    });
    
    // Hide start game button if it was shown
    this.hideStartGameButton();
  }
  
  showStartGameButton() {
    // Create or show the start game button
    let startButton = document.getElementById('startGameBtn');
    if (!startButton) {
      const roomControls = document.querySelector('.room-controls');
      startButton = document.createElement('button');
      startButton.id = 'startGameBtn';
      startButton.className = 'control-btn start-game-btn';
      startButton.innerHTML = `
        <i class="fas fa-play"></i>
        <span>Start Game</span>
      `;
      startButton.onclick = () => this.startGame();
      roomControls.appendChild(startButton);
    } else {
      startButton.style.display = 'flex';
    }
  }
  
  hideStartGameButton() {
    const startButton = document.getElementById('startGameBtn');
    if (startButton) {
      startButton.style.display = 'none';
    }
  }
  
  startGame() {
    if (this.currentRoom && this.playerInfo && this.playerInfo.symbol === 'X') {
      this.sendMessage({
        type: 'startGame',
        roomId: this.currentRoom
      });
    }
  }
  
  handleJoinedAsSpectator(data) {
    this.currentRoom = data.roomInfo.roomId;
    this.isMultiplayer = true;
    this.isSpectator = true;
    this.showGameRoom(data.roomInfo);
    this.game.switchToSpectatorMode();
  }
  
  showGameRoom(roomInfo) {
    // Hide other sections
    document.getElementById('playerSetup').style.display = 'none';
    document.getElementById('joinRoomSection').style.display = 'none';
    document.getElementById('roomsList').style.display = 'none';
    
    // Show game room
    document.getElementById('gameRoom').style.display = 'block';
    document.getElementById('currentRoomId').textContent = roomInfo.roomId;
    
    this.updateRoomPlayers(roomInfo);
  }
  
  updateRoomPlayers(roomInfo) {
    const playerXSlot = document.getElementById('playerX');
    const playerOSlot = document.getElementById('playerO');
    
    // Reset slots
    playerXSlot.innerHTML = '<i class="fas fa-user"></i><span>Waiting...</span>';
    playerOSlot.innerHTML = '<i class="fas fa-user"></i><span>Waiting...</span>';
    
    roomInfo.players.forEach(player => {
      const slot = player.symbol === 'X' ? playerXSlot : playerOSlot;
      slot.innerHTML = `<i class="fas fa-user"></i><span>${player.name} (${player.symbol})</span>`;
      
      if (this.playerInfo && player.symbol === this.playerInfo.symbol) {
        slot.classList.add('current-player');
      }
    });
    
    // Update spectators
    if (roomInfo.spectators && roomInfo.spectators.length > 0) {
      const spectatorsList = document.getElementById('spectatorsList');
      const spectatorContainer = spectatorsList.querySelector('.spectator-list');
      spectatorContainer.innerHTML = roomInfo.spectators.map(s => `<span>${s.name}</span>`).join(', ');
      spectatorsList.style.display = 'block';
    }
  }
  
  handleGameStart(data) {
    this.updateRoomPlayers({ players: data.players, spectators: [] });
    this.game.updateStatus('Game Started! ' + (data.currentPlayer === this.playerInfo?.symbol ? 'Your turn!' : `Player ${data.currentPlayer}'s turn`));
  }
  
  handleMove(data) {
    this.game.updateBoardFromServer(data.board);
    const isMyTurn = data.currentPlayer === this.playerInfo?.symbol;
    this.game.updateStatus(isMyTurn ? 'Your turn!' : `Player ${data.currentPlayer}'s turn`);
  }
  
  handleGameEnd(data) {
    this.game.updateBoardFromServer(data.board);
    
    if (data.isDraw) {
      this.game.updateStatus('Game ended in a draw!');
      this.game.showModal('Draw!', 'The game ended in a draw!');
    } else {
      const isWinner = data.winner === this.playerInfo?.symbol;
      this.game.updateStatus(isWinner ? 'You won!' : `${data.winnerName} won!`);
      this.game.showModal(isWinner ? 'You Won!' : 'Game Over', 
                         isWinner ? 'Congratulations!' : `${data.winnerName} won the game!`);
    }
  }
  
  handleGameReset(data) {
    this.game.updateBoardFromServer(data.board);
    this.game.updateStatus(`Game reset! Player ${data.currentPlayer}'s turn`);
  }
  
  handlePlayerDisconnected(data) {
    this.game.updateStatus(data.message);
  }
  
  handleRoomsList(data) {
    this.showRoomsList(data.rooms);
  }
  
  showRoomsList(rooms) {
    document.getElementById('playerSetup').style.display = 'none';
    document.getElementById('roomsList').style.display = 'block';
    
    const container = document.querySelector('.rooms-container');
    
    if (rooms.length === 0) {
      container.innerHTML = '<p class="no-rooms">No active rooms found. Create a new room!</p>';
      return;
    }
    
    container.innerHTML = rooms.map(room => `
      <div class="room-item">
        <div class="room-info">
          <h4>Room ${room.roomId}</h4>
          <p>Players: ${room.playerCount}/2</p>
          <p>Spectators: ${room.spectatorCount}</p>
          <p>Status: ${room.gameActive ? 'Playing' : 'Waiting'}</p>
        </div>
        <div class="room-actions">
          <button class="join-btn" onclick="multiplayerManager.quickJoinRoom('${room.roomId}', false)" 
                  ${room.playerCount >= 2 ? 'disabled' : ''}>
            Join as Player
          </button>
          <button class="spectate-btn" onclick="multiplayerManager.quickJoinRoom('${room.roomId}', true)">
            Spectate
          </button>
        </div>
      </div>
    `).join('');
  }
  
  quickJoinRoom(roomId, asSpectator) {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
      this.showError('Please enter your name first');
      return;
    }
    
    this.sendMessage({
      type: 'joinRoom',
      roomId: roomId,
      playerName: playerName,
      asSpectator: asSpectator
    });
  }
  
  showPlayerSetup() {
    document.getElementById('joinRoomSection').style.display = 'none';
    document.getElementById('roomsList').style.display = 'none';
    document.getElementById('gameRoom').style.display = 'none';
    document.getElementById('playerSetup').style.display = 'block';
  }
  
  leaveRoom() {
    this.currentRoom = null;
    this.playerInfo = null;
    this.isMultiplayer = false;
    this.isSpectator = false;
    this.game.switchToSinglePlayer();
    this.showPlayerSetup();
  }
  
  copyRoomId() {
    if (this.currentRoom) {
      navigator.clipboard.writeText(this.currentRoom).then(() => {
        this.showSuccess('Room ID copied to clipboard!');
      });
    }
  }
  
  makeMove(index) {
    if (!this.isMultiplayer || this.isSpectator) return false;
    
    this.sendMessage({
      type: 'makeMove',
      roomId: this.currentRoom,
      index: index
    });
    
    return true;
  }
  
  resetGame() {
    if (!this.isMultiplayer) return;
    
    this.sendMessage({
      type: 'resetGame',
      roomId: this.currentRoom
    });
  }
  
  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
  
  showError(message) {
    // Create a temporary error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4757;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
  }
  
  showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2ed573;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
  }
}

// Initialize multiplayer manager when DOM is loaded
let multiplayerManager;
document.addEventListener('DOMContentLoaded', () => {
  // Wait for the game to be initialized
  setTimeout(() => {
    if (window.game) {
      multiplayerManager = new MultiplayerManager(window.game);
    }
  }, 100);
});