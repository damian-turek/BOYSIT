import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { serializeQuestionDetail } from './questions.service.js'

const createQuestion = (accessLevel: 'free' | 'pro') => ({
  id: '00000000-0000-0000-0000-000000000001',
  slug: 'test-question',
  title: 'Test question',
  excerpt: 'Preview',
  questionText: 'Protected question text',
  answerText: 'Protected answer',
  explanation: 'Protected explanation',
  codeSnippet: 'const protectedValue = true',
  difficulty: 'senior' as const,
  questionType: 'theory' as const,
  accessLevel,
  category: null,
  technology: null,
  questionTags: [],
})

describe('serializeQuestionDetail', () => {
  it('keeps full content for free questions', () => {
    const result = serializeQuestionDetail(createQuestion('free'))

    assert.equal(result.locked, false)
    assert.equal('answerText' in result, true)
    assert.equal('questionText' in result, true)

    if ('answerText' in result && 'questionText' in result) {
      assert.equal(result.answerText, 'Protected answer')
      assert.equal(result.questionText, 'Protected question text')
    }
  })

  it('removes protected fields for pro questions', () => {
    const result = serializeQuestionDetail(createQuestion('pro'))

    assert.equal(result.locked, true)
    assert.equal('questionText' in result, false)
    assert.equal('answerText' in result, false)
    assert.equal('explanation' in result, false)
    assert.equal('codeSnippet' in result, false)
  })
})
