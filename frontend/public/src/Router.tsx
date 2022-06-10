import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Build from './views/Build'
import Home from './views/Home'

function ForgeRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/build/:buildId" element={<Build />} />
      </Routes>
    </BrowserRouter>
  )
}

export default ForgeRouter