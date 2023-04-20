import React, { useState } from 'react'
import ForgeModal, { ForgeModalProps } from './Modal'
import { faYoutube } from '@fortawesome/free-brands-svg-icons'
import { faCube, faStickyNote } from '@fortawesome/free-solid-svg-icons'
import { COMP_STATE, inputStyleOptions } from '../constants'
import ActivityOption from '../models/ActivityOption'
import ModalSelectorOption from '../models/ModalSelectorOption'
import ActivitySelector from './ActivitySelector'
import YouTubeEmbed from './YouTubeEmbed'
import Input from './forms/Input'
import ModalSelector from './forms/ModalSelector'
import TextArea from './forms/TextArea'
import BuildSummary from '../models/BuildSummary'
import ForgeButton from './forms/Button'

interface Props {
  buildId: string
  name: string
  notes: string
  videoLink: string
  activity: ActivityOption
  inputStyle: ModalSelectorOption
  onUpdateFailed: Function
  onUpdated: Function
  show: boolean
  onHide: Function
}

function EditBuildModal(props: Props) {
  const { show, onHide, buildId, name, notes, videoLink, activity, inputStyle, onUpdated, onUpdateFailed } = props
  const [_state, setState] = useState(COMP_STATE.DONE)
  const [_name, setName] = useState(name)
  const [_notes, setNotes] = useState(notes)
  const [_videoLink, setVideoLink] = useState(videoLink)
  const [_activity, setActivity] = useState<ActivityOption>(activity)
  const [_inputStyle, setInputStyle] = useState<ModalSelectorOption>(inputStyle)

  async function update() {
    try {
      setState(COMP_STATE.SAVING)
      let updates = {
        name: _name,
        notes: _notes,
        primaryActivity: _activity.value,
        inputStyle: _inputStyle.value,
        videoLink: _videoLink
      }

      let { ForgeClient, ForgeApiService } = window.services
      let token = ForgeClient.getToken()
      await ForgeApiService.updateBuild(buildId, updates, token)

      // Update cache
      ForgeClient.userBuilds.forEach((b: BuildSummary) => {
        if(b.id === buildId) {
          b.name = name
        }
      })
      onUpdated(updates)
    } catch (err) {
      onUpdateFailed(err)
    } finally {
      setState(COMP_STATE.DONE)
    }
  }

  return (
    <ForgeModal
      show={show}
      onHide={onHide}
      title="Edit build"
      footer={
        <div className="flex gap-1">
          <ForgeButton disabled={_state === COMP_STATE.SAVING} onClick={() => onHide()}>Cancel</ForgeButton>
          <ForgeButton disabled={_state === COMP_STATE.SAVING} style={{marginLeft: "10px"}} onClick={() => update()}>Save</ForgeButton>
        </div>
      }>

      <div className="build-info-card mb-3">
        <span>Name</span>
        <Input
          prefixIcon={faCube}
          placeholder='Give your build a name'
          value={_name}
          onChange={(e: any) => setName(e.target.value)}
          className="mb-3" />
        <span>Notes</span>
        <TextArea
          className="mb-3"
          prefixIcon={faStickyNote}
          rows={10}
          placeholder="Add some notes on how to use the build"
          value={_notes}
          onChange={(e: any) => setNotes(e.target.value)}/>
        <span>Primary Activity</span>
        <ActivitySelector
          className="mb-3"
          value={_activity}
          onChange={(opt: ActivityOption) => setActivity(opt)} />
        <span>Input Style</span>
        <ModalSelector
          title="Input Style"
          className="mb-3"
          options={inputStyleOptions}
          value={_inputStyle}
          onChange={(opt: ModalSelectorOption) => setInputStyle(opt)} />
      </div>
      
      <h4>Video Review</h4>
      <div className="build-info-card">
        <Input
          prefixIcon={faYoutube}
          placeholder="Add a YouTube link"
          value={_videoLink}
          className="mb-3"
          onChange={(e: any) => setVideoLink(e.target.value)} />
        <YouTubeEmbed youtubeUrl={_videoLink} showPlaceholder />
      </div>
    </ForgeModal>
  )
}

export default EditBuildModal