import Link from 'next/link'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/atoms/Button'

import GitHubIcon from '@/assets/icons/github.svg'
import Logo from '@/assets/icons/logo.svg'
import SendIcon from '@/assets/icons/send.svg'
import TwitterIcon from '@/assets/icons/twitter.svg'

export type FooterProps = {
  name: string
  description: string
  products: {
    label: string
    link: string
  }[]
  company: {
    label: string
    link: string
  }[]
  bottomLinks: {
    label: string
    link: string
  }[]
}

export const Footer = ({ name, description, products, company, bottomLinks }: FooterProps) => {
  const t = useTranslations('Footer')
  return (
    <footer className="bg-background py-8 md:py-12">
      <div className="max-w-360 mx-auto px-4">
        <div className="flex justify-between flex-col md:flex-row gap-6">
          <div className="flex flex-col">
            <Link
              className="group flex gap-2 mb-3 items-center body-large cursor-pointer z-50"
              href="/"
            >
              <Button icon={Logo} iconOnly className="group-hover:bg-primary/90" />
              <p
                className="body-large text-gray-100 transition-colors duration-300"
                dangerouslySetInnerHTML={{ __html: name }}
              />
            </Link>
            <p
              className="body-medium text-gray-60 mb-4 max-w-[320px]"
              dangerouslySetInnerHTML={{ __html: description }}
            />
            <div className="flex gap-3">
              <Button icon={GitHubIcon} iconOnly variant="secondary" />
              <Button icon={TwitterIcon} iconOnly variant="secondary" />
              <Button icon={SendIcon} iconOnly variant="secondary" />
            </div>
          </div>
          <div className="flex flex-col gap-2.5 max-w-70 w-full">
            <p
              className="label-font text-gray-60 uppercase "
              dangerouslySetInnerHTML={{ __html: t('product') }}
            />
            {products.map((product) => (
              <Link
                key={product.label}
                href={product.link}
                className="body-medium text-gray-60 hover:text-gray-100/90 transition-colors duration-200 ease-in-out cursor-pointer"
                dangerouslySetInnerHTML={{ __html: product.label }}
              />
            ))}
          </div>
          <div className="flex flex-col gap-2.5 max-w-70 w-full">
            <p
              className="label-font text-gray-60 uppercase "
              dangerouslySetInnerHTML={{ __html: t('company') }}
            />
            {company.map((product) => (
              <Link
                key={product.label}
                href={product.link}
                className="body-medium text-gray-60 hover:text-gray-100/90 transition-colors duration-200 ease-in-out cursor-pointer"
                dangerouslySetInnerHTML={{ __html: product.label }}
              />
            ))}
          </div>
        </div>
        <div className="h-px bg-gray-60/20 w-full mt-8 md:mt-10 mb-8" />
        <div className="flex justify-between items-center flex-col md:flex-row gap-3">
          <p className="label-font text-gray-60">
            &#169; {new Date().getFullYear()} {t('allRightsReserved')}
          </p>
          <div className="flex gap-4">
            {bottomLinks.map((product) => (
              <Link
                key={product.label}
                href={product.link}
                className="body-small text-gray-60 hover:text-gray-100/90 transition-colors duration-200 ease-in-out cursor-pointer"
                dangerouslySetInnerHTML={{ __html: product.label }}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
