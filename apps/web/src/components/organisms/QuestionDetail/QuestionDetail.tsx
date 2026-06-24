'use client'

import { useState } from 'react'

import Link from 'next/link'

import {
  ArrowLeft,
  BarChart3,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Cpu,
  Crown,
  Database,
  Flag,
  GitBranch,
  Globe,
  Layers,
  Lock,
  MessageSquare,
  Send,
  Server,
  Share2,
  Shield,
  ThumbsUp,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import {
  Question,
  QuestionComment,
  QuestionGrade,
} from '@/parsers/getQuestionData'
import { cn } from '@/utils/cn'

const domainConfig = {
  'JavaScript/TypeScript': { icon: Code2, color: 'text-[#F0B100]' },
  Algorithms: { icon: Cpu, color: 'text-[#2B7FFF]' },
  'System Design': { icon: Layers, color: 'text-[#AD46FF]' },
  Databases: { icon: Database, color: 'text-[#FF6900]' },
  Architecture: { icon: Server, color: 'text-[#615FFF]' },
  'CSS & HTML': { icon: Globe, color: 'text-[#00B8DB]' },
  Security: { icon: Shield, color: 'text-[#FF2056]' },
  DevOps: { icon: GitBranch, color: 'text-[#00BC7D]' },
  Performance: { icon: Zap, color: 'text-[#FE9A00]' },
  Testing: { icon: CheckCircle2, color: 'text-[#14B8A6]' },
  Concurrency: { icon: BarChart3, color: 'text-[#EC4899]' },
} as const

const gradeConfig: Record<QuestionGrade, { label: string; className: string }> = {
  junior: {
    label: 'Junior',
    className: 'text-success-100 bg-success-50/10 border-success-50/25',
  },
  middle: {
    label: 'Mid-level',
    className: 'text-warning-100 bg-warning-50/10 border-warning-50/25',
  },
  senior: {
    label: 'Senior',
    className: 'text-alert-100 bg-alert-50/10 border-alert-50/25',
  },
}

type CommentItemProps = {
  comment: QuestionComment
  depth?: number
}

const CommentItem = ({ comment, depth = 0 }: CommentItemProps) => {
  const [liked, setLiked] = useState(comment.liked)
  const [likes, setLikes] = useState(comment.likes)
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')

  const handleLike = () => {
    setLiked((value) => !value)
    setLikes((value) => value + (liked ? -1 : 1))
  }

  return (
    <div className={cn(depth > 0 && 'ml-5 mt-4 sm:ml-10')}>
      <div className="flex gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
          <span className="text-xs font-bold text-primary">{comment.avatar}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="body-medium font-semibold text-gray-100">{comment.author}</span>
            <span className="body-small text-gray-60">{comment.time}</span>
          </div>

          <p className="body-medium mb-2 text-gray-60">{comment.text}</p>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleLike}
              aria-pressed={liked}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 text-xs transition-colors',
                liked ? 'text-primary' : 'text-gray-60 hover:text-gray-100',
              )}
            >
              <ThumbsUp size={13} className={cn(liked && 'fill-primary')} />
              {likes}
            </button>

            {depth === 0 && (
              <button
                type="button"
                onClick={() => setShowReply((value) => !value)}
                className="cursor-pointer text-xs text-gray-60 transition-colors hover:text-gray-100"
              >
                Reply
              </button>
            )}

            <button
              type="button"
              aria-label="Report comment"
              title="Report comment"
              className="ml-auto cursor-pointer text-gray-60 transition-colors hover:text-alert-50"
            >
              <Flag size={13} />
            </button>
          </div>

          <AnimatePresence>
            {showReply && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    aria-label="Reply text"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    className="body-medium min-w-0 flex-1 rounded-xl border border-gray-60/30 bg-background px-3 py-2 text-gray-100 outline-none transition-all placeholder:text-gray-60 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  <button
                    type="button"
                    aria-label="Send reply"
                    title="Send reply"
                    disabled={!replyText.trim()}
                    onClick={() => {
                      setReplyText('')
                      setShowReply(false)
                    }}
                    className="flex size-9 cursor-pointer items-center justify-center rounded-xl bg-primary text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {comment.replies?.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      </div>
    </div>
  )
}

export type QuestionDetailProps = {
  question: Question
  comments: QuestionComment[]
  previousQuestion: Question | null
  nextQuestion: Question | null
}

