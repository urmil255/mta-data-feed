import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import CurrentOutages from './CurrentOutages';
import UpcomingOutages from './UpcomingOutages';
import EquipmentDisplay from './EquipmentDisplay';
import { OutagesProvider } from './OutagesContext';

function App() {
  return (
    <OutagesProvider>
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <NavLink to="/" style={({ isActive }) => ({ color: isActive ? 'red' : 'white' })}>
                  Current Outages
                </NavLink>
              </li>
              <li>
                <NavLink to="/equipment-display" style={({ isActive }) => ({ color: isActive ? 'red' : 'white' })}>
                  Equipment Display
                </NavLink>
              </li>
              <li>
                <NavLink to="/upcoming-outages" style={({ isActive }) => ({ color: isActive ? 'red' : 'white' })}>
                  Upcoming Outages
                </NavLink>
              </li>
            </ul>
          </nav>
          <div className="content">
            <Routes>
              <Route path="/" element={<CurrentOutages />} />
              <Route path="/equipment-display" element={<EquipmentDisplay />} />
              <Route path="/upcoming-outages" element={<UpcomingOutages />} />
            </Routes>
          </div>
        </div>
      </Router>
    </OutagesProvider>
  );
}

export default App;
