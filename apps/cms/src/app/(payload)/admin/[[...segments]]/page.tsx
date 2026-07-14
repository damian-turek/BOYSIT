import { generatePageMetadata, RootPage } from '@payloadcms/next/views'
import config from '@payload-config'

import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config, params, searchParams })

const Page = ({ params, searchParams }: Args) =>
  RootPage({
    config,
    importMap,
    params,
    searchParams,
  })

export default Page
