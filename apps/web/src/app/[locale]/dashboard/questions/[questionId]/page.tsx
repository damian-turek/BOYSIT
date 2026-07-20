// import { Metadata } from 'next'
// import { notFound } from 'next/navigation'
//
// import {
//   ApiRequestError,
//   fetchQuestion,
// } from '@/services/questionsApi'
//
// import { QuestionDetail } from '@/components/organisms/QuestionDetail'
//
// type PageProps = {
//   params: Promise<{
//     locale: string
//     questionId: string
//   }>
// }
//
// export const dynamic = 'force-dynamic'
//
// export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
//   const { questionId } = await params
//
//   try {
//     const question = await fetchQuestion(questionId)
//
//     return {
//       title: `${question.title} | Questions`,
//       description:
//         question.excerpt ??
//         `${question.difficulty} ${question.category?.name ?? ''} interview question.`,
//     }
//   } catch {
//     return { title: 'Question not found' }
//   }
// }
//
// export default async function QuestionPage({ params }: PageProps) {
//   const { questionId } = await params
//
//   try {
//     const question = await fetchQuestion(questionId)
//
//     return <QuestionDetail question={question} />
//   } catch (error) {
//     if (error instanceof ApiRequestError && error.status === 404) {
//       notFound()
//     }
//
//     throw error
//   }
// }
