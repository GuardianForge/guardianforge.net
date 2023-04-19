import React from 'react'
import ForgeModal from './Modal'
import ForgeButton from './forms/Button'

type Props = {
  buildId: string
  show: boolean
  onHide: Function
  onArchived: Function
  onArchiveError: Function
}

function ArchiveBuildModal({ buildId, show, onHide, onArchived, onArchiveError }: Props) {

  async function archiveBuild() {
    let { ForgeClient, ForgeApiService } = window.services
    try {
      let token = ForgeClient.getToken()
      await ForgeApiService.archiveBuild(buildId, token)
      // @ts-ignore TODO: dont use any
      ForgeClient.userBuilds = ForgeClient.userBuilds.filter(b => b.id !== buildId)
    } catch (err) {
      onArchiveError(err)
    } finally {
      onHide()
    }
  }

  return (
    <ForgeModal
      show={show}
      onHide={onHide}
      title="Archive Build" footer={
      <div className="flex gap-1">
        <ForgeButton onClick={() => onHide()}>Cancel</ForgeButton>
        <ForgeButton onClick={() => archiveBuild()}>Archive</ForgeButton>
      </div>
    }>
      <p>
        Archiving a build will do the following:
      </p>
      <ul>
        <li>Remove from "My Builds"</li>
        <li>Remove from search & other public build lists</li>
        <li>Remove upvote & ownership information</li>
      </ul>
      <p>Direct links & bookmarks will still be valid. </p>
      <p><b>This operation CANNOT be undone.</b></p>
    </ForgeModal>
  )
}

export default ArchiveBuildModal