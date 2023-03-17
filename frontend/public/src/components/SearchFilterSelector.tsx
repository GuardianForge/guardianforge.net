import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import searchUtils from "../utils/searchUtils"
import ForgeButton from './forms/Button'

type Props = {
  onFilterAdded: Function
}

function SearchFilterSelector({ onFilterAdded }: Props) {
  const [availableFilters, setAvailableFilters] = useState<any>({})
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    const _availableFilters = searchUtils.buildAvailableFilters()
    document.addEventListener("click", clickHandler)
    setAvailableFilters(_availableFilters)
  }, [])

  // handle clicks outside the element to close the dropdown
  function clickHandler(e: any) {
    let dropdownEl = document.getElementById("search_filters")
    if(!dropdownEl?.contains(e.target)) {
      setIsDropdownOpen(false)
    }
  }

  return (
    <div className="relative" id="search_filters">
      <ForgeButton className="mr-2" onClick={() => setIsDropdownOpen(true)}>
        <FontAwesomeIcon icon={faPlus} /> Filters
      </ForgeButton>

      {isDropdownOpen && (
        <div className="absolute z-[100] bg-slate-800 right-2 roudned-lg shadow min-w-[250px] max-h-[600px] overflow-scroll mt-1 pt-3 overscroll-none">
          {Object.keys(availableFilters).map((headerKey, idx) => (
            <div className="mb-4">
              <div className="uppercase text-sm my-1 px-4">{ headerKey }</div>
              {Object.keys(availableFilters[headerKey]).map(key => (
                <div key={`filter-${idx}-${key}`} className="flex mb-1 hover:cursor-pointer hover:bg-slate-600 px-4 py-1" onClick={() => onFilterAdded(availableFilters[headerKey][key])} >
                  <img src={availableFilters[headerKey][key].iconPath} alt="Filter Icon" className="max-w-[24px] max-h-[24px] mr-2" /> { availableFilters[headerKey][key].displayValue }
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchFilterSelector