const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// Database Configuration
const db = require('./config/db');

// Load environment variables
dotenv.config();

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5001;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Import Routes
const indexRoutes = require('./routes/index');
const patientRoutes = require('./routes/patientRoutes');
const alertRoutes = require('./routes/alertRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
app.use('/api', indexRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404 handler specifically for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API Route Not Found' });
});
// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  // app.get('*', (req, res) => {
  //   res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
  // });
}

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('Client connected to Socket.IO:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start AI Engine
const AIEngine = require('./services/aiEngine');
const aiEngine = new AIEngine(io, db);
aiEngine.start();

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
