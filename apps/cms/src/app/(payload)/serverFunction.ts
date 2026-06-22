'use server'

import { handleServerFunctions } from '@payloadcms/next/layouts'
import config from '@payload-config'
import type { ServerFunctionClient } from 'payload'

import { importMap } from './admin/importMap'

export const serverFunction: ServerFunctionClient = async (args) =>
  handleServerFunctions({
    ...args,
    config,
    importMap,
  })
