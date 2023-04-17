import React, { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {

}

function ForgeButton(props: Props) {
  return <button {...props}
    className={`
      py-1
      px-2 
      border 
      border-neutral-500 
      bg-inherit 
      hover:bg-neutral-800 
      hover:border-gray-400 
      transition 
      flex items-center justify-center gap-1
      ${props.disabled ? 'cursor-not-allowed' : ''} 
      ${props.className}`}>
    { props.children }
  </button>
}

export default ForgeButton;
