import axios from 'axios';

// Add a request interceptor to mock API responses
axios.interceptors.request.use((config) => {
  // We need to return a Promise that resolves with the mocked response,
  // but axios interceptors normally just modify config.
  // To mock responses at the adapter level:
  return config;
}, (error) => {
  return Promise.reject(error);
});

// A better way to mock axios is intercepting the response adapter.
axios.defaults.adapter = async function (config) {
  const { url, method, data } = config;

  console.log(`[Mock] Intercepted ${method.toUpperCase()} ${url}`);

  const mockResponse = (status, responseData) => {
    return {
      data: responseData,
      status: status,
      statusText: 'OK',
      headers: {},
      config: config,
      request: {}
    };
  };

  // Mock Login
  if (url.includes('/api/auth/login')) {
    const parsedData = JSON.parse(data);
    return mockResponse(200, {
      message: 'Login successful',
      token: 'mock-jwt-token-12345',
      user: {
        id: 1,
        full_name: parsedData.full_name || 'DHARNEESH D',
        email: parsedData.email || 'admin@kmch.com',
        role: parsedData.role || 'Admin',
      }
    });
  }

  // Mock Register
  if (url.includes('/api/auth/register')) {
    return mockResponse(201, { message: 'User registered successfully', userId: 2 });
  }

  // Mock Patient Me
  if (url.includes('/api/patients/me')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const name = urlParams.get('name') || 'John Doe';
    return mockResponse(200, {
      id: 1, 
      mrn: 'PT-1001', 
      name: name, 
      age: 65, 
      gender: 'Male', 
      room: 'ICU-101', 
      status: 'Critical', 
      phone: '1234567890',
      vitalsHistory: [
        { heart_rate: 80, spo2: 98, blood_pressure: '120/80' }
      ]
    });
  }

  // Mock Patients
  if (url.includes('/api/patients')) {
    if (url.includes('/notes')) {
      return mockResponse(200, [
        { id: 1, text: 'Patient shows stable heart rate.', author_name: 'Dr. Smith', created_at: new Date().toISOString() }
      ]);
    }
    return mockResponse(200, [
      { id: 1, mrn: 'PT-1001', name: 'John Doe', age: 65, gender: 'Male', room: 'ICU-101', status: 'Critical', phone: '1234567890' },
      { id: 2, mrn: 'PT-1002', name: 'Jane Smith', age: 72, gender: 'Female', room: 'ICU-102', status: 'Stable', phone: '0987654321' },
      { id: 3, mrn: 'PT-1003', name: 'Robert Johnson', age: 58, gender: 'Male', room: 'Ward-3A', status: 'Monitoring', phone: '1122334455' }
    ]);
  }

  // Mock Alerts
  if (url.includes('/api/alerts')) {
    return mockResponse(200, [
      { id: 1, patient_id: 1, patient_name: 'John Doe', room: 'ICU-101', arrhythmia_type: 'Atrial Fibrillation', severity: 'Critical', resolved: 0, timestamp: new Date().toISOString() },
      { id: 2, patient_id: 2, patient_name: 'Jane Smith', room: 'ICU-102', arrhythmia_type: 'Bradycardia', severity: 'Warning', resolved: 1, timestamp: new Date().toISOString() }
    ]);
  }

  // Mock Users / Admin Metrics
  if (url.includes('/api/users/admin/metrics')) {
    return mockResponse(200, {
      totalPatients: 3,
      totalDoctors: 2,
      criticalAlerts: 1,
      activeMonitoring: 3
    });
  }

  if (url.includes('/api/users')) {
    return mockResponse(200, [
      { id: 1, badge_id: 'ADM-1001', full_name: 'DHARNEESH D', email: 'dharneeshd007@gmail.com', role: 'Admin', phone: '7904138308' },
      { id: 2, badge_id: 'MD-1002', full_name: 'Dr. Smith', email: 'smith@hospital.com', role: 'Doctor', phone: '555-0100' }
    ]);
  }

  // Fallback for unmocked routes
  return mockResponse(200, { message: 'Mock fallback' });
};
