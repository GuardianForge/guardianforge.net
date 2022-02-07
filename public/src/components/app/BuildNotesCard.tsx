import React, { useEffect, useState } from 'react';
import Build from '../../models/Build';
// @ts-ignore TODO: Move this into the API
import activityOptions from '../../utils/activityOptions'
import ActivityOption from '../../models/ActivityOption';
import Card from './ui/Card';
import styled from 'styled-components';
import colors from '../../colors';
import ForgeModal from './Modal';
import ForgeButton from './forms/Button';

const Wrapper = styled(Card)`
  .read-more-link {
    color: ${colors.theme2.text};
    font-style: italic;
    margin-top: 10px;
  }

  .works-with-header {
    margin-top: 10px;
    font-weight: bold;
  }

  img {
    height: 40px;
  }
`

type Props = {
  notes?: string
  primaryActivityKey?: string
  inputStyle?: string
}

function BuildNotesCard(props: Props) {
  const { notes, primaryActivityKey, inputStyle } = props

  const [primaryActivity, setPrimaryActivity] = useState<ActivityOption>()
  const [displayNotes, setDisplayNotes] = useState<string>()
  const [areNotesLong, setAreNotesLong] = useState(false)
  const [isNotesDialogDisplayed, setIsNotesDialogDisplayed] = useState(false)
  const [reformattedNotes, setReformattedNotes] = useState("")

  useEffect(() => {
    if(primaryActivityKey) {
      let activity = activityOptions.find((el: ActivityOption) => el.value === primaryActivityKey)
      if(activity && activity.value !== '1') {
        setPrimaryActivity(activity)
      }
    }

    if(notes) {
      let reformatted = notes.replace(/\n/g, "<br/>")
      setReformattedNotes(reformatted)
      if(notes.length > 500) {
        setDisplayNotes(reformatted.slice(0, 499) + "...")
        setAreNotesLong(true)
      } else {
        setDisplayNotes(reformatted)
      }
    }
  }, [])

  return (
    <Wrapper title="Notes & Play Style">
      {displayNotes && <div dangerouslySetInnerHTML={{__html: displayNotes}} />}
      {areNotesLong && <a href="#" className="read-more-link" onClick={() => setIsNotesDialogDisplayed(true)}>Read more</a>}

      {(primaryActivity || inputStyle) && (<div className="works-with-header">Works Best With</div>)}
      <div className="build-info-icons">
        {primaryActivity && <img src={primaryActivity.iconUrl} />}
        {inputStyle === '1' && (<img src="/img/input-icons/mnk.png" />)}
        {inputStyle === '2' && (<img src="/img/input-icons/controller.png" />)}
      </div>
      <ForgeModal show={isNotesDialogDisplayed} title="Build Notes" size="lg" scrollable footer={<ForgeButton onClick={() => setIsNotesDialogDisplayed(false)}>Close</ForgeButton>}>
        <>
          {notes && <div dangerouslySetInnerHTML={{__html: reformattedNotes}} />}
        </>
      </ForgeModal>
    </Wrapper>
  )
}

export default BuildNotesCard;
