import React, { useContext, useEffect, useState } from 'react'
import ForgeButton from '../forms/Button'
import ForgeModal from '../Modal'
import styled from 'styled-components';
import { GlobalContext } from '../../../contexts/GlobalContext';
import { Col, Row } from 'react-bootstrap';
import colors from '../../../colors';
import AlertDetail from '../../../models/AlertDetail';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

const Wrapper = styled.div`
  .selected {
    background-color: cyan !important;
  }
`

const SubscribeModalWrapper = styled.div`
  .pricing-option {
    display: flex;
    flex-direction: column;
    background-color: ${colors.theme2.dark3} !important;
    border: 1px solid ${colors.theme2.dark3};
    padding: 7px;
    border-radius: 5px;

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

function SubscribeButton() {
  const { isClientLoaded, dispatchAlert } = useContext(GlobalContext)
  const [isModalShowing, setIsModalShowing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [pricingOptions, setPricingOptions] = useState<PricingOptions>({
    Monthly: "",
    Yearly: ""
  })

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

  return (
    <Wrapper>
      <ForgeButton onClick={() => setIsModalShowing(true)}>
        💎 &nbsp; Support Forge
      </ForgeButton>

      <ForgeModal
        closeButton
        onHide={() => setIsModalShowing(false)}
        show={isModalShowing}
        title="Subscribe"
        footer={<ForgeButton onClick={onCheckoutClicked} disabled={isLoading}>
          {isLoading ? <FontAwesomeIcon icon={faCircleNotch} className="fa-spin" /> : "Pay via Stripe"}
        </ForgeButton>}>
          <SubscribeModalWrapper>
            <Row className="mb-3">
              <Col>
                <div className="mb-2"><b>Thanks for considering a subscription to GuardianForge!</b></div>
                <div>By subscribing, all ads will be removed from the site and you'll be supporting an independant developer and fellow Guardian!</div>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <div onClick={() => setSelectedProduct(pricingOptions.Monthly)} className={`pricing-option ${selectedProduct === pricingOptions.Monthly ? "selected" : ""}`}>
                  <span className="price">$3</span>
                  <span className="title">per Month</span>
                </div>
              </Col>
              <Col>
                <div onClick={() => setSelectedProduct(pricingOptions.Yearly)} className={`pricing-option ${selectedProduct === pricingOptions.Yearly ? "selected" : ""}`}>
                  <span className="price">$30</span>
                  <span className="title">per Year <i>(2 Months free!)</i></span>
                </div>
              </Col>
            </Row>
            <div className="disclaimer-row">
              GuardianForge uses Stripe to process payments. Your private financial info is never seen by us.
            </div>
          </SubscribeModalWrapper>
      </ForgeModal>
    </Wrapper>
  )
}

export default SubscribeButton