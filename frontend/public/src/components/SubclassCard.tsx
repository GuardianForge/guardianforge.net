import { BuildItem } from '../models/Build'
import Card from './ui/Card'
import V2SubclassCard from './V2SubclassCard'
import V3SubclassCard from './V3SubclassCard'

type Props = {
  item: BuildItem
  onPlugClicked?: Function
  className?: string
  onHighlightableClicked?: Function
}

function SubclassCard(props: Props) {
  const { item, className } = props

  return (
    <Card className={className}>
      {item.isLightSubclass ? (
        <V2SubclassCard buildItem={item} />
      ) : (
        <V3SubclassCard buildItem={item} />
      )}
    </Card>
  )
}

export default SubclassCard
