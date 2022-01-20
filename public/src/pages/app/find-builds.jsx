import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Helmet } from 'react-helmet';
import { Container, Dropdown } from 'react-bootstrap';
import BuildSummaryCard from './components/BuildSummaryCard'
// @ts-ignore
import searchUtils from "../../utils/searchUtils"
// @ts-ignore
import { GlobalContext } from "../../contexts/GlobalContext"
import Loading from "./components/Loading"
import colors from "../../colors"

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

function Search() {
  const { isConfigLoaded, setPageTitle } = useContext(GlobalContext)
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
    const _availableFilters = searchUtils.buildAvailableFilters()
    setAvailableFilters(_availableFilters)
    setCompState(COMP_STATE.DONE)
  }, [isConfigLoaded])

  function buildFilters() {
    let filterMap = {}
    filters.forEach(el => {
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

  async function go() {
    let { AlgoliaService } = window.services
    let filters = buildFilters()
    let results = await AlgoliaService.search(searchInput, filters)
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

  function addFilter(filter) {
    if(!filters.find(el => el.id === filter.id)) {
      setFilters([...filters, filter])
    }
  }

  function removeFilter(id) {
    let _filters = [...filters]
    _filters = _filters.filter(el => el.id !== id)
    setFilters(_filters)
  }

  function onKeyPressHandler(e) {
    if(e.key === "Enter") {
      go()
    }
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
          {displayedBuilds.map((el, idx) => (
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
              {Array.from(Array(totalPages), (el, idx) => {
                return (
                  <button
                    className={`btn btn-secondary ${page === idx + 1 ? 'active-page': ''}`}
                    key={`page-${idx + 1}`}
                    onClick={() => goToPage(idx + 1)}>
                    { idx + 1 }
                  </button>
                )
              })}
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
