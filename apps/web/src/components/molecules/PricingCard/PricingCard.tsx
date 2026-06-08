import { StaticImageData } from 'next/image'
import { cn } from '@/utils/cn'
import { Button } from '@/components/atoms/button'
import { ReactSVG } from 'react-svg'
import CheckIcon from '@/assets/icons/check.svg'
import CloseIcon from '@/assets/icons/close.svg'

export type PricingCardProps = {
  name: string
  icon: StaticImageData
  label?: {
    icon: StaticImageData
    text: string
  }
  price: string
  text: string
  services: {
    contains?: boolean
    label: string
  }[]
  button: {
    label: string
    link: string
  }
  info?: string
}

export const PricingCard = ({
  name,
  price,
  text,
  services,
  label,
  icon,
  button,
  info,
}: PricingCardProps) => {
  return (
    <div
      className={cn(
        'p-6 md:p-8 w-full md:max-w-125 rounded-xl',
        label ? 'bg-primary' : 'bg-gray-05 border border-gray-100/8',
      )}
    >
      <div className="mb-8">
        <div className="flex gap-3 mb-4">
          <div className={cn('p-4 h-fit rounded-xl', label ? 'bg-white/20' : 'bg-gray-60/5')}>
            <ReactSVG
              src={icon.src}
              beforeInjection={(svg) => {
                svg.setAttribute(
                  'class',
                  cn(
                    'w-6 h-6 transition-colors duration-200',
                    label ? '[&_path]:stroke-white' : '[&_path]:stroke-gray-100',
                  ),
                )
              }}
            />
          </div>
          <div>
            <p
              className={cn('tiles-title-font', label ? 'text-white' : 'text-gray-100')}
              dangerouslySetInnerHTML={{ __html: name }}
            />
            <p
              className={cn(
                'font-mono [&_span]:text-[14px] text-[20px]',
                label
                  ? 'text-white [&_span]:text-white/70'
                  : 'text-gray-100 [&_span]:text-gray-100/70 ',
              )}
              dangerouslySetInnerHTML={{ __html: price }}
            />
          </div>
        </div>
        <p
          className={cn('body-medium mb-6', label ? 'text-white/80' : 'text-gray-60')}
          dangerouslySetInnerHTML={{ __html: text }}
        />

        <div className="flex flex-col gap-3">
          {services.map((service) => (
            <div key={service.label} className="flex gap-3">
              {service.contains ? (
                <ReactSVG
                  src={CheckIcon.src}
                  beforeInjection={(svg) => {
                    svg.setAttribute(
                      'class',
                      cn('w-5 h-5', label ? '[&_path]:stroke-white' : '[&_path]:stroke-primary'),
                    )
                  }}
                />
              ) : (
                <ReactSVG
                  src={CloseIcon.src}
                  beforeInjection={(svg) => {
                    svg.setAttribute(
                      'class',
                      cn('w-5 h-5', label ? '[&_path]:stroke-white' : '[&_path]:stroke-gray-60/50'),
                    )
                  }}
                />
              )}
              <p
                className={cn(
                  'body-medium [&_span]:font-bold',
                  label ? 'text-white' : 'text-gray-100',
                  service.contains ? '' : 'text-gray-60/50',
                )}
                dangerouslySetInnerHTML={{ __html: service.label }}
              />
            </div>
          ))}
        </div>
      </div>

      <Button
        size="lg"
        variant={label ? 'primary' : 'secondary'}
        as="link"
        href={button.link}
        className={cn(
          'w-full',
          label ? 'bg-white text-primary shadow-lg shadow-gray-100/30 hover:bg-gray-10' : '',
        )}
      >
        {button.label}
      </Button>

      {info && (
        <p
          className={cn('body-small text-center mt-3', label ? 'text-white/70' : 'text-gray-60')}
          dangerouslySetInnerHTML={{ __html: info }}
        />
      )}
    </div>
  )
}
