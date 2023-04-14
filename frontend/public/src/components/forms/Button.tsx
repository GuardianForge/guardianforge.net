import React, { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {

}

function ForgeButton(props: Props) {
  return <button {...props} 
    className={`p-2 border border-gray-600 bg-gray-800 hover:border-gray-400 transition ${props.className}`}>
    { props.children }
  </button>
}

export default ForgeButton;
