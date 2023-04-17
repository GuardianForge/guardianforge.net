import React, { ButtonHTMLAttributes } from 'react';

interface Props extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {

}

function ForgeButtonLink(props: Props) {
  return <a {...props}
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
      hover:text-inherit ${props.className}`}>
    { props.children }
  </a>
}

export default ForgeButtonLink;
