import { useContext, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet';
import BuildSummaryCard from '../components/BuildSummaryCard'
import { GlobalContext } from "../contexts/GlobalContext"
import Loading from "../components/Loading"
import copy from "copy-to-clipboard";
import AlertDetail from '../models/AlertDetail';
import MainLayout from '../layouts/MainLayout';
import Paginator from '../components/ui/Paginator';
import searchUtils from "../utils/searchUtils"
import BuildsSearchBar from '../components/BuildsSearchBar';

const COMP_STATE = {
  LOADING: 1,
  DONE: 2
}

const pageSize = 18
const maxPageIterationsToDisplay = 2

function Search() {
  const { isConfigLoaded, dispatchAlert } = useContext(GlobalContext)
  const [compState, setCompState] = useState(COMP_STATE.LOADING)
  const [searchInput, setSearchInput] = useState("")
  const [filters, setFilters] = useState([])
  const [hits, setHits] = useState([])
  const [displayedBuilds, setDisplayedBuilds] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if(isConfigLoaded) {
      const _availableFilters = searchUtils.buildAvailableFilters()
      setCompState(COMP_STATE.DONE)

      let flattenedFilters = {}
      // @ts-ignore
      Object.keys(_availableFilters).forEach(k => flattenedFilters = {...flattenedFilters, ..._availableFilters[k]})

      let queryString = window.location.search
      let _searchInput = ""
      let _filters: any[] = []
      if(queryString !== "") {
        queryString = queryString.replace("?", "")
        let spl1 = queryString.split("&")
        spl1.forEach(el => {
          let spl2 = el.split("=")
          if(spl2[0] === "searchInput") {
            _searchInput = decodeURIComponent(spl2[1])
          }
          if(spl2[0] === "filters") {
            let filterString = decodeURIComponent(spl2[1])
            let splitFilters = filterString.split(",")
            splitFilters.forEach(sf => {
              // @ts-ignore TODO: fix me
              if(flattenedFilters[sf]) {
                // @ts-ignore TODO: fix me
                _filters.push(flattenedFilters[sf])
              }
            })
          }
        })
        if(_searchInput !== "") {
          setSearchInput(_searchInput)
        }
        if(_filters.length > 0) {
          // @ts-ignore TODO: fix me
          setFilters(_filters)
        }
        if(_searchInput !== "" || _filters.length > 0) {
          go(_searchInput, _filters)
        }
      }
    }
  }, [isConfigLoaded])

  async function go(inSearchInput?: any, inFilters?: any) {
    let { AlgoliaService } = window.services
    if(!inSearchInput) {
      inSearchInput = searchInput
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

    if(Object.keys(queryMap).length > 0) {
      let queryStringArr: string[] = []
      Object.keys(queryMap).map(k => queryStringArr.push(`${k}=${queryMap[k]}`))
      let queryString = queryStringArr.join("&")
      window.history.replaceState(null, '', `${window.location.pathname}?${queryString}`)
    } else {
      window.history.replaceState(null, '', window.location.pathname)
    }

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
    } else {
      // TODO: Add no-builds state
      setHits([])
    }
  }

  // @ts-ignore TODO: fix me
  function renderResults(hits: any) {
    // Reset page stuff
    setPage(1)
    setTotalPages(1)

    setHits(hits)
    if(hits.length > pageSize) {
      let subset = hits.slice(0, pageSize)
      let totalPages = Math.ceil(hits.length / pageSize)
      setDisplayedBuilds(subset)
      setPage(1)
      setTotalPages(totalPages)
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
    setPage(pageNumber)
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

  // @ts-ignore TODO: fix me
  function onKeyPressHandler(e) {
    // @ts-ignore TODO: fix me
    if(e.key === "Enter") {
      // @ts-ignore TODO: fix me
      go()
    }
  }

  function copyUrl() {
    let queryMap: any = {}
    if(searchInput !== "") {
      queryMap["searchInput"] = encodeURIComponent(searchInput)
    }
    if(filters.length > 0) {
      // @ts-ignore TODO: fix me
      queryMap["filters"] = filters.map(el => el.id).join(",")
    }

    let link = `${window.location.origin}/find-builds/`
    if(Object.keys(queryMap).length > 0) {
      let queryStringArr: string[] = []
      Object.keys(queryMap).map(k => queryStringArr.push(`${k}=${queryMap[k]}`))
      let queryString = queryStringArr.join("&")
      link += `?${queryString}`
    }
    copy(link)
    let a = new AlertDetail("Link copied to clipboard.", "Link Copied")
    dispatchAlert(a)
  }

  return (
    <MainLayout>
      <div>
        <Helmet>
          <title>Find Builds - GuardianForge</title>
        </Helmet>
        <div className="col-md-12">
          <h1>Find Builds</h1>
          {compState === COMP_STATE.LOADING && (<Loading />)}
          {compState === COMP_STATE.DONE && (
            <BuildsSearchBar 
              value={searchInput}
              onChange={(e: any) => setSearchInput(e.target.value)}
              onFilterAdded={addFilter}
              onSearch={() => go(null, null)}
              onCopyUrl={copyUrl}
              onKeyPress={onKeyPressHandler} 
              filters={filters}
              onRemoveFilter={removeFilter}           
            />
          )}
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayedBuilds.map((el: any, idx) => (
            <BuildSummaryCard key={`search-${idx}`} buildSummary={el.summary} isPublicUi />
          ))}
        </div>

        {totalPages > 1 && (
          <Paginator 
            totalPages={totalPages}
            page={page}
            maxPageIterationsToDisplay={maxPageIterationsToDisplay}
            onPageNavigate={goToPage}
          />
        )}
      </div>

    </MainLayout>
  )
}

export default Search
