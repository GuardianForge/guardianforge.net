import React from 'react'
import { BuildStatCollection } from '../models/Build'
import Stat from './Stat'
import Card from './ui/Card'

type Props = {
  stats: BuildStatCollection
  className?: string
}

function StatBar(props: Props) {
  const { stats, className } = props

  return (
    <Card className={`grid grid-cols-3 md:flex gap-2 ${className}`}>
      {stats.mobility && (
        <Stat
          iconUrl="/img/stats/mob.png"
          value={stats.mobility.value}
          name="mobility" />
      )}

      {stats.resilience && (
        <Stat
          iconUrl="/img/stats/res.png"
          value={stats.resilience.value}
          name="resilience"/>
      )}

      {stats.recovery && (
        <Stat
          iconUrl="/img/stats/rec.png"
          value={stats.recovery.value}
          name="recovery" />
      )}

      {stats.discipline && (
        <Stat
          iconUrl="/img/stats/dis.png"
          value={stats.discipline.value}
          name="discipline" />
      )}

      {stats.intellect && (
        <Stat
          iconUrl="/img/stats/int.png"
          value={stats.intellect.value}
          name="intellect" />
      )}

      {stats.strength && (
        <Stat
          iconUrl="/img/stats/str.png"
          value={stats.strength.value}
          name="strength" />
      )}

    </Card>
  )
}

export default StatBar
