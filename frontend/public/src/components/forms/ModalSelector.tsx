import React, { useState } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ForgeModal from '../Modal'
import ForgeButton from '../forms/Button'
import colors from '../../colors'
import { Button } from 'react-bootstrap'
import ModalSelectorOption from '../../models/ModalSelectorOption'

const Wrapper = styled.div`
  color: #eee;

  .activity-select-activator {
    text-align: left !important;
    background-color: ${colors.theme2.dark3};
    color: #eee;
    width: 100%;
    display: flex;
    justify-content: space-between;
    border: none !important;

    &:hover {
      background-color: ${colors.theme2.dark3} !important;
    }

    &:focus {
      background-color: ${colors.theme2.dark3} !important;
    }
  }

  .activity-selector-options-wrapper {
    position: absolute;
  }

  .activity-selector-options {
    position: relative;
    display: flex;
    flex-direction: column;
    z-index: 2000;
    border-top: 0px;
    background-color: #333;
  }

  .activity-option {
    padding: 2px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .activity-option:hover {
    border-right: 2px solid #eee;
    color: #ccc;
  }

  .activity-icon {
    max-width: 20px;
    margin-right: 5px;
  }
`

const Selection = styled.div`
  display: flex;
  align-items: center;
`

const SelectItemButton = styled(Button)`
  width: 100%;
  background-color: ${colors.theme2.dark2} !important;
  border: none !important;
  display: flex !important;
  align-items: center;
  justify-content: start;
  font-size: 18px !important;
  margin-bottom: 10px;

  &:hover {
    background-color: ${colors.theme2.dark3} !important;
  }

  img {
    width: 35px;
    height: 35px;
    margin-right: 10px;
  }
`

type Props = {
  value: ModalSelectorOption
  onChange: Function
  options: Array<ModalSelectorOption>
  className?: string
  title: string
  component?: React.ReactFragment
  header?: React.ReactFragment,
  children?: React.ReactFragment
}

function ModalSelector(props: Props) {
  const { value, onChange, options, className, title, component, header, children } = props
  const [areOptionsOpen, setAreOptionsOpen] = useState(false)

  function onOptionClicked(opt: ModalSelectorOption) {
    setAreOptionsOpen(false)
    onChange(opt)
  }

  function showOptions() {
    setTimeout(() => setAreOptionsOpen(true))
  }

  return (
    <Wrapper className={className}>
      {children ? (children) : (
        <ForgeButton className="activity-select-activator" onClick={showOptions}>
          <Selection>
            {value.iconUrl && <img className="activity-icon" src={value.iconUrl} />}
            <span>{ value.display }</span>
          </Selection>
          <span><FontAwesomeIcon icon="caret-down" /></span>
        </ForgeButton>
      )}
      <ForgeModal
        centered
        show={areOptionsOpen}
        title={title}
        footer={<ForgeButton onClick={() => setAreOptionsOpen(false)}>Close</ForgeButton>}>
        {header && (header)}
        {options.map((el: ModalSelectorOption, idx: number) => (
          <SelectItemButton key={`activity-${idx}`} className="activity-option" onClick={() => onOptionClicked(el)}>
            {component ? (
              component
            ) : (
              <>
                {el.iconUrl && <img className="activity-icon" src={el.iconUrl} />}
                { el.display }
              </>
            )}
          </SelectItemButton>
        ))}
      </ForgeModal>
    </Wrapper>
  )
}

export default ModalSelector
