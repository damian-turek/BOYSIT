import Link from 'next/link'

import { Crown } from 'lucide-react'

import { Button } from '@/components/atoms/Button'

export type ProPlanCardProps = {
  name: string
  text: string
  list: string[]
  button: {
    label: string
    link: string
  }
  badge: string
}

export const ProPlanCard = ({ name, text, list, button, badge }: ProPlanCardProps) => {
  return (
    <Link
      href={button.link}
      className="flex flex-col rounded-xl bg-primary border border-primary p-6 transition-all ease-in-out duration-300 hover:shadow-lg hover:shadow-primary/50"
    >
      <div className="flex gap-2 items-center mb-2">
        <Crown size={16} className="text-white" />
        <h3 className="label-font uppercase text-white/80">{name}</h3>
      </div>
      <p className="button-font text-white mb-2">{text}</p>
      <ul className="list-disc text-white/80 list-inside flex justify-center flex-col mb-4">
        {list.map((item) => (
          <li key={item} className="body-small">
            {item}
          </li>
        ))}
      </ul>
      <Button className="w-full bg-white text-primary hover:bg-white hover:scale-103 transition-all ease-in-out duration-300 mb-2">
        {button.label}
      </Button>
      <p className="body-small text-center text-white/60">{badge}</p>
    </Link>
  )
}
