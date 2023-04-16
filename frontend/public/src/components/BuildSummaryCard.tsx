import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import UpvoteIcon from './UpvoteIcon'
// @ts-ignore
import { imageFixerMap } from "../utils/shims"
import BuildSummary from '../models/BuildSummary'
import { faEyeSlash, faUser } from '@fortawesome/free-solid-svg-icons'
import Image from './ui/Image'

type Props = {
  buildSummary: BuildSummary
  isPublicUi?: boolean
}

function BuildSummaryCard(props: Props) {
  const navigate = useNavigate()
  const { buildSummary, isPublicUi } = props
  const [highlight1IconUrl, setHighlight1IconUrl] = useState("")
  const [highlight2IconUrl, setHighlight2IconUrl] = useState("")
  const [highlight3IconUrl, setHighlight3IconUrl] = useState("")

  useEffect(() => {
    if(buildSummary.highlights) {
      if(buildSummary.highlights[0]) {
        // @ts-ignore TODO: Fix all these
        if(imageFixerMap[buildSummary.highlights[0]]) {
          // @ts-ignore
          setHighlight1IconUrl(imageFixerMap[buildSummary.highlights[0]])
        } else {
          setHighlight1IconUrl(buildSummary.highlights[0])
        }
      }
      if(buildSummary.highlights[1]) {
        // @ts-ignore
        if(imageFixerMap[buildSummary.highlights[1]]) {
          // @ts-ignore
          setHighlight2IconUrl(imageFixerMap[buildSummary.highlights[1]])
        } else {
          setHighlight2IconUrl(buildSummary.highlights[1])
        }
      }
      if(buildSummary.highlights[2]) {
        // @ts-ignore
        if(imageFixerMap[buildSummary.highlights[2]]) {
        // @ts-ignore{
          setHighlight3IconUrl(imageFixerMap[buildSummary.highlights[2]])
        } else {
          setHighlight3IconUrl(buildSummary.highlights[2])
        }
      }
    }
  }, [])

  function goToBuild() {
    navigate(`/build/${buildSummary.id}`)
  }

  return (
    <div onClick={goToBuild}
      className="bg-neutral-800 p-2 hover:cursor-pointer hover:border-neutral-400 border border-neutral-600 flex flex-col transition">
      <div className="font-bold">
        { buildSummary.name }
      </div>
      <div className="flex gap-2 mb-2 flex-1">
        <BuildSummaryClassIcon iconSet={buildSummary.primaryIconSet} />
        <BuildSummaryImage src={highlight1IconUrl} alt="item 1" />
        <BuildSummaryImage src={highlight2IconUrl} alt="item 2" />
        <BuildSummaryImage src={highlight3IconUrl} alt="item 3" />
      </div>
      <div className="flex">
        <div className="flex gap-2 flex-1 items-center">
          <FontAwesomeIcon icon={faUser} /> { buildSummary.username }
          {buildSummary.isPrivate && <FontAwesomeIcon icon={faEyeSlash} />}
        </div>
        {buildSummary.upvotes !== undefined && buildSummary.upvotes > 0 && (
          <div>
            <UpvoteIcon filled />
            { buildSummary.upvotes }
          </div>
        )}
      </div>
    </div>
  )
}

export default BuildSummaryCard

type BuildSummaryImageProps = {
  src?: string
  alt: string
}

function BuildSummaryImage({ src, alt }: BuildSummaryImageProps) {
  if(src) {
    return (
      <div className="items-center max-w-[50px]">
        <Image src={src} alt={alt} className="rounded" />
      </div>
    )
  }
  return <></>
}

type BuildSummaryClassIconProps = {
  iconSet: string
}

function BuildSummaryClassIcon({ iconSet }: BuildSummaryClassIconProps) {
  return (
    <div className="max-w-[50px]">
      <div className="relative flex content-center items-center">
        <Image src={`/img/classicos/${iconSet.split('-')[0]}.png`}
          alt="Guardian Class/Subclass Icon"
          className={`img-fluid absolute p-1 class-icon-${iconSet.split('-')[0]}`}
        />
        {iconSet.split('-').length > 2 ? (
          <Image
            alt="Guardian Class/Subclass Icon"
            src={`/img/subbgs/${iconSet.split('-')[1]}-${iconSet.split('-')[2]}.png`}
            className="img-fluid subclass-icon"/>
        ) : (
          <Image
            alt="Guardian Class/Subclass Icon"
            src={`/img/subbgs/${iconSet.split('-')[1]}.png`}
            className="img-fluid subclass-icon"/>
        )}
      </div>
    </div>
  )
}