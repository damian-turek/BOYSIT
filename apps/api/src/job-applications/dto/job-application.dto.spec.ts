import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { JobApplicationStatus } from 'database'
import { describe, expect, it } from 'vitest'

import { CreateJobApplicationDto } from './create-job-application.dto'
import { JobApplicationSort, ListJobApplicationsDto } from './list-job-applications.dto'
import { UpdateJobApplicationDto } from './update-job-application.dto'

describe('job application DTOs', () => {
  it('accepts and trims a complete create payload', async () => {
    const dto = plainToInstance(CreateJobApplicationDto, {
      company: '  Acme  ',
      role: '  Engineer  ',
      jobUrl: 'https://example.com/jobs/1',
      status: JobApplicationStatus.applied,
      appliedAt: '2026-08-06T00:00:00.000Z',
      technologyIds: ['7c7a5db2-531f-4a30-b63a-40cfea1322b4'],
      customTechnologies: ['GraphQL'],
    })

    await expect(validate(dto)).resolves.toHaveLength(0)
    expect(dto.company).toBe('Acme')
    expect(dto.role).toBe('Engineer')
  })

  it('rejects invalid URLs, statuses and technology IDs', async () => {
    const dto = plainToInstance(CreateJobApplicationDto, {
      company: 'Acme',
      role: 'Engineer',
      jobUrl: 'javascript:alert(1)',
      status: 'unknown',
      technologyIds: ['not-a-uuid'],
    })

    const errors = await validate(dto)
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['jobUrl', 'status', 'technologyIds']),
    )
  })

  it('accepts null to clear optional update fields', async () => {
    const dto = plainToInstance(UpdateJobApplicationDto, {
      location: null,
      appliedAt: null,
      followUpAt: null,
    })

    await expect(validate(dto)).resolves.toHaveLength(0)
  })

  it('transforms and validates list query values', async () => {
    const dto = plainToInstance(ListJobApplicationsDto, {
      search: '  Acme ',
      status: JobApplicationStatus.technical,
      sort: JobApplicationSort.followUpAsc,
      page: '2',
      limit: '12',
    })

    await expect(validate(dto)).resolves.toHaveLength(0)
    expect(dto).toMatchObject({
      search: 'Acme',
      page: 2,
      limit: 12,
    })
  })

  it('rejects more than ten custom technologies', async () => {
    const dto = plainToInstance(CreateJobApplicationDto, {
      company: 'Acme',
      role: 'Engineer',
      customTechnologies: Array.from({ length: 11 }, (_, index) => `Tech ${index}`),
    })

    const errors = await validate(dto)
    expect(errors.some((error) => error.property === 'customTechnologies')).toBe(true)
  })
})
