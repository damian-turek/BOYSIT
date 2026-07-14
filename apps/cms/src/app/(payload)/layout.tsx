import '@payloadcms/next/css'

import { RootLayout } from '@payloadcms/next/layouts'
import config from '@payload-config'
import type { ReactNode } from 'react'

import { importMap } from './admin/importMap'
import { serverFunction } from './serverFunction'

type Args = {
  children: ReactNode
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
