import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { ReactNode, useEffect } from 'react'
import { faClose } from '@fortawesome/free-solid-svg-icons'

type Props = {
  className?: string
  title?: string
  header?: React.ReactFragment
  children: ReactNode
  footer?: ReactNode
  show?: boolean
  scrollable?: boolean
  onHide?: Function
  centered?: boolean
  fullscreen?: boolean | string
  size?: string
  closeButton?: boolean
  onClose?: Function
}

function ForgeModal(props: Props) {
  const { className, title, children, show, onHide, footer, header, onClose } = props

  useEffect(() => {
    if(!show && onHide) onHide() 
  }, [show, onHide])

  useEffect(() => {
    function preventScroll(e: any) {
      e.stopPropagation()
      e.preventDefault()
    }
    let els = [
      document.getElementById("backdrop"),
      document.getElementById("header"),
      document.getElementById("footer")
    ]

    els.forEach(el => {
      el?.addEventListener("wheel", preventScroll, { passive: false })
    })
  }, [show])

  // useEffect(() => {
  //   document.addEventListener('keydown', preventKeyBoardScroll, false);

  //   function preventKeyBoardScroll(e: any) {
  //     var keys = [32, 33, 34, 35, 37, 38, 39, 40];
  //     if (keys.includes(e.keyCode)) {
  //       e.preventDefault();
  //       return false;
  //     }
  //   }
  // }, [])
  
  if(show) {
    return (
      <div className={`absolute h-screen w-screen top-0 left-0 z-50 overscroll-none ${className}`}>
        <div id="backdrop" onClick={onClose ? () => onClose() : undefined} 
          className="absolute h-screen w-screen top-0 left-0 bg-black bg-opacity-[85%] z-100 overflow-auto overscroll-none"></div>
        <div className="relative bg-gray-900 max-w-[500px] max-h-[60vh] mx-auto overflow-hidden mt-10 flex flex-col overscroll-none">
          <div className="flex p-4 text-xl items-center" id="header" >
            {header ? (
              <>{ header }</>
            ) : (
              <div className="font-bold flex-1">{ title }</div>
            )}
            {onClose && (
              <FontAwesomeIcon className='hover:cursor-pointer' onClick={() => onClose()} icon={faClose} />
            )}
          </div>

          <div className="px-4 scroll-auto flex-1 overflow-scroll overscroll-contain">
            { children }
          </div>

          {footer !== undefined && (
            <div id="footer" className="p-4">
              { footer }
            </div>
          )}
        </div>
      </div>
    )
  }

  return <></>
}

export default ForgeModal
