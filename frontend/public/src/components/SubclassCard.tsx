import { BuildItem } from '../models/Build'
import Card from './ui/Card'
import V2SubclassCard from './V2SubclassCard'
import V3SubclassCard from './V3SubclassCard'

type Props = {
  item: BuildItem
  onPlugClicked?: Function
  highlights: Array<string>
  className?: string
  isHighlightable?: boolean
  onHighlightableClicked?: Function
}

function SubclassCard(props: Props) {
  const { item, onPlugClicked, highlights, className, isHighlightable, onHighlightableClicked } = props

  return (
    <Card className={className}>
      {item.isLightSubclass ? (
        <V2SubclassCard buildItem={item} highlights={highlights} isHighlightModeOn={isHighlightable} onHighlightableClicked={onHighlightableClicked} />
      ) : (
        <V3SubclassCard buildItem={item} highlights={highlights} isHighlightModeOn={isHighlightable} onHighlightableClicked={onHighlightableClicked} />
      )}
    </Card>
  )
}

export default SubclassCard
