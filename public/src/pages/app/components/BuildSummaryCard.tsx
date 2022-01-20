import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { navigate } from 'gatsby'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import UpvoteIcon from './UpvoteIcon'
// @ts-ignore
import { imageFixerMap } from '../../../utils/shims'
import BuildSummary from '../models/BuildSummary'
import colors from "../../../colors"

const Wrapper = styled.div`
  padding: 5px 10px;
  box-shadow: 2px 2px 2px rgba(0,0,0,0.05);
  background-color: ${colors.theme2.dark2};
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid ${colors.theme2.border};
  margin-bottom: 10px;

&:hover {
  border: 1px solid ${colors.theme2.accent2};
}

.build-summary-header {
  display: flex;

  .build-summary-name {
    font-weight: bold;
    flex: 1;
  }

}

.build-summary-card-main {
  display: flex;
  img {
    max-width: 55px;
    margin: 0px 3px 3px 0px;
    border-radius: 5px;
  }
}

.class-subclass-icon {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.class-icon {
  position: absolute;
  width: 30px;
}

.build-summary-footer {
  display: flex;
  justify-content: space-between;
}

@media screen and (min-width: 576px) {
  .build-summary-card-main img {
    max-width: 45px;
    margin: 0px 3px 3px 0px;
    border-radius: 5px;
  }

  .class-icon {
    width: 35px;
  }
}
`

type Props = {
  buildSummary: BuildSummary
}

function BuildSummaryCard(props: Props) {
  const { buildSummary } = props
  const [highlight1IconUrl, setHighlight1IconUrl] = useState("")
  const [highlight2IconUrl, setHighlight2IconUrl] = useState("")
  const [highlight3IconUrl, setHighlight3IconUrl] = useState("")

  useEffect(() => {
    if(buildSummary.highlights) {
      if(buildSummary.highlights[0]) {
        if(imageFixerMap[buildSummary.highlights[0]]) {
          setHighlight1IconUrl(imageFixerMap[buildSummary.highlights[0]])
        } else {
          setHighlight1IconUrl(buildSummary.highlights[0])
        }
      }
      if(buildSummary.highlights[1]) {
        if(imageFixerMap[buildSummary.highlights[1]]) {
          setHighlight2IconUrl(imageFixerMap[buildSummary.highlights[1]])
        } else {
          setHighlight2IconUrl(buildSummary.highlights[1])
        }
      }
      if(buildSummary.highlights[2]) {
        if(imageFixerMap[buildSummary.highlights[2]]) {
          setHighlight3IconUrl(imageFixerMap[buildSummary.highlights[2]])
        } else {
          setHighlight3IconUrl(buildSummary.highlights[2])
        }
      }
    }
  }, [])

  function goToBuild() {
    navigate(`/app/build/${buildSummary.id}`)
  }

  return (
    <Wrapper onClick={goToBuild}>
      <div className="build-summary-header">
        <div className="build-summary-name">
          { buildSummary.name }
        </div>
      </div>
      <div className="build-summary-card-main">
        <div className="class-subclass-icon" v-if="buildSummary.primaryIconSet">
          <img src={`/img/classicos/${buildSummary.primaryIconSet.split('-')[0]}.png`}
            alt="Guardian Class/Subclass Icon"
            className={`img-fluid class-icon class-icon-${buildSummary.primaryIconSet.split('-')[0]}`}
          />
          {buildSummary.primaryIconSet.split('-').length > 2 ? (
            <img
              alt="Guardian Class/Subclass Icon"
              src={`/img/subbgs/${buildSummary.primaryIconSet.split('-')[1]}-${buildSummary.primaryIconSet.split('-')[2]}.png`}
              className="img-fluid subclass-icon"/>
          ) : (
            <img
              alt="Guardian Class/Subclass Icon"
              src={`/img/subbgs/${buildSummary.primaryIconSet.split('-')[1]}.png`}
              className="img-fluid subclass-icon"/>
          )}
        </div>
        {highlight1IconUrl && (
          <img alt="Build Higlighted Item 1" src={highlight1IconUrl} className="img-fluid" />
        )}
        {highlight2IconUrl && (
          <img alt="Build Higlighted Item 2" src={highlight2IconUrl} className="img-fluid" />
        )}
        {highlight3IconUrl && (
          <img alt="Build Higlighted Item 3" src={highlight3IconUrl} className="img-fluid" />
        )}
      </div>
      <div className="build-summary-footer">
        <div>
          <FontAwesomeIcon icon="user"/> { buildSummary.username }
        </div>
        {buildSummary.upvotes !== undefined && buildSummary.upvotes > 0 && (
          <div>
            <UpvoteIcon filled />
            { buildSummary.upvotes }
          </div>
        )}
      </div>
    </Wrapper>
  )
}

export default BuildSummaryCard
