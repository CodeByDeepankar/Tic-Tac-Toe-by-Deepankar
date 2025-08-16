// Professional Tic Tac Toe - Enhanced JavaScript with Multiplayer Support
class TicTacToe {
  constructor() {
    this.currentPlayer = 'X';
    this.board = ['', '', '', '', '', '', '', '', ''];
    this.gameActive = true;
    this.scores = { X: 0, O: 0, draws: 0 };
    this.gamesPlayed = 0;
    this.currentTheme = 'default';
    this.themes = ['default', 'dark-theme', 'neon-theme'];
    this.isMultiplayer = false;
    this.isSpectator = false;
    
    this.winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    
    this.init();
  }
  
  init() {
    this.loadGameData();
    this.updateDisplay();
    this.addEventListeners();
  }
  
  addEventListeners() {
    // Add keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        this.handleClick(index);
      }
      if (e.key === 'r' || e.key === 'R') {
        this.reset();
      }
    });
  }
  
  handleClick(index) {
    if (!this.gameActive || this.board[index] !== '') return;
    
    // Check if this is a multiplayer game
    if (this.isMultiplayer) {
      if (this.isSpectator) return; // Spectators can't make moves
      
      // Let multiplayer manager handle the move
      if (window.multiplayerManager) {
        const success = window.multiplayerManager.makeMove(index);
        if (!success) return; // Invalid move in multiplayer
      }
      return; // Don't process locally in multiplayer
    }
    
    // Single player logic
    this.makeLocalMove(index);
  }
  
  makeLocalMove(index) {
    this.board[index] = this.currentPlayer;
    this.animateMove(index);
    
    const winner = this.checkWinner();
    if (winner) {
      this.handleGameEnd(winner);
    } else if (this.board.every(cell => cell !== '')) {
      this.handleGameEnd('draw');
    } else {
      this.switchPlayer();
    }
  }
  
  animateMove(index) {
    const cell = document.getElementsByClassName('cell')[index];
    const cellContent = cell.querySelector('.cell-content');
    
    cell.setAttribute('data-player', this.currentPlayer);
    cellContent.textContent = this.currentPlayer;
    cellContent.classList.add('scale-in');
    
    // Add ripple effect
    this.createRipple(cell);
  }
  
  createRipple(element) {
    const ripple = document.createElement('div');
    ripple.classList.add('ripple');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(102, 126, 234, 0.6);
      transform: scale(0);
      animation: ripple 0.6s linear;
      width: 100px;
      height: 100px;
      top: 0;
      left: 0;
    `;
    
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }
  
  checkWinner() {
    for (let combination of this.winningCombinations) {
      const [a, b, c] = combination;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        this.highlightWinningCells(combination);
        return this.board[a];
      }
    }
    return null;
  }
  
  highlightWinningCells(combination) {
    combination.forEach(index => {
      const cell = document.getElementsByClassName('cell')[index];
      cell.style.background = 'linear-gradient(45deg, #4ecdc4, #44a08d)';
      cell.style.color = 'white';
      cell.style.transform = 'scale(1.05)';
    });
  }
  
  handleGameEnd(result) {
    this.gameActive = false;
    
    // Only update scores in single player mode
    if (!this.isMultiplayer) {
      this.gamesPlayed++;
      
      if (result === 'draw') {
        this.scores.draws++;
        this.updateStatus('It\'s a draw! 🤝');
        this.showModal('It\'s a Draw!', 'Great game! Try again?');
      } else {
        this.scores[result]++;
        this.updateStatus(`Player ${result} wins! 🎉`);
        this.showModal('Congratulations!', `Player ${result} wins!`);
      }
      
      this.updateScoreDisplay();
      this.saveGameData();
    }
  }
  
  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    this.updateStatus(`Player ${this.currentPlayer}'s turn`);
    this.updateTurnIndicator();
  }
  
  updateStatus(message) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.classList.add('fade-in');
    setTimeout(() => statusElement.classList.remove('fade-in'), 500);
  }
  
  updateTurnIndicator() {
    document.getElementById('turnX').classList.toggle('active', this.currentPlayer === 'X');
    document.getElementById('turnO').classList.toggle('active', this.currentPlayer === 'O');
  }
  
  updateScoreDisplay() {
    document.getElementById('scoreX').textContent = this.scores.X;
    document.getElementById('scoreO').textContent = this.scores.O;
    document.getElementById('gamesPlayed').textContent = this.gamesPlayed;
    document.getElementById('draws').textContent = this.scores.draws;
  }
  
  updateDisplay() {
    this.updateScoreDisplay();
    this.updateTurnIndicator();
    this.updateStatus(`Player ${this.currentPlayer}'s turn`);
  }
  
  showModal(title, message) {
    const modal = document.getElementById('victoryModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.add('show');
    
    // Auto-close modal after 3 seconds
    setTimeout(() => this.closeModal(), 3000);
  }
  
  closeModal() {
    document.getElementById('victoryModal').classList.remove('show');
  }
  
  playAgain() {
    this.closeModal();
    this.reset();
  }
  
  reset() {
    // In multiplayer, delegate to multiplayer manager
    if (this.isMultiplayer && window.multiplayerManager) {
      window.multiplayerManager.resetGame();
      return;
    }
    
    // Single player reset
    this.resetLocal();
  }
  
  resetLocal() {
    this.currentPlayer = 'X';
    this.board = ['', '', '', '', '', '', '', '', ''];
    this.gameActive = true;
    
    // Reset all cells
    const cells = document.getElementsByClassName('cell');
    Array.from(cells).forEach(cell => {
      const cellContent = cell.querySelector('.cell-content');
      cellContent.textContent = '';
      cell.removeAttribute('data-player');
      cell.style.background = '';
      cell.style.color = '';
      cell.style.transform = '';
    });
    
    this.updateDisplay();
  }
  
  changeTheme() {
    const currentIndex = this.themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    
    // Remove current theme
    document.body.classList.remove(this.currentTheme);
    
    // Apply new theme
    this.currentTheme = this.themes[nextIndex];
    if (this.currentTheme !== 'default') {
      document.body.classList.add(this.currentTheme);
    }
    
    this.saveGameData();
  }
  
  saveGameData() {
    const gameData = {
      scores: this.scores,
      gamesPlayed: this.gamesPlayed,
      currentTheme: this.currentTheme
    };
    localStorage.setItem('ticTacToeData', JSON.stringify(gameData));
  }
  
  loadGameData() {
    const savedData = localStorage.getItem('ticTacToeData');
    if (savedData) {
      const gameData = JSON.parse(savedData);
      this.scores = gameData.scores || { X: 0, O: 0, draws: 0 };
      this.gamesPlayed = gameData.gamesPlayed || 0;
      this.currentTheme = gameData.currentTheme || 'default';
      
      // Apply saved theme
      if (this.currentTheme !== 'default') {
        document.body.classList.add(this.currentTheme);
      }
    }
  }
  
  // Multiplayer specific methods
  switchToMultiplayer() {
    this.isMultiplayer = true;
    this.isSpectator = false;
    this.resetLocal();
    this.updateStatus('Multiplayer mode - Waiting for game to start...');
  }
  
  switchToSpectatorMode() {
    this.isMultiplayer = true;
    this.isSpectator = true;
    this.resetLocal();
    this.updateStatus('Spectator mode - Watching the game...');
  }
  
  switchToSinglePlayer() {
    this.isMultiplayer = false;
    this.isSpectator = false;
    this.resetLocal();
    this.updateStatus('Single player mode');
  }
  
  updateBoardFromServer(serverBoard) {
    this.board = [...serverBoard];
    
    // Update UI
    const cells = document.getElementsByClassName('cell');
    Array.from(cells).forEach((cell, index) => {
      const cellContent = cell.querySelector('.cell-content');
      const value = this.board[index];
      
      if (value) {
        cell.setAttribute('data-player', value);
        cellContent.textContent = value;
      } else {
        cell.removeAttribute('data-player');
        cellContent.textContent = '';
        cell.style.background = '';
        cell.style.color = '';
        cell.style.transform = '';
      }
    });
    
    // Check for winner and highlight
    const winner = this.checkWinner();
    if (winner) {
      this.gameActive = false;
    } else {
      this.gameActive = true;
    }
  }
}

// Initialize the game
let game;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  game = new TicTacToe();
  // Make game globally accessible
  window.game = game;
});

// Global functions for HTML onclick events
function handleClick(index) {
  if (game) game.handleClick(index);
}

function reset() {
  if (game) game.reset();
}

function playAgain() {
  if (game) game.playAgain();
}

function closeModal() {
  if (game) game.closeModal();
}

function changeTheme() {
  if (game) game.changeTheme();
}