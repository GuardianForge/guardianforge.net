import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'
import colors from '../../colors'
import { GlobalContext } from '../../contexts/GlobalContext'
import AlertDetail from '../../models/AlertDetail'
import ForgeButton from '../forms/Button'
import ForgeModal from '../Modal'

const Wrapper = styled.div`
  .pricing-option {
    display: flex;
    flex-direction: column;
    padding: 7px;

    .price {
      font-weight: bold;
      font-size: 32px;
    }

    &:hover {
      border: 1px solid ${colors.theme2.accent2};
      cursor: pointer;
    }
  }

  .selected {
    border: 1px solid ${colors.theme2.accent1};
    box-shadow: 2px 2px 10px ${colors.theme2.accent1};

    &:hover {
      border: 1px solid ${colors.theme2.accent1} !important;
      cursor: pointer;
    }
  }

  .disclaimer-row {
    font-size: 14px;
    font-style: italic;
  }
`


type PricingOptions = {
  Monthly?: string
  Yearly?: string
}

type Props = {
  show: boolean
  onHide?: Function
}

function SubscribeModal(props: Props) {
  const { show, onHide } = props
  const { isClientLoaded, dispatchAlert } = useContext(GlobalContext)
  const [selectedProduct, setSelectedProduct] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [pricingOptions, setPricingOptions] = useState<PricingOptions>({
    Monthly: "",
    Yearly: ""
  })
  const [isPremiumAlready, setIsPremiumAlready] = useState(false)


  useEffect(() => {
    if(!isClientLoaded) return
    function init() {
      const { ForgeClient } = window.services
      if(ForgeClient.config) {
        setPricingOptions({
          Monthly: ForgeClient.config.monthlyPriceId,
          Yearly: ForgeClient.config.yearlyPriceId,
        })
        setSelectedProduct(ForgeClient.config.monthlyPriceId)
      }
      if(ForgeClient.isPremiumUser()) {
        setIsPremiumAlready(true)
      }
    }
    init()
  }, [isClientLoaded])

  async function onCheckoutClicked() {
    if(selectedProduct) {
      try {
        setIsLoading(true)
        const { ForgeClient } = window.services
        let intent = await ForgeClient.createSubscriptionIntent(selectedProduct)
        window.location = intent.url
      } catch (err) {
        var alert = new AlertDetail("An error has occurred. Please try subscribing again later.", "Subscribe Error", true, false)
        dispatchAlert(alert)
      } finally {
        setIsLoading(false)
      }
    }
  }

  if(!isPremiumAlready) {
    return (
      <ForgeModal
        closeButton
        onHide={onHide}
        show={show}
        title="Subscribe"
        footer={<ForgeButton onClick={onCheckoutClicked} disabled={isLoading || isPremiumAlready}>
          {isLoading ? <FontAwesomeIcon icon={faCircleNotch} className="fa-spin" /> : "Pay via Stripe"}
        </ForgeButton>}>
        <Wrapper>
          <Row className="mb-3">
            <Col>
              <div className="mb-2"><b>Thanks for considering a subscription to GuardianForge!</b></div>
              <div>By subscribing, all ads will be removed from the site and you'll be supporting an independant developer and fellow Guardian!</div>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <div onClick={() => setSelectedProduct(pricingOptions.Monthly)} className={`pricing-option border border-neutral-700 bg-neutral-800 ${selectedProduct === pricingOptions.Monthly ? "selected" : ""}`}>
                <span className="price">$3</span>
                <span className="title">per Month</span>
              </div>
            </Col>
            <Col>
              <div onClick={() => setSelectedProduct(pricingOptions.Yearly)} className={`pricing-option border border-neutral-700 bg-neutral-800 ${selectedProduct === pricingOptions.Yearly ? "selected" : ""}`}>
                <span className="price">$30</span>
                <span className="title">per Year <i>(2 Months free!)</i></span>
              </div>
            </Col>
          </Row>
          <div className="disclaimer-row">
            GuardianForge uses Stripe to process payments. Your private financial info is never seen by us.
          </div>
        </Wrapper>
      </ForgeModal>
    )
  } else {
    return (
      <ForgeModal
        closeButton
        onHide={onHide}
        show={show}
        title="Subscribe"
        footer={<ForgeButton onClick={onCheckoutClicked} disabled={isLoading || isPremiumAlready}>
          {isLoading ? <FontAwesomeIcon icon={faCircleNotch} className="fa-spin" /> : "Pay via Stripe"}
        </ForgeButton>}>
          <Wrapper>
            <Row>
              <Col>
                Looks like you are already a subscriber. Thank you so much for the support!
              </Col>
            </Row>
          </Wrapper>
      </ForgeModal>
    )
  }
}

export default SubscribeModal