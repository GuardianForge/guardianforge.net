type BuildSummary = {
  id: string
  name: string
  highlights: Array<string>
  primaryIconSet: string
  upvotes: number
  username: string
  isPrivate?: boolean
}

export default BuildSummary