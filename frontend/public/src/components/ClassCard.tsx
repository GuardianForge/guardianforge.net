import { Enums } from '../data-utils/Main';
import React from 'react';
import styled from 'styled-components';
import colors from '../colors';
import Card from './ui/Card';

const Wrapper = styled(Card)`
  .class-card-content {
    display: flex;
    align-items: center;
    font-size: 21px;
  }

  .ico-wrapper {
    height: 29px;
    width: 29px;
    padding: 5px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;

    img {
      height: 20px;
    }
  }

  .ico-wrapper-0 {
    background-color: ${colors.classes.Titan};
  }

  .ico-wrapper-1 {
    background-color: ${colors.classes.Hunter};
  }

  .ico-wrapper-2 {
    background-color: ${colors.classes.Warlock};
  }
`

type Props = {
  classType?: Enums.ClassEnum
}

function ClassCard(props: Props) {
  const { classType } = props

  return (
    <Wrapper>
      {classType === Enums.ClassEnum.Titan && (
        <div className="class-card-content">
          <div className="ico-wrapper ico-wrapper-0">
            <img src="/img/classicos/0nom.png" />
          </div>
          <div className="class-name">
            Titan
          </div>
        </div>
      )}
      {classType === Enums.ClassEnum.Hunter && (
        <div className="class-card-content">
          <div className="ico-wrapper ico-wrapper-1">
            <img src="/img/classicos/1nom.png" />
          </div>
          <div className="class-name">
            Hunter
          </div>
        </div>
      )}
      {classType === Enums.ClassEnum.Warlock && (
        <div className="class-card-content">
          <div className="ico-wrapper ico-wrapper-2">
            <img src="/img/classicos/2nom.png" />
          </div>
          <div className="class-name">
            Warlock
          </div>
        </div>
      )}
    </Wrapper>
  )
}

export default ClassCard;
