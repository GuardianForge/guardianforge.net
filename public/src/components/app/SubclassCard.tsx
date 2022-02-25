import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Plug from './Plug'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'
import { BuildItem } from '../../models/Build'
import Card from './ui/Card'
import colors from '../../colors'
import V2SubclassCard from './V2SubclassCard'
import V3SubclassCard from './V3SubclassCard'

const Wrapper = styled(Card)`
	.subclass-card {
		width: 100%;
		display: flex;
		flex-direction: row;
		text-align: left;
		border-radius: 5px;
		padding: 5px;
		min-width: 287px;
	}
	.base-light-config {
		display: flex;
	}
	.base-light-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100px;
		img {
			max-width: 65px;
			margin: 2px;
		}
	}
	.light-config-tree {
		display: flex;
		flex-direction: column;
	}
	.light-tree-perk-wrapper {
		display: flex;
		border: 2px solid #14151a;
		border-radius: 5px;
		padding: 1px;
		img {
			width: 62px;
		}
		&.highlighted {
			padding: 0px;
		}
	}
	.tree-perk {
		margin: 5px;
	}
	.item-icon-wrapper {
		position: relative;
		height: 80px;
		width: 80px;
		margin-right: 5px;
	}
	.item-icon-wrapper-sm {
		margin: 0 auto;
	}
	.item-icon {
		max-width: 75px;
		border-radius: 5px;
		margin-right: 5px;
	}
	.affinity-icon {
		position: absolute;
		bottom: 0;
		right: 0;
		height: 30px;
		border-radius: 100px;
	}
	.item-name {
		font-weight: bold;
	}
	.socket-icon-wrapper {
		display: flex;
		flex-wrap: wrap;

    .socket-icon img {
      background-color: ${colors.theme2.socketIconBg};
    }
	}
	.socket-icon {
		img {
			max-width: 45px;
			margin: 0px 3px 3px 0px;
			border-radius: 5px;
		}
	}
	.light-subclass {
		width: 100%;
		display: flex;
		justify-content: space-between;
	}
	.light-character {
		img {
			max-width: 200px;
		}
	}
  .super-plug-icon {
    border-radius: 5px;
  }

  @media screen and (max-width: 796px) {
    .light-subclass {
      flex-direction: column;
    }

    .item-name {
      text-align: center;
    }

    .subclass-card {
      max-width: 287px;
      justify-content: center;
    }

    .base-light-config {
      justify-content: space-evenly;
    }

    .base-light-item {
      width: 33.333%;
      max-width: 75px;
    }

    .base-light-item img {
      width: 50px;
    }

    .light-config-tree {
      margin-top: 10px;
    }

    .tree-perk img {
      max-width: 50px;
    }

    .sockets {
      margin-top: 10px;
    }
  }
`

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
