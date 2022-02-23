type BuildSummary = {
  id: string
  name: string
  highlights: Array<string>
  primaryIconSet: string
  upvotes: number
  username: string
  isPrivate?: boolean
  userId?: string
  publishedOn?: number
}

export default BuildSummary