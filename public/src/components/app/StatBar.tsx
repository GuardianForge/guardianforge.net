import React from 'react'
import styled from 'styled-components'
import { BuildStatCollection } from '../../models/Build'
import Stat from './Stat'
import Card from './ui/Card'

const Wrapper = styled(Card)`
  .card-content {
    display: flex;
    flex-wrap: wrap;
  }

  @media (max-width: 576px) {
    .card-content {
      display: grid !important;
      grid-template-columns: repeat(3, 1fr);
    }
    margin: 0 auto;

    img {
      margin: 3px;
    }
  }

  img {
    max-width: 45px;
    padding: 0px 5px;
    border-radius: 5px;
    margin-right: 5px;
  }

  span {
    font-size: 1.3rem;
  }

  &:last-child {
    border-right: 0px !important;
  }
`

type Props = {
  stats: BuildStatCollection
  highlights: Array<string>
  onStatClicked?: Function
  isHighlightable?: boolean
  onHighlightableClicked?: Function
}

function StatBar(props: Props) {
  const { stats, highlights, onStatClicked, isHighlightable, onHighlightableClicked } = props

  return (
    <Wrapper title="Stats">
      {stats.mobility && (
        <Stat
          iconUrl="/img/stats/mob.png"
          value={stats.mobility.value}
          name="mobility"
          onClick={onStatClicked ? onStatClicked : undefined}
          highlights={highlights}
          onHighlightableClicked={onHighlightableClicked}
          isHighlightable={isHighlightable} />
      )}

      {stats.resilience && (
        <Stat
          iconUrl="/img/stats/res.png"
          value={stats.resilience.value}
          name="resilience"
          onClick={onStatClicked ? onStatClicked : undefined}
          highlights={highlights}
          onHighlightableClicked={onHighlightableClicked}
          isHighlightable={isHighlightable}/>
      )}

      {stats.recovery && (
        <Stat
          iconUrl="/img/stats/rec.png"
          value={stats.recovery.value}
          name="recovery"
          onClick={onStatClicked ? onStatClicked : undefined}
          highlights={highlights}
          onHighlightableClicked={onHighlightableClicked}
          isHighlightable={isHighlightable} />
      )}

      {stats.discipline && (
        <Stat
          iconUrl="/img/stats/dis.png"
          value={stats.discipline.value}
          name="discipline"
          onClick={onStatClicked ? onStatClicked : undefined}
          highlights={highlights}
          onHighlightableClicked={onHighlightableClicked}
          isHighlightable={isHighlightable} />
      )}

      {stats.intellect && (
        <Stat
          iconUrl="/img/stats/int.png"
          value={stats.intellect.value}
          name="intellect"
          onClick={onStatClicked ? onStatClicked : undefined}
          highlights={highlights}
          onHighlightableClicked={onHighlightableClicked}
          isHighlightable={isHighlightable} />
      )}

      {stats.strength && (
        <Stat
          iconUrl="/img/stats/str.png"
          value={stats.strength.value}
          name="strength"
          onClick={onStatClicked ? onStatClicked : undefined}
          highlights={highlights}
          onHighlightableClicked={onHighlightableClicked}
          isHighlightable={isHighlightable} />
      )}
    </Wrapper>
  )
}

export default StatBar
