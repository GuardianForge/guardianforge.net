import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Build from './views/Build'
import FindBuilds from './views/FindBuilds'
import FindPlayers from './views/FindPlayers'
import Home from './views/Home'
import OAuthHandler from './views/OAuthHandler'
import PublicGuardian from './views/PublicGuardian'
import PublicProfile from './views/PublicProfile'
import AppMain from './views/app/AppMain'
import AppFindPlayers from './views/app/FindPlayers'
import AppFindBuilds from './views/app/FindBuilds'
import Bookmarks from './views/app/Bookmarks'
import BookmarksMain from './views/Bookmarks'
import MainBookmarks from './views/Bookmarks'
import UserProfile from './views/app/UserProfile'
import GuardianProfileMain from './views/GuardianProfile'
import GuardianProfile from './views/app/GuardianProfile'
import AppBuild from './views/app/Build'
import MyBuilds from './views/app/MyBuilds'
import MyBuildsMain from './views/MyBuilds'
import CreateBuild from './views/app/CreateBuild'
import CreateBuildMain from './views/CreateBuild'
import EditProfile from './views/app/EditProfile'
import EditProfileMain from './views/EditProfile'
import AdminTools from './views/app/admin/AdminTools'
import AdminToolsMain from './views/AdminTools'
import NotFound from './views/NotFound'
import About from './views/About'
import React, { useContext, useEffect, useState } from 'react'
import { GlobalContext } from './contexts/GlobalContext'
import posthog from 'posthog-js'

type Props = {
  to: string
}

function Redirect(props: Props) {
  window.location.replace(props.to)
  return null
}

function LocationHandler() {
  const { isInitDone } = useContext(GlobalContext)
  const location = useLocation()
  const [curr, setCurr] = useState("")

  useEffect(() => {
    const page_path = location.pathname + location.search
    if(isInitDone && curr !== page_path) {
      setCurr(page_path)
      posthog.capture('$pageview')
    }
  }, [location])
  return (<></>)
}

function ForgeRouter() {
  return (
    <BrowserRouter>
      <LocationHandler />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/bookmarks" element={<MainBookmarks />} />
        <Route path="/find-builds" element={<FindBuilds />} />
        <Route path="/find-players" element={<FindPlayers />} />
        <Route path="/edit-profile" element={<EditProfileMain />} />
        <Route path="/create-build" element={<CreateBuildMain />} />
        <Route path="/my-builds" element={<MyBuildsMain />} />
        <Route path="/my-bookmarks" element={<BookmarksMain />} />
        <Route path="/admin-tools" element={<AdminToolsMain />} />
        <Route path="/oauth" element={<OAuthHandler />} />
        <Route path="/build/:buildId" element={<Build />} />
        <Route path="/u/:username" element={<PublicProfile />} />
        <Route path="/g/:guardianKey" element={<GuardianProfileMain />} />


        <Route path="/app" element={<AppMain />} />
        <Route path="/app/find-players" element={<AppFindPlayers />} />
        <Route path="/app/find-builds" element={<AppFindBuilds />} />
        <Route path="/app/bookmarks" element={<Bookmarks />} />
        <Route path="/app/my-builds" element={<MyBuilds />} />
        <Route path="/app/create-build" element={<CreateBuild />} />
        <Route path="/app/u/:username" element={<UserProfile />} />
        <Route path="/app/g/:guardianKey" element={<GuardianProfile />} />
        <Route path="/app/build/:buildId" element={<AppBuild />} />
        <Route path="/app/edit-profile" element={<EditProfile />} />
        <Route path="/app/admin/admin-tools" element={<AdminTools />} />

        {/* Redirects */}
        <Route path="/blog" element={<Redirect to="/blog/index.html" />} />
        <Route path="/docs" element={<Redirect to="/docs/index.html" />} />

        {/* 404s */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default ForgeRouter