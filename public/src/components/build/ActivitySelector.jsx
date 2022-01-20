import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import activityOptions from '../../utils/activityOptions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Wrapper = styled.div`
  color: #eee;

  .activity-select-activator {
    text-align: left !important;
    background-color: #333;
    border-color: #444;
    color: #eee;
    width: 100%;
    display: flex;
    justify-content: space-between;
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

function ActivitySelector({ value, onChange }) {
  const [options, setOptions] = useState([])
  const [areOptionsOpen, _setAreOptionsOpen] = useState(false)
  const areOptionsOpenRef = useRef(areOptionsOpen)
  const setAreOptionsOpen = data => {
    areOptionsOpenRef.current = data
    _setAreOptionsOpen(data)
  }

  useEffect(() => {
    setOptions(activityOptions)

    let rootEl = document.getElementById("activitySelector")
    let activitySelectorOptionsWrapper = document.getElementById("activitySelectorOptionsWrapper")
    activitySelectorOptionsWrapper.style.width = `${rootEl.offsetWidth}px`;

    window.addEventListener("resize", function() {
      activitySelectorOptionsWrapper.style.width = `${rootEl.offsetWidth}px`;
    })

    document.addEventListener("click", function(e) {
      if(areOptionsOpenRef.current) {
        setAreOptionsOpen(false)
      }
    })
  }, [])

  function onOptionClicked(activity) {
    setAreOptionsOpen(false)
    onChange(activity)
  }

  function showOptions() {
    setTimeout(() => setAreOptionsOpen(true))
  }

  return (
    <Wrapper id="activitySelector">
      <button className="btn btn-secondary activity-select-activator" onClick={showOptions}>
        <Selection>
          {value.iconUrl && <img className="activity-icon" src={value.iconUrl} />}
          <span>{ value.display }</span>
        </Selection>
        <span><FontAwesomeIcon icon="caret-down" /></span>
      </button>
      <div id="activitySelectorOptionsWrapper" className="activity-selector-options-wrapper">
        {areOptionsOpen && (
          <div className="activity-selector-options">
            {options.map((el, idx) => (
              <div key={`activity-${idx}`} className="activity-option" onClick={() => onOptionClicked(el)}>
                {el.iconUrl && <img className="activity-icon" src={el.iconUrl} />}
                { el.display }
              </div>
            ))}
          </div>
        )}
      </div>
    </Wrapper>
  )
}

export default ActivitySelector
