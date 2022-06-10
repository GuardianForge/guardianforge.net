import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppMain from './views/app/AppMain'
import Build from './views/Build'
import FindBuilds from './views/FindBuilds'
import FindPlayers from './views/FindPlayers'
import Home from './views/Home'
import OAuthHandler from './views/OAuthHandler'
import PublicGuardian from './views/PublicGuardian'
import PublicProfile from './views/PublicProfile'

function ForgeRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find-builds" element={<FindBuilds />} />
        <Route path="/find-players" element={<FindPlayers />} />
        <Route path="/oauth" element={<OAuthHandler />} />
        <Route path="/build/:buildId" element={<Build />} />
        <Route path="/u/:username" element={<PublicProfile />} />
        <Route path="/g/:guardianKey" element={<PublicGuardian />} />
        <Route path="/app" element={<AppMain />}>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default ForgeRouter