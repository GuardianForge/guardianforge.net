import React from 'react'
import styled from 'styled-components'
import colors from '../../colors'

const Wrapper = styled.div`
  display: flex;

  .affinity-icon {
    display: inline-block;
    width: 30px;
    margin-right: 5px;
  }

  .tier-pill {
    display: inline-block;
    width: 40px;
    border: 2px solid ${colors.theme2.dark3};
    border-radius: 5px;
    margin-right: 5px;
  }

  .available {
    border: 2px solid ${colors.theme2.text};
  }

  .filled {
    background-color: ${colors.theme2.text};
  }
`

type Props = {
  capacity: number
  value: number
  affinityIcon: string
}

function ItemTierBar(props: Props) {
  const { capacity, value, affinityIcon } = props

  return (
    <Wrapper>
      <div>
        <img className="affinity-icon" src={affinityIcon} />
      </div>
      {[1,2,3,4,5,6,7,8,9,10].map(el => (
        <div className={`tier-pill ${el <= capacity ? 'available': ''} ${el <= value ? 'filled' : ''}`}>&nbsp;</div>
      ))}
    </Wrapper>
  )
}

export default ItemTierBar