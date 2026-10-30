'use client'

import { Crown } from 'lucide-react'

import { useCheckoutStore } from '@/store/useCheckoutStore'

import { Button } from '@/components/atoms/Button'

export type ProPlanCardProps = {
  name: string
  text: string
  list: string[]
  button: {
    label: string
  }
  badge: string
  /** Opens the checkout modal directly, from wherever the card is shown. */
  planId: string
}

export const ProPlanCard = ({ name, text, list, button, badge, planId }: ProPlanCardProps) => {
  const openCheckout = useCheckoutStore((state) => state.openCheckout)

  return (
    // A plain <div>, not a <button>/<a>, because it contains its own
    // interactive <Button> below - nesting a button inside a button (or a
    // list inside a button) is invalid HTML and React 19 will throw a
    // DOM-nesting console error for it.
    <div className="flex flex-col rounded-2xl bg-primary border border-primary p-5">
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
      <Button
        onClick={() => openCheckout(planId, name)}
        className="w-full bg-white text-primary hover:bg-white/90 mb-2"
      >
        {button.label}
      </Button>
      <p className="body-small text-center text-white/60">{badge}</p>
    </div>
  )
}
