const path = require('path');

const pageLayoutMap = {
  "/me": "MeLayout",
  "/blog": "BlogLayout",
  "/app": "AppLayout"
}

exports.onCreatePage = ({ page, actions }) => {
  const { createPage } = actions

  Object.keys(pageLayoutMap).forEach(k => {
    if(page.path.startsWith(k)) {
      page.context.layout = pageLayoutMap[k]
      createPage(page)
    }
  })
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      allWpPost {
        edges {
          node {
            id
            slug
          }
        }
      }

      allWpDocument {
        edges {
          node {
            id
            slug
          }
        }
      }
    }
  `)

  if (result.errors) {
    console.error(result.errors)
    return
  }

  const template = path.resolve("./src/templates/post.jsx")
  const posts = result.data.allWpPost.edges

  posts.forEach(p => {
    createPage({
      path: `/blog/${p.node.slug}`,
      component: template,
      context: {
        id: p.node.id
      }
    })
  })

  const docsTemplate = path.resolve("./src/templates/doc.jsx")
  const docs = result.data.allWpDocument.edges

  docs.forEach(p => {
    createPage({
      path: `/docs/${p.node.slug}`,
      component: docsTemplate,
      context: {
        id: p.node.id
      }
    })
  })
}