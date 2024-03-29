import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ActivityOption from '../models/ActivityOption'
import ForgeModal from './Modal'
import ForgeButton from './forms/Button'
import colors from '../colors'
import { Button } from 'react-bootstrap'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { activityOptions } from '../constants'

const Wrapper = styled.div`
  color: #eee;

  .activity-select-activator {
    text-align: left !important;
    color: #eee;
    width: 100%;
    display: flex;
    justify-content: space-between;
    border: none !important;
  }

  .activity-selector-options-wrapper {
    position: absolute;
  }

  .activity-selector-options {
    position: relative;
    display: flex;
    flex-direction: column;
    z-index: 2000;
    border-top: 0px;
    background-color: #333;
  }

  .activity-option {
    padding: 2px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .activity-option:hover {
    border-right: 2px solid #eee;
    color: #ccc;
  }

  .activity-icon {
    max-width: 20px;
    margin-right: 5px;
  }
`

const Selection = styled.div`
  display: flex;
  align-items: center;
`

const SelectItemButton = styled(Button)`
  width: 100%;
  display: flex !important;
  align-items: center;
  justify-content: start;
  font-size: 18px !important;
  margin-bottom: 10px;

  img {
    width: 35px;
    height: 35px;
    margin-right: 10px;
  }
`

type Props = {
  value: ActivityOption
  onChange: Function
  className?: string
}

function ActivitySelector(props: Props) {
  const { className, value, onChange } = props
  const [options, setOptions] = useState<Array<ActivityOption>>([])
  const [areOptionsOpen, setAreOptionsOpen] = useState(false)

  useEffect(() => {
    let opts = activityOptions.filter((o: ActivityOption) => o.isArchived !== true);
    setOptions(opts)
  }, [])

  function onOptionClicked(activity: ActivityOption) {
    setAreOptionsOpen(false)
    onChange(activity)
  }

  function showOptions() {
    setTimeout(() => setAreOptionsOpen(true))
  }

  return (
    <Wrapper id="activitySelector" className={className}>
      <ForgeButton className="activity-select-activator bg-neutral-700 hover:bg-neutral-600" onClick={showOptions}>
        <Selection>
          {value.iconUrl && <img className="activity-icon" src={value.iconUrl} alt="Activity Icon" />}
          <span>{ value.display }</span>
        </Selection>
        <span><FontAwesomeIcon icon={faCaretDown} /></span>
      </ForgeButton>
      <ForgeModal
        show={areOptionsOpen}
        title="Select Activity"
        footer={<ForgeButton onClick={() => setAreOptionsOpen(false)}>Close</ForgeButton>}>
        {options.map((el: ActivityOption, idx: number) => (
          <SelectItemButton key={`activity-${idx}`} className="activity-option rounded-none border border-neutral-700 hover:bg-neutral-800" onClick={() => onOptionClicked(el)}>
            {el.iconUrl && <img className="activity-icon" src={el.iconUrl} />}
            { el.display }
          </SelectItemButton>
        ))}
      </ForgeModal>
    </Wrapper>
  )
}

export default ActivitySelector
