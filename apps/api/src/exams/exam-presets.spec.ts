import { AccessLevel } from 'database'
import { describe, expect, it } from 'vitest'

import { EXAM_PRESETS, getAllowedQuestionAccessLevels, getExamPreset } from './exam-presets'

describe('exam presets', () => {
  it('uses unique stable slugs and positive limits', () => {
    const slugs = EXAM_PRESETS.map((preset) => preset.slug)

    expect(new Set(slugs).size).toBe(slugs.length)
    expect(
      EXAM_PRESETS.every((preset) => preset.questionCount > 0 && preset.durationMinutes > 0),
    ).toBe(true)
  })

  it('restricts Free presets to the Free question pool', () => {
    const freePresets = EXAM_PRESETS.filter((preset) => preset.access === AccessLevel.free)

    expect(freePresets.length).toBeGreaterThan(0)
    expect(
      freePresets.every((preset) =>
        getAllowedQuestionAccessLevels(preset).every(
          (accessLevel) => accessLevel === AccessLevel.free,
        ),
      ),
    ).toBe(true)
  })

  it('allows Pro presets to draw from both Free and Pro questions', () => {
    const preset = getExamPreset('javascript')

    expect(preset).toBeDefined()
    expect(preset && getAllowedQuestionAccessLevels(preset)).toEqual([
      AccessLevel.free,
      AccessLevel.pro,
    ])
  })
})
