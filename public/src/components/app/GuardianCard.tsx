import React, { MouseEventHandler } from 'react'
import styled from 'styled-components'
import colors from '../../colors'
// @ts-ignore
import { classes, races } from "../../constants"

const Wrapper = styled.div`
	height: 96px;
	width: 474px;
	margin-bottom: 7px;
	border-radius: 5px;
	display: flex;
	justify-content: space-between;
	box-shadow: 2px 2px 2px rgba(0,0,0,0.05);
	border: 1px solid rgba(0,0,0,0);

	&:hover {
		cursor: pointer;
		border: 1px solid ${colors.theme2.accent2};
	}
	.class-name {
		color: #eee;
		font-weight: bold;
		font-size: 1.5rem;
	}
	.race-name {
		color: #aaa;
		font-size: 1.1rem;
	}
	.light {
		font-weight: bold;
		font-size: 1.8rem;
		color: #e5d163;
		text-shadow: 0 2px 1px rgba(0,0,0,0.2);
	}
  .character-card-left {
    padding: 10px 50px 0px 110px;
    display: flex;
    flex-direction: column;
    text-align: left;
  }
  .character-card-right {
    padding: 10px;
  }

  @media only screen and (max-width: 474px) {
    width: 100%;
  }
`

type Props = {
	classType: string
	light: string
	raceType: string
	emblemUrl: string
	onClick: React.MouseEventHandler
}

function GuardianCard(props: Props) {
	const {classType, light, raceType, emblemUrl, onClick} = props

  const className = classes[classType]
  const raceName = races[raceType]

  return (
    <Wrapper onClick={onClick} style={{backgroundImage: `url('https://www.bungie.net/${emblemUrl}')`}}>
      <div className="character-card-left">
        <span className="class-name">{className}</span>
        <span className="race-name">{raceName}</span>
      </div>
      <div className="character-card-right">
        <span className="light">{light}</span>
      </div>
    </Wrapper>
  )
}

export default GuardianCard
