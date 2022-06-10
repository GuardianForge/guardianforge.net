import React, { MouseEventHandler } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import styled from 'styled-components';
import colors from '../colors';

const Wrapper = styled.div`

  .tree-diamond {
    transform: rotate(-45deg);
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 0px;
    height: 200px;
    width: 200px;
    border: 4px solid rgba(150,150,150,0.7);

    &-selected {
      border: 4px solid ${colors.theme2.accent1};
    }

    &-clickable:hover {
      cursor: pointer;
      border: 4px solid ${colors.theme2.accent2}
    }

    .img-wrapper-outer {
      padding: 3px;
    }

    .img-wrapper-outer-1 {
      border-right: 6px solid white;
      border-top: 6px solid white;
      margin-right: -6px;
      margin-top: -6px;
    }

    .img-wrapper-outer-2 {
      border-left: 6px solid white;
      border-bottom: 6px solid white;
      margin-left: -6px;
      margin-bottom: -6px;
    }

    .img-wrapper-outer-3 {
      border-right: 6px solid white;
      border-bottom: 6px solid white;
      margin-right: -6px;
      margin-bottom: -6px;
    }

    .img-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid white;

      &-2 {
        background-color: ${colors.elements.Arc}
      }

      &-3 {
        background-color: ${colors.elements.Solar}
      }

      &-4 {
        background-color: ${colors.elements.Void}
      }
    }

    img {
      transform: rotate(45deg);
    }
  }
`

type Props = {
  className?: string
  tree: any
  affinity: any
  hideName?: boolean
  onClick?: MouseEventHandler
  selected?: boolean
}

function V2SuperTree(props: Props) {
  const { className, tree, affinity, hideName, onClick, selected } = props

  return (
    <Wrapper className={className}>
      {!hideName && <span>{tree.name}</span>}
      <div className={`tree-diamond ${onClick ? 'tree-diamond-clickable' : ""} ${selected ? "tree-diamond-selected" : ""}`}
        onClick={onClick ? () => onClick(tree) : undefined}>
        {tree.perks && tree.perks.map((p: any, idx: number) => (
          <div key={`tree-${tree.pos}-${idx}`} className={`img-wrapper-outer ${tree.pos === idx ? `img-wrapper-outer-${idx}` : ""}`}>
            <div className={`img-wrapper img-wrapper-${affinity}`}>
              <OverlayTrigger
                placement="bottom"
                delay={{ show: 250, hide: 400 }}
                overlay={<Tooltip>{ p.name }</Tooltip>}>
                <img src={p.icon.startsWith("http") ? p.icon : `https://www.bungie.net${p.icon}`} />
              </OverlayTrigger>
            </div>
          </div>
        ))}
      </div>
    </Wrapper>
  )
}

export default V2SuperTree;
