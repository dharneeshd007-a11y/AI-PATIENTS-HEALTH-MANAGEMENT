import { io } from 'socket.io-client';

const URL = 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10
      });

      this.socket.on('connect', () => {
        console.log('Connected to KMCH AI backend socket');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from socket');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.socket) this.connect();
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }
}

export default new SocketService();
