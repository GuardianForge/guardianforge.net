import { useContext, useEffect, useState } from 'react'
import { Form, Button, InputGroup, Col, Container, Row } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GlobalContext } from "../contexts/GlobalContext"
import SubscribeButton from '../components/stripe/SubscribeButton'
import Card from '../components/ui/Card'
import ForgeModal from '../components/Modal'
import AlertDetail from '../models/AlertDetail'
import { SubscriptionDetails } from '../models/User'
import { State } from '../models/Enums'
import Loading from '../components/Loading'
import { faCheckCircle, faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import AppLayout from '../layouts/AppLayout'
import { faFacebook, faTwitch, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons'
import ForgeButton from '../components/forms/Button'
import MainLayout from '../layouts/MainLayout'
import ButtonBar from '../components/forms/ButtonBar'

function Profile() {
  const { isClientLoaded, dispatchAlert, setPageTitle } = useContext(GlobalContext)
  const [compState, setCompState] = useState(State.LOADING)
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
  }, [])

  useEffect(() => {
    if(!isClientLoaded) return
    function init() {
      const { ForgeClient } = window.services
      if(ForgeClient.isLoggedIn() && ForgeClient.userInfo) {
        const { userInfo } = ForgeClient
        if(userInfo.about) {
          setAbout(userInfo.about)
        }
        if(userInfo.social) {
          const { facebook, twitter, youtube, twitch } = userInfo.social
          if(facebook) setFacebook(facebook)
          if(twitter) setTwitter(twitter)
          if(youtube) setYoutube(youtube)
          if(twitch) setTwitch(twitch)
        }
        if(userInfo.subscriptionDetails) {
          setSubscriptionDetails(userInfo.subscriptionDetails)
        }
      }
      setCompState(State.DONE);
    }
    init()
  }, [isClientLoaded])

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
      let subDetails = subscriptionDetails
      if(subDetails) {
        subDetails.autoRenew = true
        setSubscriptionDetails(subDetails)
      }
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
      let subDetails = subscriptionDetails
      if(subDetails) {
        subDetails.autoRenew = false
        setSubscriptionDetails(subDetails)
      }
    } catch (err) {
      console.error(err)
      let alert = new AlertDetail("An error has occurred while attempting to stop your subscription. Please try again later, or send us a note.", "Cancel Subscription", true, false)
      dispatchAlert(alert)
    } finally {
      setShowCancelSubscriptionModal(false)
      setIsAutoRenewUpdating(false)
    }
  }

  if(compState === State.LOADING) {
    return <Loading />
  }

  return (
    <MainLayout>
      <div>
        <div className='flex'>
          <h1 className='flex-1'>Edit Profile</h1>
          <ButtonBar>
            <ForgeButton onClick={() => saveProfile()} disabled={isLoading}>
              <FontAwesomeIcon icon={faSave} /> Save
            </ForgeButton>
          </ButtonBar>
        </div>
        <Form.Group className="mb-4">
          <Form.Label><h4>About Me</h4></Form.Label>
          <Form.Control onChange={e => setAbout(e.target.value)} value={about} type="text" placeholder="Add a bit about yourself" />
        </Form.Group>
        <div className='mb-4'>
          {subscriptionDetails ? (
            <Card className="subscription-manager">
              <h3>💎 Thanks, Oh Supporter Mine!</h3>
              <p>Thank you for being a premium GuardianForge user! Your support means the world to me.</p>
              {subscriptionDetails.endDate &&
                <p><b>Subscription Expires:</b> {new Date(subscriptionDetails.endDate * 1000).toLocaleDateString()}</p>
              }
              <p><b>Auto Renew:</b> {subscriptionDetails.autoRenew ? (
                <span>
                  <FontAwesomeIcon icon={faCheckCircle} style={{color: "green"}} /> Enabled
                </span>
              ) : (
                <span>
                  <FontAwesomeIcon icon={faTimesCircle} style={{color: "red"}} /> Disabled
                </span>
              )}</p>
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
        </div>
        <div className='grid md:grid-cols-2 gap-2'>
          <h4 className="md:col-span-2">Social Media Links</h4>
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FontAwesomeIcon icon={faTwitter} />
              </InputGroup.Text>
              <Form.Control onChange={e => setTwitter(e.target.value)} value={twitter} placeholder="ex: https://twitter.com/destinythegame" aria-label="Twitter" />
            </InputGroup>

            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FontAwesomeIcon icon={faTwitch} />
              </InputGroup.Text>
              <Form.Control onChange={e => setTwitch(e.target.value)} value={twitch} type="text" placeholder="ex: https://twitch.tv/username" />
            </InputGroup>
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FontAwesomeIcon icon={faYoutube} />
              </InputGroup.Text>
              <Form.Control onChange={e => setYoutube(e.target.value)} value={youtube} type="text" placeholder="ex: https://www.youtube.com/mychannelname" />
            </InputGroup>
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FontAwesomeIcon icon={faFacebook} />
              </InputGroup.Text>
              <Form.Control onChange={e => setFacebook(e.target.value)} value={facebook} type="text" placeholder="ex: https://www.facebook.com/mypagename" />
            </InputGroup>
          </div>

        <ForgeModal show={showCancelSubscriptionModal} onHide={() => setShowCancelSubscriptionModal(false)} title="Cancel Subscription" closeButton>
          <h3>😢 Sad To See You Go!</h3>
          <p>If there is something GuardianForge doesn't do for you, please consider sending me a message instead! Otherwise click the button below to disable auto renew on your subscription.</p>
          {/* <Button style={{marginRight: "10px"}}>Send a Message</Button> */}
          <Button variant="danger" disabled={isAutoRenewUpdating} onClick={() => cancelSubscription()}>Disable Auto Renew</Button>
        </ForgeModal>
      </div>

    </MainLayout>
  )
}

export default Profile
