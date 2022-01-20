import React, { useState } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  img {
    max-height: 20px;
    max-width: 25px;
  }

  .guardian-class-opt-titan.selected {
    background-color: rgb(188,58,34) !important;
  }

  .guardian-class-opt-hunter.selected {
    background-color: rgb(105,164,182) !important;
  }

  .guardian-class-opt-warlock.selected {
    background-color: rgb(234,178,59) !important;
  }
`


function ClassRefinementList({ refine }) {
  const [guardianClass, setGuardianClass] = useState("")

  function onFilterClicked(value) {
    if(guardianClass === value) {
      setGuardianClass("")
      refine([])
    } else {
      setGuardianClass(value)
      refine(value)
    }
  }

  return (
    <Wrapper className="btn-group" role="group">
      <input type="radio" className="btn-check" name="guardianClass" id="optTitan" value="0" onClick={() => onFilterClicked("0")}/>
      <label className={"btn btn-secondary guardian-class-opt guardian-class-opt-titan opt-w-tooltip " +  (guardianClass === '0' ? 'selected' : '')}
        for="optTitan"
        data-bs-toggle="tooltip"
        data-bs-placement="bottom"
        title="Titan">
        <img src="/img/classicos/0nom.png" />
      </label>

      <input type="radio" className="btn-check" name="guardianClass" id="optHunter" value="1" onClick={() => onFilterClicked("1")}/>
      <label className={"btn btn-secondary guardian-class-opt guardian-class-opt-hunter opt-w-tooltip " +  (guardianClass === '1' ? 'selected' : '')}
        for="optHunter"
        data-bs-toggle="tooltip"
        data-bs-placement="bottom"
        title="Hunter">
        <img src="/img/classicos/1nom.png"/>
      </label>

      <input type="radio" className="btn-check guardian-class-opt" name="guardianClass" id="optWarlock" value="2" onClick={() => onFilterClicked("2")}/>
      <label className={"btn btn-secondary guardian-class-opt guardian-class-opt-warlock opt-w-tooltip " +  (guardianClass === '2' ? 'selected' : '')}
        for="optWarlock"
        data-bs-toggle="tooltip"
        data-bs-placement="bottom"
        title="Warlock">
        <img src="/img/classicos/2nom.png"/>
      </label>
    </Wrapper>
  )
}

export default ClassRefinementList


  // {
  //   "attribute": "class",
  //   "canRefine": true,
  //   "currentRefinement": [],
  //   "facetOrdering": true,
  //   "isFromSearch": false,
  //   "items": [
  //       {
  //           "count": 70,
  //           "isRefined": false,
  //           "label": "0",
  //           "value": [
  //               "0"
  //           ]
  //       },
  //       {
  //           "count": 10,
  //           "isRefined": false,
  //           "label": "2",
  //           "value": [
  //               "2"
  //           ]
  //       },
  //       {
  //           "count": 8,
  //           "isRefined": false,
  //           "label": "1",
  //           "value": [
  //               "1"
  //           ]
  //       }
  //   ],
  //   "limit": 10,
  //   "operator": "or",
  //   "showMore": false,
  //   "showMoreLimit": 20
  // }