import { faSearch } from '@fortawesome/free-solid-svg-icons'
import React, { useContext, useEffect, useState } from 'react'
import { GlobalContext } from '../contexts/GlobalContext'
import { BungieOfflineAlert } from '../models/AlertDetail'
import User from '../models/User'
import Input from './forms/Input'
import Loading from './Loading'
import ForgeModal from './Modal'
import PlayerSearchResultCard from './PlayerSearchResultCard'
import TabGroup from './ui/TabGroup'
import TabItem from './ui/TabItem'
import searchUtils from "../utils/searchUtils"
import BuildSummaryCard from './BuildSummaryCard'
import Paginator from './ui/Paginator'
import ForgeButton from './forms/Button'

const COMP_STATE = {
  NONE: 0,
  LOADING: 1
}

const SEARCH_STATE = {
  NONE: 1,
  SEARCHING: 2,
  HAS_RESULTS: 3,
  NO_RESULTS: 4
}

const pageSize = 18
const maxPageIterationsToDisplay = 2

type Props = {
  show: boolean
  onHide: Function
}

function SearchModal({ show, onHide }: Props) {
  const { isConfigLoaded, dispatchAlert } = useContext(GlobalContext)
  const [compState, setCompState] = useState(COMP_STATE.NONE)
  const [tab, setTab] = useState(1)
  const [queryText, setQueryText] = useState("")

  // User state
  const [userSearchResults, setUserSearchResults] = useState([])
  const [searchUsersState, setUsersSearchState] = useState(SEARCH_STATE.NONE)

  // Build state
  const [filters, setFilters] = useState([])
  const [hits, setHits] = useState([])
  const [displayedBuilds, setDisplayedBuilds] = useState([])
  const [buildsPage, setBuildsPage] = useState(1)
  const [totalBuildsPages, setTotalBuildsPages] = useState(1)
  const [searchBuildsState, setSearchBuildsState] = useState(SEARCH_STATE.NONE)

  useEffect(() => {
    if(!isConfigLoaded) return
    async function searchUsers() {
      if(queryText && queryText !== "") {
        setUsersSearchState(SEARCH_STATE.SEARCHING)
        let results;
        try {
          results = await window.services.BungieApiService.searchBungieNetUsers(queryText)
        } catch (err) {
          dispatchAlert(BungieOfflineAlert)
          return
        }

        if(queryText.includes("#")) {
          let split = queryText.split("#")
          results = results.filter((r: User) => {
            let userCode = String(r.bungieGlobalDisplayNameCode)
            return userCode.startsWith(split[1])
          })
        }

        setUserSearchResults(results)
        if(results.length > 0) {
          setUsersSearchState(SEARCH_STATE.HAS_RESULTS)
        } else {
          setUsersSearchState(SEARCH_STATE.NO_RESULTS)
        }
      }
      if(queryText === "") {
        setUsersSearchState(SEARCH_STATE.NONE)
        setUserSearchResults([])
      }
    }

    async function searchBuilds(inSearchInput?: any, inFilters?: any) {
      if(queryText && queryText !== "") {
        setSearchBuildsState(SEARCH_STATE.SEARCHING)
        let { AlgoliaService } = window.services
        if(!inSearchInput) {
          inSearchInput = queryText
        }
        if(!inFilters) {
          inFilters = filters
        }
        let filterString = searchUtils.buildAlgoliaFilters(inFilters)
    
        let results = await AlgoliaService.search(inSearchInput, filterString)
    
        let queryMap: any = {}
        if(inSearchInput !== "") {
          queryMap["searchInput"] = encodeURIComponent(inSearchInput)
        }
        if(inFilters.length > 0) {
          // @ts-ignore TODO: fix me
          queryMap["filters"] = inFilters.map(el => el.id).join(",")
        }
    
        // TODO: urlencode the # in usernames, store that instead but handle just in case
        // if(Object.keys(queryMap).length > 0) {
        //   let queryStringArr: string[] = []
        //   Object.keys(queryMap).map(k => queryStringArr.push(`${k}=${queryMap[k]}`))
        //   let queryString = queryStringArr.join("&")
        //   window.history.replaceState(null, '', `${window.location.pathname}?${queryString}`)
        // } else {
        //   window.history.replaceState(null, '', window.location.pathname)
        // }
    
        if(results && results.hits !== undefined) {
          let hits = results.hits
          // @ts-ignore TODO: fix me
          hits.sort((a,b) => {
            let aUpv = a.summary.upvotes ? a.summary.upvotes : 0
            let bUpv = b.summary.upvotes ? b.summary.upvotes : 0
            if (aUpv > bUpv) return -1
            if (bUpv > aUpv) return 1
            return 0
          })
          renderResults(hits)
          setSearchBuildsState(SEARCH_STATE.HAS_RESULTS)
        } else {
          setHits([])
          setSearchBuildsState(SEARCH_STATE.NO_RESULTS)
        }
      }
    }
    searchUsers()
    searchBuilds()
  }, [isConfigLoaded, queryText])

  useEffect(() => {
    if(isConfigLoaded) {
      const _availableFilters = searchUtils.buildAvailableFilters()
      setCompState(COMP_STATE.NONE)

      let flattenedFilters = {}
      // @ts-ignore
      Object.keys(_availableFilters).forEach(k => flattenedFilters = {...flattenedFilters, ..._availableFilters[k]})

      // TODO: This is for search deep-links, re-implement this
      // let queryString = window.location.search
      // let _searchInput = ""
      // let _filters: any[] = []
      // if(queryString !== "") {
      //   queryString = queryString.replace("?", "")
      //   let spl1 = queryString.split("&")
      //   spl1.forEach(el => {
      //     let spl2 = el.split("=")
      //     if(spl2[0] === "searchInput") {
      //       _searchInput = decodeURIComponent(spl2[1])
      //     }
      //     if(spl2[0] === "filters") {
      //       let filterString = decodeURIComponent(spl2[1])
      //       let splitFilters = filterString.split(",")
      //       splitFilters.forEach(sf => {
      //         // @ts-ignore TODO: fix me
      //         if(flattenedFilters[sf]) {
      //           // @ts-ignore TODO: fix me
      //           _filters.push(flattenedFilters[sf])
      //         }
      //       })
      //     }
      //   })
      //   if(_searchInput !== "") {
      //     setSearchInput(_searchInput)
      //   }
      //   if(_filters.length > 0) {
      //     // @ts-ignore TODO: fix me
      //     setFilters(_filters)
      //   }
      //   if(_searchInput !== "" || _filters.length > 0) {
      //     go(_searchInput, _filters)
      //   }
      // }
    }
  }, [isConfigLoaded])

  function onInputChange(e: any) {
    setQueryText(e.target.value)
  }

  // @ts-ignore TODO: fix me
  function renderResults(hits: any) {
    // Reset page stuff
    setBuildsPage(1)
    setTotalBuildsPages(1)

    setHits(hits)
    if(hits.length > pageSize) {
      let subset = hits.slice(0, pageSize)
      let totalPages = Math.ceil(hits.length / pageSize)
      setDisplayedBuilds(subset)
      setBuildsPage(1)
      setTotalBuildsPages(totalPages)
    } else {
      setDisplayedBuilds(hits)
    }
  }

  // @ts-ignore TODO: fix me
  function goToPage(pageNumber) {
    let start = pageSize * (pageNumber - 1)
    let end = start + pageSize
    let _displayedBuilds = hits.slice(start, end)
    setDisplayedBuilds(_displayedBuilds)
    setBuildsPage(pageNumber)
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // @ts-ignore TODO: fix me
  function addFilter(filter) {
    // @ts-ignore TODO: fix me
    if(!filters.find(el => el.id === filter.id)) {
      // @ts-ignore TODO: fix me
      setFilters([...filters, filter])
    }
  }

  // @ts-ignore TODO: fix me
  function removeFilter(id) {
    let _filters = [...filters]
    // @ts-ignore TODO: fix me
    _filters = _filters.filter(el => el.id !== id)
    setFilters(_filters)
  }

  return (
    <ForgeModal
      title='Search'
      show={show}
      size={"lg"}
      scrollable
      closeButton
      onHide={onHide}
      footer={
        <div className="flex gap-1">
          <ForgeButton onClick={() => onHide()}>Close</ForgeButton>
        </div>
      }>
      <div className="h-[80vh]">
        <Input
          placeholder="Start typing to search..."
          debounceTimeout={500}
          value={queryText}
          onChange={onInputChange}
          className="mb-2"
          prefixIcon={faSearch} />

        {compState === COMP_STATE.LOADING && <Loading />}
        {compState === COMP_STATE.NONE && (

        <div className="search-results-container">
          <TabGroup>
            <TabItem active={tab === 1} onClick={() => setTab(1)}>
              Players
              {userSearchResults && userSearchResults.length > 0 && (
                <div className="h-[20x] min-w-[20px]  flex justify-center items-center rounded-full text-xs bg-neutral-700 px-1">{userSearchResults.length}</div>
              )}
            </TabItem>
            <TabItem active={tab === 2} onClick={() => setTab(2)}>
              Builds
              {hits && hits.length > 0 && (
                <div className="h-[20x] min-w-[20px] flex justify-center items-center rounded-full text-xs bg-neutral-700 px-1">{hits.length}</div>
              )}
            </TabItem>
          </TabGroup>

          {tab === 1 && (
            <div>
              {searchUsersState === SEARCH_STATE.NONE && (
                <div className="text-neutral-400 italic">
                  Start typing to search for users.
                </div>
              )}

              {searchUsersState === SEARCH_STATE.NO_RESULTS && (
                <div className="search-message">
                  No users match the name '{queryText}'
                </div>
              )}

              {searchUsersState === SEARCH_STATE.SEARCHING && (
                <Loading />
              )}

              {searchUsersState === SEARCH_STATE.HAS_RESULTS && (
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {userSearchResults.map((user, idx) => 
                    <PlayerSearchResultCard onCardClicked={onHide} key={`search-${idx}`} user={user} />)
                  }
                </div>
              )}
            </div>
          )}

          {tab === 2 && (
            <div>
              {searchBuildsState === SEARCH_STATE.SEARCHING && <Loading />}
              {searchBuildsState === SEARCH_STATE.NO_RESULTS && <div className='italic'>No results found.</div>}
              {searchBuildsState === SEARCH_STATE.NONE && (
                <div className="text-neutral-400 italic">
                  Start typing to search for builds.
                </div>
              )}
              {searchBuildsState === SEARCH_STATE.HAS_RESULTS && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2 lg:grid-cols-3">
                  {totalBuildsPages > 1 && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <Paginator
                        totalPages={totalBuildsPages}
                        page={buildsPage}
                        maxPageIterationsToDisplay={maxPageIterationsToDisplay}
                        onPageNavigate={goToPage}
                      />
                    </div>
                  )}
                  {displayedBuilds.map((el: any, idx) => (
                    <BuildSummaryCard onCardClicked={onHide} key={`search-${idx}`} buildSummary={el.summary} />
                  ))}
                </div>
              )}
            </div>
          )}
          </div>
        )}
      </div>
  </ForgeModal>
  )
}

export default SearchModal