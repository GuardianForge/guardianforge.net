import React from 'react'
import Footer from '../components/Footer'
import BlogNav from '../components/nav/BlogNav'

function BlogLayout({ children }) {
  return (
    <div>
      <BlogNav />
      <div className="main container blog-container">
        <div className="row">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default BlogLayout
