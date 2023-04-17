import { faLink, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import ForgeButton from './forms/Button'
import SearchFilterSelector from './SearchFilterSelector'

type Props = {
  value: string
  onKeyPress: React.KeyboardEventHandler<HTMLInputElement> | undefined
  onFilterAdded: Function
  filters: any[]
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined
  onSearch: Function
  onCopyUrl: Function
  onRemoveFilter: Function,
  className?: string
}

function BuildsSearchBar({ value, onKeyPress, onFilterAdded, filters, onChange, onSearch, onCopyUrl, onRemoveFilter, className }: Props) {
  return (
    <div className={`text-white bg-neutral-800 shadow pl-4 pr-2 py-2 ${className}`}>
      <div className="flex justify-between">
        <div className="flex flex-1 items-center">
          <FontAwesomeIcon icon={faSearch} className="text-gray-600 mr-2" />
          <input placeholder="Search"
            className="text-white bg-inherit border-none focus:outline-none flex flex-1"
            value={value}
            onKeyPress={onKeyPress}
            onChange={onChange} />
        </div>

        <div className="flex gap-2">
          <SearchFilterSelector onFilterAdded={onFilterAdded} />
          <ForgeButton onClick={() => onSearch()}>Go</ForgeButton>
          <ForgeButton onClick={() => onCopyUrl()}><FontAwesomeIcon icon={faLink} /></ForgeButton>
        </div>
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap">
          {filters.map((f, idx)=> (
            <span key={`filter-${idx}`} className="mr-1 rounded bg-gray-500 flex border-none items-center w-fit px-2 gap-2" style={{ backgroundColor: f.color ? f.color : "" }}>
              {f.iconPath && <img src={f.iconPath} alt="Filter icon" className="max-w-[12px]" />}
              {f.friendlyName}: {f.displayValue}
              <FontAwesomeIcon icon={faTimes} style={{ cursor: "pointer" }} onClick={() => onRemoveFilter(f.id)} />
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default BuildsSearchBar