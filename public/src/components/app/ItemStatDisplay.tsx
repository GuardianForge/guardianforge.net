import React from 'react'
import ItemStatBar from './ItemStatBar'

export enum ItemStatDisplayModeEnum {
  Bar = 0,
  Ms = 1,
  None = 2
}

type ItemStatDisplayProps = {
  name?: string
  value?: number
  displayMode?: ItemStatDisplayModeEnum
}

function ItemStatDisplay(props: ItemStatDisplayProps) {
  const { name, value, displayMode } = props
  return (
    <>
      <div>{name}: </div>
      <div>{value}{displayMode == ItemStatDisplayModeEnum.Ms && "ms"}</div>
      {displayMode == ItemStatDisplayModeEnum.Bar && (
        <ItemStatBar value={value} />
      )}
      {displayMode == ItemStatDisplayModeEnum.Ms && <div />}
      {displayMode == ItemStatDisplayModeEnum.None && <div />}
    </>
  )
}

export default ItemStatDisplay