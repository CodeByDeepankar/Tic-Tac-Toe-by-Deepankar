# Multiplayer Tic Tac Toe Setup Guide

This branch adds WebSocket-based multiplayer functionality to the Tic Tac Toe game, allowing players to compete in real-time across different devices.

## 🚀 Features Added

- **Real-time Multiplayer**: Play against friends in real-time using WebSockets
- **Room System**: Create or join game rooms with unique room IDs
- **Spectator Mode**: Watch ongoing games as a spectator
- **Room Browser**: Browse and join available game rooms
- **Auto-reconnection**: Automatic reconnection on connection loss
- **Responsive UI**: Beautiful multiplayer interface that works on all devices

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/CodeByDeepankar/Tic-Tac-Toe-by-Deepankar.git
cd Tic-Tac-Toe-by-Deepankar
git checkout multiplayer-websocket
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

### 4. Access the Game
Open your browser and navigate to:
```
http://localhost:3000
```

## 🎮 How to Play Multiplayer

### Creating a Room
1. Click the "Multiplayer" button
2. Enter your name
3. Click "Create Room"
4. Share the room ID with your friend

### Joining a Room
1. Click the "Multiplayer" button
2. Enter your name
3. Click "Join Room"
4. Enter the room ID provided by your friend
5. Choose "Join as Player" or "Join as Spectator"

### Browsing Rooms
1. Click the "Multiplayer" button
2. Enter your name
3. Click "Browse Rooms"
4. Select a room to join

## 🏗️ Architecture

### Server Components
- **WebSocket Server**: Handles real-time communication
- **Game Room Manager**: Manages game rooms and player sessions
- **Static File Server**: Serves the game files

### Client Components
- **Multiplayer Manager**: Handles WebSocket communication
- **Game Engine**: Enhanced to support multiplayer modes
- **UI Components**: Multiplayer-specific interface elements

## 📁 File Structure

```
├── server.js              # WebSocket server and game logic
├── package.json           # Node.js dependencies
├── multiplayer.js         # Client-side multiplayer functionality
├── multiplayer.css        # Multiplayer UI styles
├── script.js              # Enhanced game engine
├── index.html             # Updated HTML with multiplayer support
├── style.css              # Original game styles
└── MULTIPLAYER_README.md  # This file
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)

### WebSocket Events
- `createRoom`: Create a new game room
- `joinRoom`: Join an existing room
- `makeMove`: Make a game move
- `resetGame`: Reset the current game
- `getRooms`: Get list of available rooms

## 🚀 Deployment

### Local Network
To play with friends on the same network:
1. Find your local IP address
2. Start the server
3. Friends can access: `http://YOUR_IP:3000`

### Cloud Deployment
Deploy to platforms like:
- Heroku
- Railway
- Render
- DigitalOcean

Example Heroku deployment:
```bash
git add .
git commit -m "Add multiplayer functionality"
git push heroku multiplayer-websocket:main
```

## 🎯 Game Features

### Single Player Mode
- Original game functionality preserved
- Local score tracking
- Theme switching
- Keyboard controls

### Multiplayer Mode
- Real-time gameplay
- Room-based sessions
- Spectator support
- Connection status indicators
- Auto-reconnection

## 🐛 Troubleshooting

### Connection Issues
- Ensure the server is running
- Check firewall settings
- Verify WebSocket support in browser

### Room Not Found
- Double-check the room ID
- Ensure the room creator is still connected

### Game Sync Issues
- Refresh the page
- Rejoin the room

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Created by **Deepankar Sahoo**
- GitHub: [@CodeByDeepankar](https://github.com/CodeByDeepankar)

---

Enjoy playing multiplayer Tic Tac Toe! 🎮✨