class AIEngine {
  constructor(io, db) {
    this.io = io;
    this.db = db;
    this.intervalId = null;
    this.patients = [];
    this.simulatedDataState = {}; // Store current base values for each patient
    this.timeCounter = 0;
  }

  async fetchActivePatients() {
    try {
      const [rows] = await this.db.query('SELECT * FROM patients WHERE status != "Discharged"');
      this.patients = rows;

      // Initialize state for any new patients
      this.patients.forEach(p => {
        if (!this.simulatedDataState[p.id]) {
          this.simulatedDataState[p.id] = {
            baseHeartRate: p.hr || 70,
            baseSpO2: p.spo2 || 98,
            phaseOffset: Math.random()
          };
        } else {
          // If the doctor resolved the alert and marked them Stable, normalize their heart rate
          if (p.status === 'Stable' && (this.simulatedDataState[p.id].baseHeartRate > 110 || this.simulatedDataState[p.id].baseHeartRate < 55)) {
            this.simulatedDataState[p.id].baseHeartRate = 70 + (Math.random() * 10 - 5);
          }
        }
      });
    } catch (err) {
      console.error("AI Engine: Error fetching patients", err);
    }
  }

  start() {
    console.log("Starting AI Alert Engine Simulation...");

    // Initial fetch
    this.fetchActivePatients();

    // Fetch new patients every 2 seconds to pick up status changes instantly
    setInterval(() => this.fetchActivePatients(), 2000);

    // Run simulation loop every 200ms
    this.intervalId = setInterval(() => this.tick(), 200);

    // Run 2-minute periodic monitoring check as requested by user
    this.fiveMinuteIntervalId = setInterval(() => this.runFiveMinuteCheck(), 2 * 60 * 1000);
  }

  async tick() {
    if (this.patients.length === 0) return;
    this.timeCounter += 1;

    const updates = {};

    for (const patient of this.patients) {
      const state = this.simulatedDataState[patient.id];
      if (!state) continue;

      // Add a tiny bit of random walk to the base heart rate
      if (Math.random() > 0.8) {
        state.baseHeartRate += (Math.random() * 2 - 1);
        // Keep within reasonable bounds
        state.baseHeartRate = Math.max(50, Math.min(120, state.baseHeartRate));
      }

      // Generate ECG wave (simulated mathematical wave based on HR)
      // Normal ECG has P, Q, R, S, T waves. We'll use a simple approximation.
      let ecgValue = 50; // baseline

      // Calculate where we are in the beat cycle based on HR
      const beatInterval = 60000 / state.baseHeartRate; // ms per beat
      const ticksPerBeat = beatInterval / 200; // 200ms per tick
      const phase = ((this.timeCounter / ticksPerBeat) + (state.phaseOffset || 0)) % 1;

      // R-peak (sharp spike)
      if (phase > 0.45 && phase < 0.55) {
        ecgValue = 90 + Math.random() * 10;
      }
      // T-wave (small bump)
      else if (phase > 0.65 && phase < 0.75) {
        ecgValue = 60 + Math.random() * 5;
      }
      // P-wave
      else if (phase > 0.25 && phase < 0.35) {
        ecgValue = 55 + Math.random() * 5;
      }
      else {
        ecgValue = 50 + (Math.random() * 2 - 1); // Baseline noise
      }

      updates[patient.id] = {
        ecgValue,
        heartRate: Math.round(state.baseHeartRate),
        spo2: state.baseSpO2,
        status: patient.status
      };

    // AI ANOMALY DETECTION (Simulation)
      // Removed the random tick anomaly detection. We now check every 5 minutes.
    }

    // Broadcast the entire batch of updates to all clients
    this.io.emit('ecg_update', {
      timestamp: Date.now(),
      data: updates
    });
  }

  async runFiveMinuteCheck() {
    console.log("[AI ENGINE] Running 5-minute periodic monitoring check for all patients...");
    if (this.patients.length === 0) return;

    for (const patient of this.patients) {
      const state = this.simulatedDataState[patient.id];
      if (!state) continue;

      // 5-Minute Evaluation:
      if (patient.status !== 'Critical') {
        // We will trigger an alert 100% of the time during the 5-min check so you can visibly see it working.
        await this.generateAlert(patient, state);
      } else {
        console.log(`[AI ENGINE] Patient ${patient.name} (${patient.id}) is already Critical. Skipping new alert.`);
      }
    }
  }

  async generateAlert(patient, state) {
    try {
      console.log(`[AI ENGINE] Critical anomaly detected for patient ${patient.name} (${patient.id})!`);

      const arrhythmias = ['Atrial Fibrillation', 'Ventricular Tachycardia', 'Bradycardia', 'Premature Ventricular Contractions', '5-Min Check: Abnormal Rhythm'];
      const type = arrhythmias[Math.floor(Math.random() * arrhythmias.length)];

      // Force heart rate to match the arrhythmia for realism
      if (type === 'Ventricular Tachycardia') state.baseHeartRate = 160;
      if (type === 'Bradycardia') state.baseHeartRate = 45;

      // Update patient status to Critical in DB
      await this.db.query('UPDATE patients SET status = ? WHERE id = ?', ['Critical', patient.id]);

      // Insert alert into DB
      const [result] = await this.db.query(
        'INSERT INTO alerts (patient_id, arrhythmia_type, severity) VALUES (?, ?, ?)',
        [patient.id, type, 'Critical']
      );

      const newAlert = {
        id: result.insertId,
        patient_id: patient.id,
        patient_name: patient.name,
        patient_room: patient.room,
        type: type,
        arrhythmia_type: type,
        severity: 'Critical',
        timestamp: new Date(),
        resolved: 0
      };

      // Emit real-time alert event to doctors and admins
      this.io.emit('new_alert', newAlert);

      // Refresh patient list to get the new status locally (let the 2-second interval sync the DB later)
      const patientIndex = this.patients.findIndex(p => p.id === patient.id);
      if (patientIndex !== -1) {
        this.patients[patientIndex].status = 'Critical';
      }

    } catch (err) {
      console.error("AI Engine: Failed to generate alert", err);
    }
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.fiveMinuteIntervalId) clearInterval(this.fiveMinuteIntervalId);
  }
}

module.exports = AIEngine;
