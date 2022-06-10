import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Build from './views/Build'
import FindBuilds from './views/FindBuilds'
import FindPlayers from './views/FindPlayers'
import Home from './views/Home'
import OAuthHandler from './views/OAuthHandler'

function ForgeRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find-builds" element={<FindBuilds />} />
        <Route path="/find-players" element={<FindPlayers />} />
        <Route path="/oauth" element={<OAuthHandler />} />
        <Route path="/build/:buildId" element={<Build />} />
      </Routes>
    </BrowserRouter>
  )
}

export default ForgeRouter