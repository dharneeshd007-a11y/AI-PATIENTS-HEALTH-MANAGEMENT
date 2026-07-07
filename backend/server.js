const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// Database Configuration
const db = require('./config/db');

// Load environment variables
dotenv.config();

const session = require('express-session');
const passport = require('./config/passport');

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

app.set('io', io); // Make io accessible in routes

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.JWT_SECRET || 'super_secret_session_key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

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
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const icuRoutes = require('./routes/icuRoutes');
const adminPatientRoutes = require('./routes/adminPatientRoutes');

app.use('/api', indexRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/admin/patients', adminPatientRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/icu', icuRoutes);

// 404 handler specifically for API routes
app.get('/api/setup', (req, res) => {
  try {
    const { execSync } = require('child_process');
    const out1 = execSync('node scripts/init-db.js', {cwd: __dirname}).toString();
    const out2 = execSync('node scripts/update-db.js', {cwd: __dirname}).toString();
    const out3 = execSync('node scripts/create-notes-table.js', {cwd: __dirname}).toString();
    const out4 = execSync('node migrate.js', {cwd: __dirname}).toString();
    const out5 = execSync('node reset-admin.js', {cwd: __dirname}).toString();
    const out6 = execSync('node scripts/alter-medications.js', {cwd: __dirname}).toString();
    const out7 = execSync('node scripts/alter-emergency.js', {cwd: __dirname}).toString();
    res.send(`<pre>${out1}\n${out2}\n${out3}\n${out4}\n${out5}\n${out6}\n${out7}</pre>`);
  } catch (err) {
    res.status(500).send(`<pre>Error: ${err.message}\nOutput: ${err.stdout ? err.stdout.toString() : ''}\nStderr: ${err.stderr ? err.stderr.toString() : ''}</pre>`);
  }
});

// Test endpoint to trigger the periodic monitor instantly instead of waiting
app.get('/api/trigger-alert', async (req, res) => {
  if (aiEngine) {
    try {
      await aiEngine.runFiveMinuteCheck();
      res.send("Triggered the periodic check instantly! Check your frontend.");
    } catch (err) {
      res.status(500).send("Error running check: " + err.message);
    }
  } else {
    res.status(500).send("AI Engine not running.");
  }
});

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
