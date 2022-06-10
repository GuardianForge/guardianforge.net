import React, { useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import {DebounceInput} from 'react-debounce-input';
import PlayerSearchResultCard from '../components/PlayerSearchResultCard'
import Loading from '../components/Loading'
import { Helmet } from 'react-helmet';
import User from '../models/User';
import { BungieOfflineAlert } from '../models/AlertDetail';
import { GlobalContext } from '../contexts/GlobalContext';
import MainLayout from '../layouts/MainLayout';

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 20px;
	.user-search-input {
		border: 1px solid #333;
		border-radius: 5px;
		padding: 10px;
		margin-bottom: 10px;
		&:focus {
			border: 1px solid #aaa;
		}
	}
	.search-wrapper {
		width: 350px;
		input {
			width: 100%;
		}
	}
	.search-results-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 350px;
	}
	.search-message {
		color: #777;
		font-style: italic;
	}
	.search-loading {
		font-size: 2.5rem;
	}
	.search-results {
		width: 100%;
	}
`
const COMP_STATE = {
  NONE: 0,
  LOADING: 1,
  NO_RESULTS: 2,
  HAS_RESULTS: 3
}

function FindPlayers() {
  const { dispatchAlert } = useContext(GlobalContext)
  const [queryText, setQueryText] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [compState, setCompState] = useState(COMP_STATE.NONE)

  useEffect(() => {
    async function go() {
      if(queryText && queryText !== "") {
        setCompState(COMP_STATE.LOADING)
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

        setSearchResults(results)
        if(results.length > 0) {
          setCompState(COMP_STATE.HAS_RESULTS)
        } else {
          setCompState(COMP_STATE.NO_RESULTS)
        }
      }
      if(queryText === "") {
        setCompState(COMP_STATE.NONE)
        setSearchResults([])
      }
    }
    go()
  }, [queryText])

  return (
    <MainLayout>
      <Wrapper>
        <Helmet>
          <title>Find Players - GuardianForge</title>
        </Helmet>
        <div className="search-wrapper">
          <DebounceInput
            placeholder="Search by username"
            className="user-search-input"
            debounceTimeout={500}
            onChange={(e) => setQueryText(e.target.value)} />
        </div>
        <div className="search-results-container">
          {compState === COMP_STATE.NONE && (
            <div className="search-message">
              Start typing to search for users.
            </div>
          )}

          {compState === COMP_STATE.NO_RESULTS && (
            <div className="search-message">
              No users match the name '{queryText}'
            </div>
          )}

          {compState === COMP_STATE.LOADING && (
            <Loading />
          )}

          {compState === COMP_STATE.HAS_RESULTS && (
            <div className="search-results">
              {searchResults.map((user, idx) => <PlayerSearchResultCard key={`search-${idx}`} user={user} isPublicUi />)}
            </div>
          )}
        </div>
      </Wrapper>
    </MainLayout>
  )
}

export default FindPlayers