export const QuestionDetail = ({
  question,
  comments: initialComments,
  previousQuestion,
  nextQuestion,
}: QuestionDetailProps) => {
  const [answerOpen, setAnswerOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState(initialComments)
  const [copied, setCopied] = useState(false)

  const domainMeta = domainConfig[question.domain as keyof typeof domainConfig]
  const DomainIcon = domainMeta?.icon ?? Code2
  const grade = gradeConfig[question.grade]

  const handleShare = async () => {
    if (typeof window === 'undefined') return

    try {
      if (navigator.share) {
        await navigator.share({ title: question.text, url: window.location.href })
        return
      }

      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
  }

  const handlePostComment = () => {
    const text = commentText.trim()
    if (!text) return

    setComments((currentComments) => [
      {
        id: Date.now(),
        author: 'You',
        avatar: 'YO',
        time: 'Just now',
        text,
        likes: 0,
        liked: false,
      },
      ...currentComments,
    ])
    setCommentText('')
  }

  return (
    <main className="dashboard-container">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex min-w-0 items-center gap-2">
          <Link
            href="/dashboard/questions"
            className="group flex shrink-0 items-center gap-1.5 text-sm text-gray-60 transition-colors hover:text-gray-100"
          >
            <ArrowLeft
              size={15}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Questions
          </Link>
          <ChevronRight size={13} className="shrink-0 text-gray-60/50" />
          <span className="truncate text-sm text-gray-60">{question.domain}</span>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 rounded-2xl border border-gray-60/30 bg-white p-5 sm:p-8"
        >
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex rounded-md border px-2 py-0.5 font-mono text-xs font-semibold',
                grade.className,
              )}
            >
              {grade.label}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-xs text-gray-60">
              <DomainIcon size={13} className={domainMeta?.color} />
              {question.domain}
            </span>
            <span className="font-mono text-xs text-gray-60/70">· {question.company}</span>
          </div>

          <h1 className="mb-5 text-lg leading-relaxed font-semibold text-gray-100 sm:text-xl">
            {question.text}
          </h1>

          <div className="mb-6 flex flex-wrap gap-2">
            {question.stacks.map((stack) => (
              <span
                key={stack}
                className="rounded-lg border border-gray-60/25 bg-background px-2.5 py-1 font-mono text-xs text-gray-60"
              >
                {stack}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-gray-60/25 pt-5">
            <button
              type="button"
              onClick={() => setSaved((value) => !value)}
              aria-pressed={saved}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all',
                saved
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-gray-60/30 text-gray-60 hover:bg-background hover:text-gray-100',
              )}
            >
              {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              {saved ? 'Saved' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => void handleShare()}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-60/30 px-3 py-2 text-xs font-semibold text-gray-60 transition-all hover:bg-background hover:text-gray-100"
            >
              {copied ? <Copy size={14} /> : <Share2 size={14} />}
              {copied ? 'Copied' : 'Share'}
            </button>
          </div>
        </motion.article>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 overflow-hidden rounded-2xl border border-gray-60/30 bg-white"
        >
          <button
            type="button"
            onClick={() => !question.locked && setAnswerOpen((value) => !value)}
            aria-expanded={question.locked ? true : answerOpen}
            className={cn(
              'flex w-full items-center justify-between px-5 py-4 text-left transition-colors sm:px-6',
              question.locked ? 'cursor-default' : 'cursor-pointer hover:bg-background/70',
            )}
          >
            <span className="flex items-center gap-2">
              {question.locked ? (
                <Lock size={15} className="text-gray-60" />
              ) : (
                <ChevronDown
                  size={15}
                  className={cn(
                    'text-primary transition-transform duration-200',
                    answerOpen && 'rotate-180',
                  )}
                />
              )}
              <span className="text-sm font-semibold text-gray-100">
                {question.locked ? 'Answer - Pro only' : 'Show answer'}
              </span>
            </span>

            {question.locked && (
              <span className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                <Crown size={11} />
                Pro
              </span>
            )}
          </button>

          <AnimatePresence initial={false}>
            {(answerOpen || question.locked) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-60/25 px-5 pb-6 sm:px-6">
                  {question.locked ? (
                    <div className="flex flex-col items-center py-10 text-center">
                      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                        <Crown size={26} className="text-primary" />
                      </div>
                      <p className="mb-1 text-sm font-semibold text-gray-100">
                        This answer is for Pro members
                      </p>
                      <p className="body-small mb-5 max-w-xs text-gray-60">
                        Upgrade to Pro to unlock expert answers to all Senior-level questions
                        and the complete question library.
                      </p>
                      <Link
                        href="/pricing"
                        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:opacity-90 active:scale-95"
                      >
                        Try Pro free for 7 days
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  ) : (
                    <div className="pt-4">
                      {question.answer.includes('\n') ? (
                        <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-gray-60/25 bg-background p-4 font-mono text-xs leading-relaxed text-gray-100">
                          <code>{question.answer}</code>
                        </pre>
                      ) : (
                        <p className="body-medium text-gray-60">{question.answer}</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        <nav aria-label="Question navigation" className="mb-10 grid grid-cols-2 gap-3">
          {previousQuestion ? (
            <Link
              href={`/dashboard/questions/${previousQuestion.slug}`}
              className="group flex min-h-24 flex-col gap-1 rounded-2xl border border-gray-60/30 bg-white p-4 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <span className="flex items-center gap-1 text-xs text-gray-60">
                <ArrowLeft size={11} />
                Previous
              </span>
              <span className="line-clamp-2 text-xs font-medium text-gray-100 transition-colors group-hover:text-primary">
                {previousQuestion.text}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {nextQuestion ? (
            <Link
              href={`/dashboard/questions/${nextQuestion.slug}`}
              className="group flex min-h-24 flex-col gap-1 rounded-2xl border border-gray-60/30 bg-white p-4 text-right transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <span className="flex items-center justify-end gap-1 text-xs text-gray-60">
                Next
                <ChevronRight size={11} />
              </span>
              <span className="line-clamp-2 text-xs font-medium text-gray-100 transition-colors group-hover:text-primary">
                {nextQuestion.text}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </nav>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="pb-4"
        >
          <div className="mb-6 flex items-center gap-2">
            <MessageSquare size={17} className="text-primary" />
            <h2 className="text-base font-bold text-gray-100">Discussion</h2>
            <span className="ml-1 font-mono text-xs text-gray-60">
              {comments.length} comments
            </span>
          </div>

          <div className="mb-8 flex gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
              <span className="text-xs font-bold text-primary">YO</span>
            </div>
            <div className="min-w-0 flex-1">
              <textarea
                aria-label="New comment"
                placeholder="Share your experience, tips, or ask a question..."
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                rows={3}
                className="body-medium w-full resize-none rounded-xl border border-gray-60/30 bg-white px-4 py-3 text-gray-100 outline-none transition-all placeholder:text-gray-60 focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handlePostComment}
                  disabled={!commentText.trim()}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={13} />
                  Post comment
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  )
}
