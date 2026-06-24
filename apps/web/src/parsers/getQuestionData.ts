export type QuestionGrade = 'junior' | 'middle' | 'senior'

export type Question = {
  id: number
  slug: string
  text: string
  answer: string
  grade: QuestionGrade
  domain: string
  company: string
  stacks: string[]
  locked: boolean
}

export type QuestionComment = {
  id: number
  author: string
  avatar: string
  time: string
  text: string
  likes: number
  liked: boolean
  replies?: QuestionComment[]
}

const QUESTIONS_DATA: Question[] = [
  {
    id: 1,
    slug: 'event-delegation',
    text: 'Explain event delegation in JavaScript. What problem does it solve?',
    answer:
      'Event delegation uses a single event listener on a parent element to handle events from its descendants. Because DOM events bubble, the handler can inspect event.target and react to matching children. It reduces the number of listeners and also works for elements added dynamically.',
    grade: 'junior',
    domain: 'JavaScript/TypeScript',
    company: 'Tinkoff',
    stacks: ['JavaScript', 'TypeScript'],
    locked: false,
  },
  {
    id: 2,
    slug: 'node-event-loop',
    text: 'What is the Event Loop in Node.js and how does it relate to libuv?',
    answer:
      'The Event Loop enables non-blocking I/O. libuv provides the loop implementation and a worker pool for operations such as file I/O and DNS. The loop moves through timers, pending callbacks, poll, check, and close callback phases while microtasks are processed between callbacks.',
    grade: 'middle',
    domain: 'JavaScript/TypeScript',
    company: 'Yandex',
    stacks: ['Node.js', 'JavaScript'],
    locked: false,
  },
  {
    id: 3,
    slug: 'sql-joins',
    text: 'What is the difference between SQL JOIN types?',
    answer:
      'INNER JOIN returns rows that match in both tables. LEFT JOIN keeps every row from the left table and fills missing right-side values with NULL. RIGHT JOIN does the inverse. FULL OUTER JOIN keeps unmatched rows from both tables. CROSS JOIN returns the Cartesian product.',
    grade: 'middle',
    domain: 'Databases',
    company: 'Avito',
    stacks: ['PostgreSQL', 'SQL'],
    locked: false,
  },
  {
    id: 4,
    slug: 'react-reconciliation',
    text: 'Explain the Virtual DOM in React. How does the Reconciliation algorithm work?',
    answer:
      'The Virtual DOM is a lightweight object representation of the UI. During reconciliation React compares the previous and next trees, uses element types and keys to identify reusable work, and commits only the required DOM changes. Fiber makes rendering interruptible and allows React to prioritize updates.',
    grade: 'middle',
    domain: 'JavaScript/TypeScript',
    company: 'Meta',
    stacks: ['React', 'JavaScript'],
    locked: false,
  },
  {
    id: 5,
    slug: 'push-notification-system',
    text: 'Design a push notification system for 100 million users with a 99.99% SLA.',
    answer:
      'Partition durable queues by user or tenant, process them with horizontally scaled workers, and keep provider-specific delivery adapters isolated. Use idempotency keys, retry queues with exponential backoff, per-provider circuit breakers, rate limiting, delivery tracking, and active-active regional failover.',
    grade: 'senior',
    domain: 'System Design',
    company: 'Google',
    stacks: ['Kafka', 'Kubernetes', 'Redis', 'AWS'],
    locked: true,
  },
  {
    id: 6,
    slug: 'cap-theorem',
    text: 'Describe the CAP theorem with practical examples.',
    answer:
      'When a network partition occurs, a distributed system must choose between consistency and availability. A CP system may reject requests until replicas agree, while an AP system continues serving requests and reconciles divergent state later. The trade-off only becomes unavoidable during a partition.',
    grade: 'senior',
    domain: 'System Design',
    company: 'Amazon',
    stacks: ['Distributed Systems', 'Redis'],
    locked: true,
  },
  {
    id: 7,
    slug: 'postgresql-indexes',
    text: 'How does indexing work in PostgreSQL? What is the difference between B-tree and GIN indexes?',
    answer:
      'B-tree is the default index type and is efficient for equality, ordering, and range predicates. GIN is an inverted index suited to values containing multiple searchable elements, such as arrays, JSONB, and full-text vectors. The correct index depends on the operators used by the query.',
    grade: 'middle',
    domain: 'Databases',
    company: 'Avito',
    stacks: ['PostgreSQL'],
    locked: false,
  },
  {
    id: 8,
    slug: 'typescript-debounce',
    text: 'Implement a debounce function in TypeScript with support for an immediate-call option.',
    answer: `function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  delay: number,
  immediate = false,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined

  return (...args) => {
    const callNow = immediate && timer === undefined

    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      if (!immediate) fn(...args)
    }, delay)

    if (callNow) fn(...args)
  }
}`,
    grade: 'junior',
    domain: 'JavaScript/TypeScript',
    company: 'Avito',
    stacks: ['JavaScript', 'TypeScript'],
    locked: false,
  },
  {
    id: 9,
    slug: 'java-garbage-collection',
    text: 'How does the Garbage Collector work in Java? Describe the G1GC and ZGC algorithms.',
    answer:
      'G1 divides the heap into regions and collects them incrementally to meet pause-time targets. ZGC uses colored pointers, load barriers, and concurrent phases to keep pauses very short even with large heaps. The trade-off is additional CPU and memory overhead.',
    grade: 'senior',
    domain: 'Architecture',
    company: 'Google',
    stacks: ['Java'],
    locked: true,
  },
  {
    id: 10,
    slug: 'react-memoization-hooks',
    text: 'What is the difference between useMemo and useCallback in React?',
    answer:
      'useMemo caches the result of a calculation, while useCallback caches a function reference. Both should be used when referential stability or an expensive calculation has a measurable impact, not as a default around every value or handler.',
    grade: 'junior',
    domain: 'JavaScript/TypeScript',
    company: 'Wildberries',
    stacks: ['React', 'TypeScript'],
    locked: false,
  },
  {
    id: 11,
    slug: 'solid-principles',
    text: 'What are the SOLID principles? Give a concrete example of violating each one.',
    answer:
      'SOLID covers single responsibility, open/closed design, Liskov substitution, interface segregation, and dependency inversion. A good answer should explain each principle through a concrete design failure and the refactoring that removes it.',
    grade: 'middle',
    domain: 'Architecture',
    company: 'JetBrains',
    stacks: ['Java', 'Python', 'TypeScript'],
    locked: false,
  },
  {
    id: 12,
    slug: 'distributed-rate-limiting',
    text: 'How would you implement distributed rate limiting without a single point of failure?',
    answer:
      'Use a token bucket or sliding-window algorithm with atomic operations in a replicated data store. Partition keys consistently, define behavior during partial failures, and accept that strict global limits require coordination while highly available limits may temporarily drift.',
    grade: 'senior',
    domain: 'System Design',
    company: 'Amazon',
    stacks: ['Redis', 'Node.js', 'Go'],
    locked: true,
  },
  {
    id: 13,
    slug: 'css-grid-vs-flexbox',
    text: 'What is the difference between CSS Grid and Flexbox? When should you use each?',
    answer:
      'Flexbox is optimized for one-dimensional layout along a row or column. Grid controls rows and columns together. Use Flexbox for component-level alignment and Grid when the layout relationship spans both dimensions.',
    grade: 'junior',
    domain: 'CSS & HTML',
    company: 'Tinkoff',
    stacks: ['CSS', 'HTML'],
    locked: false,
  },
  {
    id: 14,
    slug: 'go-concurrency',
    text: 'How do goroutines and channels work in Go? How do they differ from OS threads?',
    answer:
      'Goroutines are lightweight tasks multiplexed by the Go runtime over OS threads. Channels provide typed communication and synchronization. Their small growing stacks and runtime scheduler make large numbers practical, but blocking and shared-state problems still require careful design.',
    grade: 'middle',
    domain: 'Concurrency',
    company: 'Google',
    stacks: ['Go'],
    locked: true,
  },
  {
    id: 15,
    slug: 'xss-and-csrf',
    text: 'What are XSS and CSRF attacks? How do you defend against each?',
    answer:
      'Prevent XSS with contextual output escaping, safe rendering APIs, sanitization where HTML is allowed, and a restrictive CSP. Prevent CSRF with SameSite cookies, anti-CSRF tokens, and origin checks for state-changing requests.',
    grade: 'junior',
    domain: 'Security',
    company: 'Kaspersky',
    stacks: ['JavaScript', 'Node.js'],
    locked: false,
  },
  {
    id: 16,
    slug: 'cqrs-event-sourcing',
    text: 'Explain CQRS and Event Sourcing. When is their added complexity justified?',
    answer:
      'CQRS separates write and read models. Event Sourcing persists domain events instead of only the latest state. They can help with complex domains, auditability, and independent scaling, but introduce eventual consistency, projection maintenance, and operational overhead.',
    grade: 'senior',
    domain: 'Architecture',
    company: 'Microsoft',
    stacks: ['Java', 'Node.js'],
    locked: true,
  },
  {
    id: 17,
    slug: 'kubernetes-cicd',
    text: 'How do you set up a CI/CD pipeline for a Docker application on Kubernetes?',
    answer:
      'Run linting and tests, build an immutable image, scan it, push it to a registry, and deploy through versioned manifests or Helm. Use readiness probes, rolling updates, automatic rollback, and an external secret-management system.',
    grade: 'middle',
    domain: 'DevOps',
    company: '2GIS',
    stacks: ['Docker', 'Kubernetes', 'AWS'],
    locked: false,
  },
  {
    id: 18,
    slug: 'merge-sort-complexity',
    text: 'What is time complexity? Explain O(n log n) using Merge Sort as an example.',
    answer:
      'Merge Sort creates log n levels by repeatedly splitting the input in half. Every level processes n elements while merging, so the total running time is O(n log n). Its typical array implementation also requires O(n) auxiliary space.',
    grade: 'junior',
    domain: 'Algorithms',
    company: 'Yandex',
    stacks: ['JavaScript', 'Python', 'Java'],
    locked: false,
  },
]

