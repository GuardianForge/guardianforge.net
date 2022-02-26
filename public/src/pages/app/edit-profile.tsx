import React, { useContext, useEffect, useState } from 'react'
import { Form, Button, InputGroup, Col, Container, Row } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GlobalContext } from "../../contexts/GlobalContext"
import ForgeButton from '../../components/app/forms/Button'
import SubscribeButton from '../../components/app/stripe/SubscribeButton'
import FeatureToggleWrapper from '../../components/app/general/FeatureToggle'
import { Toggles } from '../../toggles'
import Card from '../../components/app/ui/Card'
import ForgeModal from '../../components/app/Modal'
import AlertDetail from '../../models/AlertDetail'
import { SubscriptionDetails } from '../../models/User'

function Profile() {
  const { isUserDataLoaded, dispatchAlert, setPageTitle } = useContext(GlobalContext)
  const [about, setAbout] = useState("")
  const [twitter, setTwitter] = useState("")
  const [twitch, setTwitch] = useState("")
  const [youtube, setYoutube] = useState("")
  const [facebook, setFacebook] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [isAutoRenewUpdating, setIsAutoRenewUpdating] = useState(false)
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails>()
  const [showCancelSubscriptionModal, setShowCancelSubscriptionModal] = useState(false)

  useEffect(() => {
    setPageTitle("Edit Profile")
    if(!isUserDataLoaded) return
    function init() {
      const { ForgeClient } = window.services
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
        if(userInfo.subscriptionDetails) {
          setSubscriptionDetails(userInfo.subscriptionDetails)
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
    } catch (err: any) {
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

  async function reenableSubscription() {
    // TODO: Update the model to refelct it in the UI
    let { ForgeClient } = window.services
    try {
      setIsAutoRenewUpdating(true)
      await ForgeClient.enableSubscription()
    } catch (err) {
      console.error(err)
      let alert = new AlertDetail("An error has occurred while attempting to re-enable your subscription. Please try again later, or send us a note.", "Re-Enable Subscription", true, false)
      dispatchAlert(alert)
    } finally {
      setIsAutoRenewUpdating(false)
    }
  }

  async function cancelSubscription() {
    // TODO: Update the model to refelect it in the UI
    let { ForgeClient } = window.services
    try {
      setIsAutoRenewUpdating(true)
      await ForgeClient.cancelSubscription()
      let alert = new AlertDetail("Auto renew has been disabled.", "Cancel Subscription")
      dispatchAlert(alert)
    } catch (err) {
      console.error(err)
      let alert = new AlertDetail("An error has occurred while attempting to stop your subscription. Please try again later, or send us a note.", "Cancel Subscription", true, false)
      dispatchAlert(alert)
    } finally {
      setShowCancelSubscriptionModal(false)
      setIsAutoRenewUpdating(false)
    }
  }

  return (
    <Container>
      <Row>
        <Form.Group className="mb-3">
          <Form.Label>About Me</Form.Label>
          <Form.Control onChange={e => setAbout(e.target.value)} value={about} type="text" placeholder="Add a bit about yourself" />
        </Form.Group>
        <hr />

        <FeatureToggleWrapper toggle={Toggles.SubscribeOptions}>
          <Row>
            <Col>
              {subscriptionDetails ? (
                <Card className="subscription-manager">
                  <h3>💎 Thanks, Oh Supporter Mine!</h3>
                  <p>Thank you for being a premium GuardianForge user! Your support means the world to me.</p>
                  {subscriptionDetails.endDate &&
                    <p>Subscription Expires: {new Date(subscriptionDetails.endDate * 1000).toLocaleDateString()}</p>
                  }
                  <p>Auto Renew: {subscriptionDetails.autoRenew ? "Enabled" : "Disabled"}</p>
                  {subscriptionDetails.autoRenew ? (
                    <Button onClick={() => setShowCancelSubscriptionModal(true)} disabled={isAutoRenewUpdating}>Disable Auto Renew</Button>
                  ) : (
                    <Button onClick={() => reenableSubscription()} disabled={isAutoRenewUpdating}>Enable Auto Renew</Button>
                  )}
                </Card>
              ) : (
                <Card>
                  <h3>💎 Eyes Up Guardian!</h3>
                  <p>Consider becoming a premium GuardianForge user to support the development of the platform!</p>
                  <SubscribeButton />
                </Card>
              )}
            </Col>
          </Row>
        </FeatureToggleWrapper>

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
      </Row>

      <ForgeModal show={showCancelSubscriptionModal} onHide={() => setShowCancelSubscriptionModal(false)} title="Cancel Subscription" closeButton>
        <h3>Sad To See You Go!</h3>
        <p>If there is something GuardianForge doesn't do for you, please consider sending me a message instead! Otherwise click the button below to cancel.</p>
        <Button style={{marginRight: "10px"}}>Send a Message</Button>
        <Button variant="danger" onClick={() => cancelSubscription()}>Cancel</Button>
      </ForgeModal>
    </Container>
  )
}

export default Profile
