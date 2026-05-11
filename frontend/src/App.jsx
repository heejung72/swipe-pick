import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Create from './pages/Create.jsx'
import Swipe from './pages/Swipe.jsx'
import Result from './pages/Result.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/swipe/:code" element={<Swipe />} />
        <Route path="/result/:code" element={<Result />} />
      </Routes>
    </BrowserRouter>
  )
}
