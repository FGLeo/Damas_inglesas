import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Inicio from '@/pages/Inicio'
import Partida from '@/pages/Partida'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/partida" element={<Partida />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
