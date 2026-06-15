import { io } from 'socket.io-client';

const URL = import.meta.env.PROD ? window.location.origin : 'http://localhost:5001';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    console.log('[Mock Socket] Connected');
    return this;
  }

  disconnect() {
    console.log('[Mock Socket] Disconnected');
  }

  on(event, callback) {
    console.log(`[Mock Socket] Listening to event: ${event}`);
  }

  off(event, callback) {
    console.log(`[Mock Socket] Stopped listening to event: ${event}`);
  }
}

export default new SocketService();
