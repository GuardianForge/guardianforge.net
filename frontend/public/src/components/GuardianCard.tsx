import React from 'react'
import { classes, races } from "../constants"

type Props = {
	classType: string
	light: string
	raceType: string
	emblemUrl: string
	onClick?: React.MouseEventHandler<HTMLDivElement>
}

function GuardianCard(props: Props) {
	const {classType, light, raceType, emblemUrl, onClick} = props
  const className = classes[Number(classType)]
  const raceName = races[Number(raceType)]

  return (
    <div onClick={onClick}
			className='h-[96px] w-full  max-w-[474px] flex border border-neutral-600 hover:border-neutral-400 hover:cursor-pointer shadow p-2 transition-all'
			style={{backgroundImage: `url('https://www.bungie.net/${emblemUrl}')`}}>
      <div className="flex-1 flex flex-col ml-[110px]">
        <span className="text-[#eee] text-2xl font-bold">{className}</span>
        <span className="text-[#aaa] text-lg">{raceName}</span>
      </div>
      <div className="character-card-right">
        <span className="text-d2light font-bold shadow-lg text-3xl">{light}</span>
      </div>
    </div>
  )
}

export default GuardianCard
