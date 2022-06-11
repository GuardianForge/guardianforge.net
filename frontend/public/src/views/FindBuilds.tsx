import { useContext, useEffect, useState } from 'react'
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Helmet } from 'react-helmet';
import { Dropdown } from 'react-bootstrap';
import BuildSummaryCard from '../components/BuildSummaryCard'
import searchUtils from "../utils/searchUtils"
import { GlobalContext } from "../contexts/GlobalContext"
import Loading from "../components/Loading"
import { faCaretLeft, faCaretRight, faEllipsisH, faLink, faPlus, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import copy from "copy-to-clipboard";
import AlertDetail from '../models/AlertDetail';
import MainLayout from '../layouts/MainLayout';

const Wrapper = styled.div`
  @media screen and (max-width: 500px) {
    .search-main {
      flex-direction: column;

      .search-right {
        margin-top: 10px;
        justify-content: space-between;
      }
    }
  }

  #buildsPaginator {
    .active-page {
      background-color: #0792FB !important;
    }
  }

  .searchbox-wrapper {
    color: #eee;
    background-color: #333;
    border-radius: 5px;
    box-shadow: 5px 5px rgba(0,0,0,0.1);
    padding: 10px;

    .search-main {
      display: flex;
      justify-content: space-between;

      input {
        color: #eee;
        background-color: inherit !important;
        border: 0;

        &:focus {
          outline: none;
        }
      }

      .search-left {
        display: flex;
        align-items: center;
        flex: 1;

        svg {
          color: #777;
          margin: 0px 3px;
        }

        input {
          flex: 1
        }
      }

      .search-right {
        display: flex;

        .filters-select {
          img {
            max-width: 15px;
          }

          .filters-menu {
            background-color: #222 !important;
            max-height: 65vh;
            overflow-y: scroll;
          }

          .filters-menu-item {
            color: #eee;

            &:hover {
              background-color: #444;
            }
          }
        }

        .filters-toggle {
          color: #eee;
          margin-right: 20px;
          border: 0;
          border-radius: 5px;
          background-color: #555
        }

        .submit-button {
          color: #eee;
          background-color: #006eff !important;
          border: 0;
          border-radius: 5px;
          width: 50px;
        }
      }
    }

    .filters-gutter {
      display: flex;
      flex-flow: row wrap;

      .filter {
        color: #eee;
        margin-right: 20px;
        border: 0;
        border-radius: 5px;
        background-color: #555;
        display: flex;
        align-items: center;
        margin-right: 5px;
        width: fit-content;
        margin-top: 5px;

        img {
          max-width: 12px;
          margin: 0px 5px;
        }

        svg {
          margin: 0px 5px;
        }
      }
    }
  }
`

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
  const [availableFilters, setAvailableFilters] = useState({})
  const [filters, setFilters] = useState([])
  const [hits, setHits] = useState([])
  const [displayedBuilds, setDisplayedBuilds] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if(isConfigLoaded) {
      const _availableFilters = searchUtils.buildAvailableFilters()
      setAvailableFilters(_availableFilters)
      setCompState(COMP_STATE.DONE)

      let flattenedFilters = {}
      // @ts-ignore TODO: fix me
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

  function buildFilters(inFilters?: any) {
    if(!inFilters) {
      inFilters = filters
    }
    let filterMap = {}
    // @ts-ignore TODO: fix me
    inFilters.forEach(el => {
      // @ts-ignore TODO: fix me
      if(filterMap[el.fieldName]) {
        // @ts-ignore TODO: fix me
        filterMap[el.fieldName].values.push(el.value)
      } else {
        // @ts-ignore TODO: fix me
        filterMap[el.fieldName] = {
          values: [
            el.value
          ]
        }
      }
    })

    let filterString = ""
    Object.keys(filterMap).forEach(key => {
      if (filterString !== "") {
        filterString += " AND "
      }
      // @ts-ignore TODO: fix me
      filterString += "("
      // @ts-ignore TODO: fix me
      filterMap[key].values.forEach((value, idx) => {
        if(typeof(value) === "number") {
          filterString += `${key} = ${value}`
        }
        if(typeof(value) === "string") {
          filterString += `${key}:${value}`
        }
        // @ts-ignore TODO: fix me
        if (idx < filterMap[key].values.length - 1) {
          filterString += " OR "
        }
      })
      filterString += ")"
    })
    return filterString
  }

  async function go(inSearchInput?: any, inFilters?: any) {
    let { AlgoliaService } = window.services
    if(!inSearchInput) {
      inSearchInput = searchInput
    }
    if(!inFilters) {
      inFilters = filters
    }
    let filterString = buildFilters(inFilters)
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
      <Wrapper>
        <Helmet>
          <title>Find Builds - GuardianForge</title>
        </Helmet>
        <div className="col-md-12">
          <h1>Find Builds</h1>
          {compState === COMP_STATE.LOADING && (<Loading />)}
          {compState === COMP_STATE.DONE && (
            <div className="searchbox-wrapper">
              <div className="search-main">
                <div className="search-left">
                  <FontAwesomeIcon icon={faSearch} />
                  <input placeholder="Search"
                    value={searchInput}
                    onKeyPress={onKeyPressHandler}
                    onChange={(e) => setSearchInput(e.target.value)} />
                </div>
                <div className="search-right">
                  <Dropdown className="filters-select" align="end">
                    <Dropdown.Toggle className="filters-toggle">
                      <FontAwesomeIcon icon={faPlus} /> Filters
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="filters-menu">
                      {Object.keys(availableFilters).map((headerKey, idx) => (
                        <>
                          <Dropdown.Header key={`filter-header-${idx}`}>{headerKey}</Dropdown.Header>
                          {/* @ts-ignore TODO: fix me */}
                          {Object.keys(availableFilters[headerKey]).map(key => (
                            <>
                              {/* @ts-ignore TODO: fix me */}
                              <Dropdown.Item key={`filter-${idx}-${key}`} className="filters-menu-item" onClick={() => addFilter(availableFilters[headerKey][key])}>
                                {/* @ts-ignore TODO: fix me */}
                                <img src={availableFilters[headerKey][key].iconPath} alt="Filter Icon" /> { availableFilters[headerKey][key].displayValue }
                              </Dropdown.Item>
                              </>
                          ))}
                        </>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                  <button className="submit-button" onClick={() => go(null, null)}>Go</button>
                  <button className="submit-button" style={{marginLeft: "5px"}} onClick={() => copyUrl()}><FontAwesomeIcon icon={faLink} /></button>
                </div>
                </div>
              {filters.length > 0 && (
                <div className="filters-gutter">
                  {filters.map((f, idx)=> (
                    <>
                      {/* @ts-ignore TODO: fix me */}
                      <span key={`filter-${idx}`} className="filter" style={{ backgroundColor: f.color ? f.color : "" }}>
                        {/* @ts-ignore TODO: fix me */}
                        {f.iconPath && <img src={f.iconPath} alt="Filter icon" />}
                        {/* @ts-ignore TODO: fix me */}
                        {f.friendlyName}: {f.displayValue}
                        {/* @ts-ignore TODO: fix me */}
                        <FontAwesomeIcon icon={faTimes} style={{ cursor: "pointer" }} onClick={() => removeFilter(f.id)} />
                      </span>
                    </>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="col-md-12 mt-3">
          <div className="row">
            {displayedBuilds.map((el, idx) => (
              <div key={`search-${idx}`} className="col-md-4">
                {/* @ts-ignore TODO: fix me */}
                <BuildSummaryCard buildSummary={el.summary} isPublicUi />
              </div>
            ))}
          </div>
        </div>
        {totalPages > 1 && (
          <div id="buildsPaginator" className="row mt-3">
            <div style={{ display: "flex", justifyContent: "center"}}>
              <div className="btn-group">
                <button className="btn btn-secondary"
                  disabled={page === 1}
                  onClick={() => goToPage(page - 1)}>
                  <FontAwesomeIcon icon={faCaretLeft} />
                </button>
                {(page - maxPageIterationsToDisplay) > 1 && <button className="btn btn-secondary" disabled><FontAwesomeIcon icon={faEllipsisH} /></button>}
                {Array.from(Array(totalPages), (el, idx) => {
                  let paginatorBeingRendered = idx + 1
                  let low = page - maxPageIterationsToDisplay
                  let high = page + maxPageIterationsToDisplay
                  while(low < 1) {
                    low++
                    high++
                  }
                  while(high > totalPages) {
                    low--
                    high--
                  }
                  console.log(low, high)
                  if(low <= paginatorBeingRendered && paginatorBeingRendered <= high) {
                    return (
                      <button
                        className={`btn btn-secondary ${page === idx + 1 ? 'active-page': ''}`}
                        key={`page-${idx + 1}`}
                        onClick={() => goToPage(idx + 1)}>
                        { idx + 1 }
                      </button>
                    )
                  }
                  return <></>
                })}
                {(page + maxPageIterationsToDisplay) < totalPages && <button className="btn btn-secondary" disabled><FontAwesomeIcon icon={faEllipsisH} /></button>}
                <button className="btn btn-secondary"
                  disabled={page === totalPages}
                  onClick={() => goToPage(page + 1)}>
                  <FontAwesomeIcon icon={faCaretRight} />
                </button>
              </div>
            </div>
          </div>
        )}
      </Wrapper>

    </MainLayout>
  )
}

export default Search
