import React from 'react'
import MainLayout from './MainLayout'
import MeLayout from './MeLayout'
import AppLayout from './AppLayout'

function LayoutRouter({ children, location, pageContext }) {
  if(pageContext.layout === "MeLayout") {
    return <MeLayout location={location}>{ children }</MeLayout>
  }
  if(pageContext.layout === "AppLayout") {
    return <AppLayout location={location}>{ children }</AppLayout>
  }
  // if(pageContext.layout === "BlogLayout") {
  //   return <BlogLayout>{ children }</BlogLayout>
  // }
  return <MainLayout>{ children }</MainLayout>
}

export default LayoutRouter
