import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ParkingProvider } from './context/ParkingContext';
import { ReservaProvider } from './context/ReservaContext';
import { Home } from './pages/Home';
import { Buscar } from './pages/Buscar';
import { Detalle } from './pages/Detalle';
import { Reservar } from './pages/Reservar';
import { MisReservas } from './pages/MisReservas';

function App() {
  return (
    <Router>
      <ParkingProvider>
        <ReservaProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/buscar" element={<Buscar />} />
            <Route path="/parqueo/:id" element={<Detalle />} />
            <Route path="/reservar/:id" element={<Reservar />} />
            <Route path="/mis-reservas" element={<MisReservas />} />
          </Routes>
        </ReservaProvider>
      </ParkingProvider>
    </Router>
  );
}

export default App;