const COMMENTS_DATA: QuestionComment[] = [
  {
    id: 1,
    author: 'Marek W.',
    avatar: 'MW',
    time: '2 days ago',
    text: 'A strong interview answer should include one concrete example and explain what happens when the matching child is added after the listener was registered.',
    likes: 14,
    liked: false,
    replies: [
      {
        id: 11,
        author: 'Anna K.',
        avatar: 'AK',
        time: '1 day ago',
        text: 'Agreed. It is also worth mentioning event.target versus event.currentTarget because that is a common follow-up question.',
        likes: 7,
        liked: false,
      },
    ],
  },
  {
    id: 2,
    author: 'Piotr S.',
    avatar: 'PS',
    time: '5 days ago',
    text: 'Remember that not every event bubbles. Calling that out shows that you understand the limits of the pattern instead of only memorising the definition.',
    likes: 9,
    liked: false,
  },
  {
    id: 3,
    author: 'Julia R.',
    avatar: 'JR',
    time: '1 week ago',
    text: 'For React interviews I would connect this concept to the synthetic event system, but keep the initial answer focused on native DOM behaviour.',
    likes: 22,
    liked: false,
  },
]

export const getQuestionData = (questionId: string) => {
  const numericId = Number(questionId)
  const question = QUESTIONS_DATA.find(
    (item) => item.slug === questionId || (!Number.isNaN(numericId) && item.id === numericId),
  )

  if (!question) return null

  const currentIndex = QUESTIONS_DATA.findIndex((item) => item.id === question.id)

  return {
    question,
    comments: COMMENTS_DATA,
    previousQuestion: QUESTIONS_DATA[currentIndex - 1] ?? null,
    nextQuestion: QUESTIONS_DATA[currentIndex + 1] ?? null,
  }
}

export const getQuestionSlugs = () => QUESTIONS_DATA.map(({ slug }) => slug)

export const getQuestionsData = () => QUESTIONS_DATA
