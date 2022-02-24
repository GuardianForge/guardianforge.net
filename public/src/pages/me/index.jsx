import React, { useContext, useEffect, useState } from 'react'
import { Form, Button, InputGroup, Col } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GlobalContext } from '../../contexts/GlobalContext'
import { navigate } from 'gatsby'

function Profile() {
  const { isUserDataLoaded, dispatchAlert, redirectToLogin } = useContext(GlobalContext)
  const [about, setAbout] = useState("")
  const [twitter, setTwitter] = useState("")
  const [twitch, setTwitch] = useState("")
  const [youtube, setYoutube] = useState("")
  const [facebook, setFacebook] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if(!isUserDataLoaded) return
    function init() {
      const { ForgeClient } = window.services

      if(ForgeClient.isLoggedIn()) {
        navigate("/app/edit-profile")
      } else {
        redirectToLogin()
      }

      if(ForgeClient.userInfo) {
        const { userInfo } = ForgeClient
        if(userInfo.about) {
          setAbout(userInfo.about)
        }
        if(userInfo.social) {
          const { facebook, twitter, youtube, twitch} = userInfo.social
          if(facebook) setFacebook(facebook)
          if(twitter) setTwitter(twitter)
          if(youtube) setYoutube(youtube)
          if(twitch) setTwitch(twitch)
        }
      }
    }
    init()
  }, [isUserDataLoaded])

  async function saveProfile() {
    try {
      setIsLoading(true)
      let updates = {
        about,
        social: {
          facebook,
          twitter,
          youtube,
          twitch
        }
      }

      let { ForgeClient, ForgeApiService } = window.services
      let token = ForgeClient.getToken()
      await ForgeApiService.updateMe(token, updates)
      dispatchAlert({
        title: "Updating Profile",
        body: "Profile updated successfully!"
      })
    } catch (err) {
      console.log(err)
      let message = "An error occurred while updating your profile. Please try again later..."
      try {
        if(err.includes("CONTENT_INAPPROPRIATE")) {
          message = "User profile inappropriate."
        }
      } catch {
        // IDK...
      }
      dispatchAlert({
        title: "Updating Profile",
        body: message,
        isError: true,
        autohide: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1>User Profile</h1>
      <div>
        <Form.Group className="mb-3" >
          <Form.Label>About Me</Form.Label>
          <Form.Control onChange={e => setAbout(e.target.value)} value={about} type="text" placeholder="Add a bit about yourself" />
        </Form.Group>
        {/* TODO: Add primary platform input */}
        <hr />
        <Form.Label>Social Media Links</Form.Label>
        <div className="row">
          <div className="col-md-6">
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FontAwesomeIcon icon={['fab', 'twitter']} />
              </InputGroup.Text>
              <Form.Control onChange={e => setTwitter(e.target.value)} value={twitter} placeholder="ex: https://twitter.com/destinythegame" aria-label="Twitter" />
            </InputGroup>
          </div>
          <div className="col-md-6">
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FontAwesomeIcon icon={['fab', 'twitch']} />
              </InputGroup.Text>
              <Form.Control onChange={e => setTwitch(e.target.value)} value={twitch} type="text" placeholder="ex: https://twitch.tv/username" />
            </InputGroup>
          </div>
          <div className="col-md-6">
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FontAwesomeIcon icon={['fab', 'youtube']} />
              </InputGroup.Text>
              <Form.Control onChange={e => setYoutube(e.target.value)} value={youtube} type="text" placeholder="ex: https://www.youtube.com/mychannelname" />
            </InputGroup>
          </div>
          <div className="col-md-6">
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FontAwesomeIcon icon={['fab', 'facebook']} />
              </InputGroup.Text>
              <Form.Control onChange={e => setFacebook(e.target.value)} value={facebook} type="text" placeholder="ex: https://www.facebook.com/mypagename" />
            </InputGroup>
          </div>
        </div>
        <hr className="mb-3"/>
        <Button onClick={() => saveProfile()} disabled={isLoading}>
          Save
        </Button>
      </div>
    </div>
  )
}

export default Profile
