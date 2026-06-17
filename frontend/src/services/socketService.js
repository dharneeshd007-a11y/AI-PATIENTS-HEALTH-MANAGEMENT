import { io } from 'socket.io-client';

const URL = import.meta.env.PROD ? 'https://ai-patients-health-management.onrender.com' : 'http://localhost:5001';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(URL, {
        transports: ['websocket'],
        reconnection: true
      });
      
      this.socket.on('connect', () => {
        console.log('[Socket] Connected to Live Server');
      });
      
      this.socket.on('disconnect', () => {
        console.log('[Socket] Disconnected from Live Server');
      });
    }
    return this;
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
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();
