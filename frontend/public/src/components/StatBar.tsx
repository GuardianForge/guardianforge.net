import React from 'react'
import { BuildStatCollection } from '../models/Build'
import Stat from './Stat'
import Card from './ui/Card'

type Props = {
  stats: BuildStatCollection
  highlights: Array<string>
  onStatClicked?: Function
  isHighlightable?: boolean
  onHighlightableClicked?: Function
  className?: string
}

function StatBar(props: Props) {
  const { stats, highlights, onStatClicked, isHighlightable, onHighlightableClicked, className } = props

  return (
    <Card className={`grid grid-cols-3 md:flex gap-2 ${className}`}>
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

    </Card>
  )
}

export default StatBar
