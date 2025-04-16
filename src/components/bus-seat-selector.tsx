import { SVGProps, useMemo, useState } from 'react'
import { BiExit } from 'react-icons/bi'
import { LuToilet } from 'react-icons/lu'
import { PiMicrophoneStageFill } from 'react-icons/pi'
import { TbSteeringWheelFilled } from 'react-icons/tb'

import { cn } from '@/lib/utils'

interface Props {
  floors: {
    places: number
    lines: {
      items: (
        | {
            placeType: 'driver'
          }
        | {
            placeType: 'toilet'
          }
        | {
            placeType: 'guide'
          }
        | {
            placeType: 'empty'
          }
        | {
            placeType: 'entrance'
          }
        | {
            placeType: 'seat'
            number: number
            isBlocked: boolean | null
          }
      )[]
    }[]
  }[]
}

export default function BusSeatSelector({ floors }: Props) {
  const [currentFloorIdx, setCurrentFloorIdx] = useState(0)
  const cf = useMemo(() => floors[currentFloorIdx], [floors, currentFloorIdx])
  const cols = cf.lines.length
  const rows = Math.max(...cf.lines.map((v) => v.items.length))

  console.log({ cols, rows })

  return (
    <div>
      <div className='mb-1.5 text-sm font-semibold'>
        {floors
          .flatMap((v, idx) => [
            <div key={`sep-${idx}`}>/</div>,
            <button key={idx} className={cn(currentFloorIdx != idx && 'text-gray-4')} type='button' onClick={() => setCurrentFloorIdx(idx)}>
              Этаж {idx + 1} ({v.places} мест)
            </button>,
          ])
          .slice(1)}
      </div>
      <div
        className='bg-gray-6/50 grid w-fit grid-flow-col gap-2 rounded-md p-4 shadow-[0px_0px_2px_0px]'
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(2rem, min-content))`,
          gridTemplateRows: `repeat(${rows}, minmax(2rem, min-content))`,
        }}
      >
        {cf.lines.flatMap((v) =>
          v.items.map((v) => (
            <button type='button' disabled>
              {v.placeType === 'seat' && (
                <div className='relative flex items-center justify-center' title={`Место ${v.number}`}>
                  <ArmchairIcon className='text-gray-5 h-8' />
                  <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-white px-0.5 py-px text-[0.625rem] leading-none font-bold'>
                    {v.number}
                  </div>
                </div>
              )}
              {v.placeType === 'driver' && (
                <div className='flex size-full items-center justify-center rounded-sm border-2 border-teal-400 p-1' title='Водитель'>
                  <TbSteeringWheelFilled className='text-lg' />
                </div>
              )}
              {v.placeType === 'entrance' && (
                <div className='flex size-full items-center justify-center rounded-sm border-2 border-teal-400' title='Вход'>
                  <BiExit className='text-lg' />
                </div>
              )}
              {v.placeType === 'toilet' && (
                <div className='flex size-full items-center justify-center rounded-sm border-2 border-teal-400' title='Туалет'>
                  <LuToilet className='text-lg' />
                </div>
              )}
              {v.placeType === 'guide' && (
                <div className='flex size-full items-center justify-center rounded-sm border-2 border-teal-400' title='Гид'>
                  <PiMicrophoneStageFill className='text-lg' />
                </div>
              )}
            </button>
          )),
        )}
      </div>
    </div>
  )
}

function ArmchairIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 32 35' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M2.49996 24C2.49996 26.9168 4.88098 29.2813 7.81814 29.2813L11.2188 29.2813L12.3181 29.2813L12.3181 31.7188L7.81814 31.7188C3.52538 31.7188 0.0454102 28.2629 0.0454102 24L0.0454104 11C0.0454105 6.73697 3.52538 3.28125 7.81814 3.28125L12.3181 3.28125L12.3181 5.71875L11.975 5.71875L7.81814 5.71875C4.88098 5.71875 2.49996 8.08329 2.49996 11L2.49996 24Z'
        fill='currentColor'
      />
      <path
        d='M2.49996 24C2.49996 26.9168 4.88098 29.2813 7.81814 29.2813L11.2188 29.2813L12.5 28L19.5 26.5L22.5 22L23 13L21.5 9L15.5 7.5L13 7L11.975 5.71875L7.81814 5.71875C4.88098 5.71875 2.49996 8.08329 2.49996 11L2.49996 24Z'
        fill='currentColor'
        opacity='0.3'
      />
      <path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M14.3638 34.9688C11.8785 34.9688 9.86377 32.968 9.86377 30.5C9.86377 28.032 11.8785 26.0313 14.3638 26.0313L16.8183 26.0313C19.3036 26.0313 21.3183 24.0305 21.3183 21.5625L21.3183 13.4375C21.3183 10.9695 19.3036 8.96875 16.8183 8.96875L14.3638 8.96875C11.8785 8.96875 9.86377 6.96805 9.86377 4.5C9.86377 2.03195 11.8785 0.03125 14.3638 0.0312501L24.182 0.0312502C28.4748 0.0312502 31.9547 3.48697 31.9547 7.75L31.9547 27.25C31.9547 31.5129 28.4748 34.9688 24.182 34.9688L14.3638 34.9688ZM12.3183 30.5C12.3183 31.6218 13.2341 32.5313 14.3638 32.5313L24.182 32.5313C27.1191 32.5313 29.5001 30.1668 29.5001 27.25L29.5001 7.75C29.5001 4.83329 27.1191 2.46875 24.182 2.46875L14.3638 2.46875C13.2341 2.46875 12.3183 3.3781 12.3183 4.5C12.3183 5.6219 13.2341 6.53125 14.3638 6.53125L16.8183 6.53125C20.6592 6.53125 23.7729 9.6233 23.7729 13.4375L23.7729 21.5625C23.7729 25.3767 20.6592 28.4688 16.8183 28.4688L14.3638 28.4688C13.2341 28.4688 12.3183 29.3782 12.3183 30.5Z'
        fill='currentColor'
      />
      <path
        d='M12.3183 30.5C12.3183 31.6218 13.2341 32.5313 14.3638 32.5313L24.182 32.5313C27.1191 32.5313 29.5001 30.1668 29.5001 27.25L29.5001 7.75C29.5001 4.83329 27.1191 2.46875 24.182 2.46875L14.3638 2.46875C13.2341 2.46875 12.3183 3.3781 12.3183 4.5C12.3183 5.6219 13.2341 6.53125 14.3638 6.53125L16.8183 6.53125C20.6592 6.53125 23.7729 9.6233 23.7729 13.4375L23.7729 21.5625C23.7729 25.3767 20.6592 28.4688 16.8183 28.4688L14.3638 28.4688C13.2341 28.4688 12.3183 29.3782 12.3183 30.5Z'
        fill='currentColor'
        opacity='0.3'
      />
    </svg>
  )
}
