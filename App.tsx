
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FinderPage from './pages/FinderPage';
import HealthRecordPage from './pages/HealthRecordPage';
import HealthMonitorPage from './pages/HealthMonitorPage';
import ProfilePage from './pages/ProfilePage';
import AppointmentPage from './pages/AppointmentPage';
import GeoMapPage from './pages/GeoMapPage';
import Layout from './components/Layout';
import PrescriptionGeneratorPage from './pages/PrescriptionGeneratorPage';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/prescription" element={<PrescriptionGeneratorPage />} />
          <Route path="/clinics" element={<FinderPage pageType="clinic" />} />
          <Route path="/hospitals" element={<FinderPage pageType="hospital" />} />
          <Route path="/pharmacies" element={<FinderPage pageType="pharmacy" />} />
          <Route path="/appointments" element={<AppointmentPage />} />
          <Route path="/records" element={<HealthRecordPage />} />
          <Route path="/monitor" element={<HealthMonitorPage />} />
          <Route path="/map" element={<GeoMapPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Layout>
      <Chatbot />
    </HashRouter>
  );
};

export default App;