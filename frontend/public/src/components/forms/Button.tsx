import React, { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {

}

function ForgeButton(props: Props) {
  return <button {...props} 
    className={`p-2 border border-accent2 bg-buttonBg hover:border-accent1 transition rounded ${props.className}`}>
    { props.children }
  </button>
}

export default ForgeButton;
