import type { FastifyPluginAsync } from 'fastify'

import {
  questionParamsSchema,
  questionsQuerySchema,
  type QuestionParams,
  type QuestionsQuery,
} from './questions.schemas.js'
import { questionsService } from './questions.service.js'

export const questionsRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: QuestionsQuery }>(
    '/api/v1/questions',
    {
      schema: {
        querystring: questionsQuerySchema,
      },
    },
    async (request) => {
      return questionsService.list(request.query, request.currentUser)
    },
  )

  app.get<{ Params: QuestionParams }>(
    '/api/v1/questions/:slug',
    {
      schema: {
        params: questionParamsSchema,
      },
    },
    async (request, reply) => {
      const question = await questionsService.detail(
        request.params.slug,
        request.currentUser,
      )

      if (!question) {
        return reply.status(404).send({
          error: {
            code: 'QUESTION_NOT_FOUND',
            message: 'Question was not found',
            details: null,
          },
        })
      }

      return {
        data: question,
      }
    },
  )
}
