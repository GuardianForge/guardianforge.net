import { faCaretLeft, faCaretRight, faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { ReactNode, useEffect, useState } from 'react'
import ForgeButton from '../forms/Button'

type PaginatorButtonProps = {
  disabled?: boolean
  active?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined
  children: ReactNode
  compact?: boolean
}

function PaginatorButton({ disabled, active, onClick, children, compact }: PaginatorButtonProps) {
  return <ForgeButton
    disabled={disabled}
    onClick={onClick}
    className={`
      py-2
      border-none
      border-r
      border-r-neutral-800
      last:border-none
      ${compact ? 'px-3 text-sm' : 'px-4' }
      ${active ? 'bg-neutral-700 hover:bg-neutral-700 disabled:bg-neutral-800' : ''}
      ${disabled ? 'bg-neutral-800 text-neutral-500' : ''}`}>
    { children }
  </ForgeButton>
}

type Props = {
  onPageNavigate: Function
  page: number
  maxPageIterationsToDisplay: number
  totalPages: number
  className?: string
  compact?: boolean
}

function Paginator({ onPageNavigate, page, maxPageIterationsToDisplay, totalPages, className, compact }: Props) {
  const [showLeftElipses, setShowLeftElipses] = useState(false)
  const [showRightElipses, setShowRightElipses] = useState(false)

  useEffect(() => {
    if((page - maxPageIterationsToDisplay) > 1) {
      setShowLeftElipses(true)
    } else {
      setShowLeftElipses(false)
    }
    if((page + maxPageIterationsToDisplay) < totalPages) {
      setShowRightElipses(true)
    } else {
      setShowRightElipses(false)
    }
  }, [page])

  return (
    <div className={`flex justify-center ${className}`}>
      <div className="flex border border-neutral-800">
        <PaginatorButton
          compact={compact}
          disabled={page === 1}
          onClick={() => onPageNavigate(page - 1)}>
          <FontAwesomeIcon icon={faCaretLeft} />
        </PaginatorButton>

        {showLeftElipses &&
          <PaginatorButton disabled compact={compact}>
            <FontAwesomeIcon icon={faEllipsisH} />
          </PaginatorButton>
        }

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
          if(low <= paginatorBeingRendered && paginatorBeingRendered <= high) {
            return (
              <PaginatorButton
                compact={compact}
                active={page === idx + 1}
                key={`page-${idx + 1}`}
                onClick={() => onPageNavigate(idx + 1)}>
                { idx + 1 }
              </PaginatorButton>
            )
          }
          return <></>
        })}

        {showRightElipses &&
          <PaginatorButton disabled compact={compact}>

            <FontAwesomeIcon icon={faEllipsisH} />
          </PaginatorButton>
        }

        <PaginatorButton
          compact={compact}
          disabled={page === totalPages}
          onClick={() => onPageNavigate(page + 1)}>
          <FontAwesomeIcon icon={faCaretRight} />
        </PaginatorButton>
      </div>
    </div>
  )
}

export default Paginator