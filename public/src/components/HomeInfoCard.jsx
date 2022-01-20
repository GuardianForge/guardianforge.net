import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Wrapper = styled.div`
  background-color: #1E1F24;
  border-radius: 5px;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.05);
  padding: 15px;
  margin-bottom: 10px;

  .hiw-header {
    text-align: center;
    font-weight: bold;
    font-size: 1.5rem;
    margin-bottom: 10px;
  }

  .hiw-icon-wrapper {
    display: flex;
    justify-content: center;
  }

  .hiw-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
    border-radius: 15px;
    min-height: 70px;
    min-width: 70px;
  }

  .hiw-icon i {
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.05);
  }

  .hiw-icon-arc {
    background-color: #1cb8df;
  }

  .hiw-icon-solar {
    background-color: #df8b1c;
  }

  .hiw-icon-void {
    background-color: #811cdf;
  }
`

function HomeInfoCard(props) {
  const { icon, title, children } = props
  return (
    <Wrapper className="hiw-card">
      <div className="hiw-header">
        <div className="hiw-icon-wrapper">
          <div className="hiw-icon">
          {/* <div className="hiw-icon" :className="{
              'hiw-icon-arc': color == 'arc',
              'hiw-icon-solar': color == 'solar',
              'hiw-icon-void': color == 'void',
            }"> */}
            <FontAwesomeIcon icon={icon} />
          </div>
        </div>
        <div className="hiw-card-title">
          { title }
        </div>
      </div>
      <div className="hiw-body">
        { children }
      </div>
    </Wrapper>
  )
}

export default HomeInfoCard
