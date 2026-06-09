import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Database } from 'lucide-react';

const Settings = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [generalSettings, setGeneralSettings] = useState({
    hospitalName: 'Central General Hospital',
    timezone: 'UTC+05:30 (IST)',
    interfaceTheme: document.documentElement.classList.contains('light-mode') ? 'Light Mode' : 'Dark Mode'
  });

  const [aiThresholds, setAiThresholds] = useState({
    tachycardiaBpm: 100,
    bradycardiaBpm: 60,
    consecutiveBeats: 3
  });

  const [securitySettings, setSecuritySettings] = useState({
    minPasswordLength: 12,
    requireSpecialChars: true,
    sessionTimeoutMins: 30
  });

  const [databaseSettings, setDatabaseSettings] = useState({
    autoBackupFrequency: 'Daily',
    retentionPeriodMonths: 6,
    backupLocation: 'MySQL Database'
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>System Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure global AI thresholds and system preferences</p>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: 'var(--accent-blue)' }}>
            <SettingsIcon size={24} />
            <h3 style={{ margin: 0 }}>General</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Hospital name, timezone, and interface preferences.</p>
          <button className="btn btn-outline" onClick={() => setActiveModal('General')} style={{ marginTop: '1rem', width: '100%' }}>Configure</button>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: 'var(--accent-red)' }}>
            <Bell size={24} />
            <h3 style={{ margin: 0 }}>AI Thresholds</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Configure AI triggers for Tachycardia and Bradycardia.</p>
          <button className="btn btn-outline" onClick={() => setActiveModal('AI Thresholds')} style={{ marginTop: '1rem', width: '100%' }}>Configure</button>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: 'var(--accent-green)' }}>
            <Shield size={24} />
            <h3 style={{ margin: 0 }}>Security</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Manage password policies and session timeouts.</p>
          <button className="btn btn-outline" onClick={() => setActiveModal('Security')} style={{ marginTop: '1rem', width: '100%' }}>Configure</button>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
            <Database size={24} />
            <h3 style={{ margin: 0 }}>Database</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Backup telemetry logs and patient history archives.</p>
          <button className="btn btn-outline" onClick={() => setActiveModal('Database')} style={{ marginTop: '1rem', width: '100%' }}>Configure</button>
        </div>
      </div>

      {activeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-card" style={{ width: '450px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--accent-blue)' }}>
            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <SettingsIcon size={20} color="var(--accent-blue)" /> Configure {activeModal}
            </h2>
            
            {activeModal === 'General' ? (
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                setActiveModal(null); 
                if (generalSettings.interfaceTheme === 'Light Mode') {
                  document.documentElement.classList.add('light-mode');
                } else {
                  document.documentElement.classList.remove('light-mode');
                }
                alert('General settings saved successfully!'); 
              }}>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Hospital Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ width: '100%' }} 
                    value={generalSettings.hospitalName}
                    onChange={(e) => setGeneralSettings({...generalSettings, hospitalName: e.target.value})}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>System Timezone</label>
                  <select 
                    className="input-field" 
                    style={{ width: '100%' }}
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                  >
                    <option value="UTC-08:00 (PST)">UTC-08:00 (PST)</option>
                    <option value="UTC-05:00 (EST)">UTC-05:00 (EST)</option>
                    <option value="UTC+00:00 (GMT)">UTC+00:00 (GMT)</option>
                    <option value="UTC+05:30 (IST)">UTC+05:30 (IST)</option>
                  </select>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Interface Preferences</label>
                  <select 
                    className="input-field" 
                    style={{ width: '100%' }}
                    value={generalSettings.interfaceTheme}
                    onChange={(e) => setGeneralSettings({...generalSettings, interfaceTheme: e.target.value})}
                  >
                    <option value="Dark Mode">Dark Mode (Default)</option>
                    <option value="Light Mode">Light Mode</option>
                    <option value="System Default">System Default</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            ) : activeModal === 'AI Thresholds' ? (
              <form onSubmit={(e) => { e.preventDefault(); setActiveModal(null); alert('AI Thresholds updated successfully!'); }}>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tachycardia Trigger (BPM &gt;)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    style={{ width: '100%' }} 
                    value={aiThresholds.tachycardiaBpm}
                    onChange={(e) => setAiThresholds({...aiThresholds, tachycardiaBpm: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Bradycardia Trigger (BPM &lt;)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    style={{ width: '100%' }} 
                    value={aiThresholds.bradycardiaBpm}
                    onChange={(e) => setAiThresholds({...aiThresholds, bradycardiaBpm: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Consecutive Anomalous Beats Required</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    style={{ width: '100%' }} 
                    value={aiThresholds.consecutiveBeats}
                    onChange={(e) => setAiThresholds({...aiThresholds, consecutiveBeats: parseInt(e.target.value)})}
                    required
                    min="1"
                    max="10"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Thresholds</button>
                </div>
              </form>
            ) : activeModal === 'Security' ? (
              <form onSubmit={(e) => { e.preventDefault(); setActiveModal(null); alert('Security policies updated successfully!'); }}>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Minimum Password Length</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    style={{ width: '100%' }} 
                    value={securitySettings.minPasswordLength}
                    onChange={(e) => setSecuritySettings({...securitySettings, minPasswordLength: parseInt(e.target.value)})}
                    required
                    min="8"
                    max="32"
                  />
                </div>
                <div style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    id="requireSpecial"
                    checked={securitySettings.requireSpecialChars}
                    onChange={(e) => setSecuritySettings({...securitySettings, requireSpecialChars: e.target.checked})}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="requireSpecial" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer' }}>Require Special Characters &amp; Numbers</label>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Session Timeout (Minutes)</label>
                  <select 
                    className="input-field" 
                    style={{ width: '100%' }}
                    value={securitySettings.sessionTimeoutMins}
                    onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeoutMins: parseInt(e.target.value)})}
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="120">2 Hours</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Policies</button>
                </div>
              </form>
            ) : activeModal === 'Database' ? (
              <form onSubmit={(e) => { e.preventDefault(); setActiveModal(null); alert('Database backup settings saved successfully!'); }}>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Auto-Backup Frequency</label>
                  <select 
                    className="input-field" 
                    style={{ width: '100%' }}
                    value={databaseSettings.autoBackupFrequency}
                    onChange={(e) => setDatabaseSettings({...databaseSettings, autoBackupFrequency: e.target.value})}
                  >
                    <option value="Hourly">Hourly</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Data Retention Period (Months)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    style={{ width: '100%' }} 
                    value={databaseSettings.retentionPeriodMonths}
                    onChange={(e) => setDatabaseSettings({...databaseSettings, retentionPeriodMonths: parseInt(e.target.value)})}
                    required
                    min="1"
                    max="120"
                  />
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Backup Location</label>
                  <select 
                    className="input-field" 
                    style={{ width: '100%' }}
                    value={databaseSettings.backupLocation}
                    onChange={(e) => setDatabaseSettings({...databaseSettings, backupLocation: e.target.value})}
                  >
                    <option value="MySQL Database">MySQL Database</option>
                    <option value="Cloud Storage (AWS S3)">Cloud Storage (AWS S3)</option>
                    <option value="Off-site Data Center">Off-site Data Center</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Backup Settings</button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
