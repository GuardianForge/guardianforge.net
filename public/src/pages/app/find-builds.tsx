import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Helmet } from 'react-helmet';
import { Container, Dropdown, Pagination } from 'react-bootstrap';
import BuildSummaryCard from '../../components/app/BuildSummaryCard'
// @ts-ignore
import searchUtils from "../../utils/searchUtils"
import { GlobalContext } from "../../contexts/GlobalContext"
import Loading from "../../components/app/Loading"
import colors from "../../colors"
import { faEllipsisH, faLink } from '@fortawesome/free-solid-svg-icons';
import copy from "copy-to-clipboard";
import AlertDetail from '../../models/AlertDetail';

const Wrapper = styled(Container)`
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
    background-color: ${colors.theme2.dark3};
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
            background-color: ${colors.theme2.dark1} !important;
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
          background-color: ${colors.theme2.dark2};
        }

        .submit-button {
          color: #eee;
          background-color: ${colors.theme2.accent1} !important;
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
  const { isConfigLoaded, setPageTitle, dispatchAlert } = useContext(GlobalContext)
  const [compState, setCompState] = useState(COMP_STATE.LOADING)
  const [searchInput, setSearchInput] = useState("")
  const [availableFilters, setAvailableFilters] = useState({})
  const [filters, setFilters] = useState([])
  const [hits, setHits] = useState([])
  const [displayedBuilds, setDisplayedBuilds] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setPageTitle("Find Builds")
    if(isConfigLoaded) {
      const _availableFilters = searchUtils.buildAvailableFilters()
      setAvailableFilters(_availableFilters)
      setCompState(COMP_STATE.DONE)

      let flattenedFilters = {}
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
              if(flattenedFilters[sf]) {
                _filters.push(flattenedFilters[sf])
              }
            })
          }
        })
        if(_searchInput !== "") {
          setSearchInput(_searchInput)
        }
        if(_filters.length > 0) {
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
    inFilters.forEach(el => {
      if(filterMap[el.fieldName]) {
        filterMap[el.fieldName].values.push(el.value)
      } else {
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
      filterString += "("
      filterMap[key].values.forEach((value, idx) => {
        if(typeof(value) === "number") {
          filterString += `${key} = ${value}`
        }
        if(typeof(value) === "string") {
          filterString += `${key}:${value}`
        }
        if (idx < filterMap[key].values.length - 1) {
          filterString += " OR "
        }
      })
      filterString += ")"
    })
    return filterString
  }

  async function go(inSearchInput: any, inFilters: any) {
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

  function renderResults(hits) {
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

  function goToPage(pageNumber: number) {
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

  // TODO: Create a model around this
  function addFilter(filter: any) {
    if(!filters.find(el => el.id === filter.id)) {
      setFilters([...filters, filter])
    }
  }

  // TODO: Figure out what this data type is
  function removeFilter(id: any) {
    let _filters = [...filters]
    _filters = _filters.filter(el => el.id !== id)
    setFilters(_filters)
  }

  function onKeyPressHandler(e: any) {
    if(e.key === "Enter") {
      go()
    }
  }

  function copyUrl() {
    let queryMap: any = {}
    if(searchInput !== "") {
      queryMap["searchInput"] = encodeURIComponent(searchInput)
    }
    if(filters.length > 0) {
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
    <Wrapper>
      <Helmet>
        <title>Find Builds - GuardianForge</title>
      </Helmet>
      <div className="col-md-12">
        {compState === COMP_STATE.LOADING && (<Loading />)}
        {compState === COMP_STATE.DONE && (
          <div className="searchbox-wrapper">
            <div className="search-main">
              <div className="search-left">
                <FontAwesomeIcon icon="search" />
                <input placeholder="Search"
                  value={searchInput}
                  onKeyPress={onKeyPressHandler}
                  onChange={(e) => setSearchInput(e.target.value)} />
              </div>
              <div className="search-right">
                <Dropdown className="filters-select" align="end">
                  <Dropdown.Toggle className="filters-toggle">
                    <FontAwesomeIcon icon="plus" /> Filters
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="filters-menu">
                    {Object.keys(availableFilters).map((headerKey, idx) => (
                      <>
                        <Dropdown.Header key={`filter-header-${idx}`}>{headerKey}</Dropdown.Header>
                        {Object.keys(availableFilters[headerKey]).map(key => (
                          <Dropdown.Item
                            key={`filter-${idx}-${key}`}
                            className="filters-menu-item"
                            onClick={() => addFilter(availableFilters[headerKey][key])}>
                            <img src={availableFilters[headerKey][key].iconPath} /> { availableFilters[headerKey][key].displayValue }
                          </Dropdown.Item>
                        ))}
                      </>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                <button className="submit-button" onClick={() => go()}>Go</button>
                <button className="submit-button" style={{marginLeft: "5px"}} onClick={() => copyUrl()}><FontAwesomeIcon icon={faLink} /></button>
              </div>
              </div>
            {filters.length > 0 && (
              <div className="filters-gutter">
                {filters.map((f, idx)=> (
                  <span key={`filter-${idx}`}
                    className="filter"
                    style={{ backgroundColor: f.color ? f.color : "" }}>
                    {f.iconPath && <img src={f.iconPath} />}
                    {f.friendlyName}: {f.displayValue}
                    <FontAwesomeIcon icon="times"
                      style={{ cursor: "pointer" }}
                      onClick={() => removeFilter(f.id)} />
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="col-md-12 mt-3">
        <div className="row">
          {displayedBuilds.map((el: any, idx: number) => (
            <div key={`search-${idx}`} className="col-md-4">
              <BuildSummaryCard buildSummary={el.summary} />
            </div>
          ))}
        </div>
      </div>
      {totalPages > 1 && (
        <div id="buildsPaginator" className="row mt-3">
          <div style={{ display: "flex", justifyContent: "center"}}>
            <div className="btn-group">
              <button className="btn btn-secondary"
                disabled={page == 1}
                onClick={() => goToPage(page - 1)}>
                <FontAwesomeIcon icon="caret-left" />
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
                disabled={page == totalPages}
                onClick={() => goToPage(page + 1)}>
                <FontAwesomeIcon icon="caret-right" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  )
}

export default Search
