import { QuestionsProps } from '@/components/organisms/Questions'

export const getHomePageData = () => {
  const QUESTIONS_DATA = {
    questions: [
      {
        index: 1,
        level: 'Junior',
        company: 'Meta',
        technologies: ['JavaScript', 'TypeScript'],
        category: {
          name: 'JavaScript/TypeScript',
          theme: '#F0B100',
        },
        question:
          'Explain the difference between let, const, and var in JavaScript. What problems does each one solve?',
        answer:
          'var has function scope and is hoisted to the top of its function. let and const have block scope. const prevents reassignment but not mutation of objects. Use const by default, let when you need to reassign, and avoid var in modern code — its hoisting behaviour causes subtle bugs.',
      },
      {
        index: 2,
        level: 'Regular',
        company: 'Kaspersky',
        technologies: ['JavaScript', 'Node.js'],
        category: {
          name: 'Security',
          theme: '#FF2056',
        },
        question: 'What are XSS and CSRF attacks? How do you defend against each?',
        answer:
          'Cross-Site Scripting (XSS) injects malicious scripts into trusted websites. Defend using strict input sanitization, escaping output, and setting Content Security Policy (CSP) headers. Cross-Site Request Forgery (CSRF) tricks users into executing unwanted actions. Defend using Anti-CSRF tokens (SameSite cookies) and validating origin headers.',
      },
      {
        index: 3,
        level: 'Senior',
        technologies: ['CSS', 'HTML'],
        category: {
          name: 'CSS & HTML',
          theme: '#00B8DB',
        },
        question: 'What is the difference between CSS Grid and Flexbox? When should you use each?',
        answer:
          'Flexbox is designed for one-dimensional layouts (either a row OR a column) and aligns content from the inside out. CSS Grid is for two-dimensional layouts (rows AND columns simultaneously) and aligns content from the layout structure down. Use Flexbox for small components/aligning text, and Grid for complete page structures.',
      },
      {
        index: 4,
        level: 'Junior',
        company: 'Google',
        technologies: ['Algorithms', 'Python'],
        category: {
          name: 'Algorithms',
          theme: '#2B7FFF',
        },
        question:
          'What is the difference between Bubble Sort and Quick Sort in terms of Time Complexity?',
        answer:
          'Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them, leading to a Time Complexity of O(n²) in average and worst cases. Quick Sort uses a divide-and-conquer approach, partitioning arrays around a pivot element, giving an average Time Complexity of O(n log n).',
      },
      {
        index: 5,
        level: 'Regular',
        company: 'Amazon',
        technologies: ['SQL', 'PostgreSQL'],
        category: {
          name: 'Databases',
          theme: '#FF6900',
        },
        question:
          'What is a Database Index, and how does it speed up queries? Are there any downsides?',
        answer:
          'An index is a data structure (often a B-Tree) that improves data retrieval speeds by pointing directly to data locations without scanning every row. The downside is that indexes occupy additional disk space and slow down write operations (INSERT, UPDATE, DELETE) because the index structure must be updated.',
      },
      {
        index: 6,
        level: 'Senior',
        company: 'Netflix',
        technologies: ['Node.js', 'Redis'],
        category: {
          name: 'Performance',
          theme: '#FE9A00',
        },
        question:
          'Describe how vertical scaling differs from horizontal scaling. When should you choose which?',
        answer:
          'Vertical scaling (Scale Up) means adding more power (CPU, RAM) to an existing server, which has a hard physical limit and causes a single point of failure. Horizontal scaling (Scale Out) means adding more servers to the pool and distributing load via a Load Balancer, which offers high availability and infinite scale but increases architectural complexity.',
      },
      {
        index: 7,
        level: 'Junior',
        technologies: ['JavaScript', 'Testing'],
        category: {
          name: 'Testing',
          theme: '#00BBA7',
        },
        question: 'What is the difference between Unit Testing and Integration Testing?',
        answer:
          'Unit testing focuses on isolated code parts (e.g., a single function or component) and uses mocks for external dependencies. Integration testing verifies that multiple parts of the application work together correctly, such as a component interacting with a real database or an external API client.',
      },
      {
        index: 8,
        level: 'Regular',
        company: 'Microsoft',
        technologies: ['TypeScript', 'Design Patterns'],
        category: {
          name: 'Architecture',
          theme: '#615FFF',
        },
        question: 'What is the Dependency Inversion Principle (DIP) in SOLID?',
        answer:
          'DIP states that high-level modules should not depend on low-level modules; both should depend on abstractions (interfaces). Secondly, abstractions should not depend on details; details should depend on abstractions. It reduces direct coupling and makes systems much easier to refactor.',
      },
      {
        index: 9,
        level: 'Senior',
        company: 'Uber',
        technologies: ['Node.js', 'Kafka'],
        category: {
          name: 'Concurrency',
          theme: '#F6339A',
        },
        question: 'How does Node.js handle concurrency given that it operates on a single thread?',
        answer:
          'Node.js uses the Event Loop mechanism backed by non-blocking, asynchronous I/O operations. When an asynchronous operation (like reading a file or making an API request) is triggered, Node offloads it to the system kernel or the internal thread pool (libuv) and continues executing other JS code. When ready, the callback is pushed back to the main thread.',
      },
      {
        index: 10,
        level: 'Junior',
        technologies: ['CSS', 'Responsive Design'],
        category: {
          name: 'CSS & HTML',
          theme: '#00B8DB',
        },
        question: 'What is the difference between em and rem units in CSS?',
        answer:
          'The rem unit calculates its size based on the root html element font size (usually 16px by default). The em unit is relative to the font-size of its immediate parent element. rem provides much better predictability and consistency across responsive layouts.',
      },
      {
        index: 11,
        level: 'Regular',
        company: 'Spotify',
        technologies: ['TypeScript'],
        category: {
          name: 'JavaScript/TypeScript',
          theme: '#F0B100',
        },
        question: 'What is the difference between an Interface and a Type Alias in TypeScript?',
        answer:
          'Interfaces can be merged through declaration merging (re-declaring adding new fields) and are strictly for defining object shapes. Type Aliases are more versatile; they can define primitives, unions, tuples, and intersections but cannot be reopened to add new properties natively.',
      },
      {
        index: 12,
        level: 'Senior',
        company: 'AirBnb',
        technologies: ['System Design', 'GraphQL'],
        category: {
          name: 'SystemDesign',
          theme: '#AD46FF',
        },
        question: 'What is the CAP Theorem in distributed databases?',
        answer:
          'The CAP Theorem states that a distributed system can guarantee at most two out of three features simultaneously: Consistency (every read gets the newest write or an error), Availability (every non-failing node returns a response), and Partition Tolerance (the system operates despite network failures).',
      },
      {
        index: 13,
        level: 'Junior',
        technologies: ['SQL'],
        category: {
          name: 'Databases',
          theme: '#FF6900',
        },
        question: 'What is the difference between WHERE and HAVING clauses in SQL?',
        answer:
          'The WHERE clause filters rows before any groupings are made or aggregate functions are calculated. The HAVING clause filters data after group aggregation (used together with GROUP BY) based on aggregate conditions like COUNT() or SUM().',
      },
      {
        index: 14,
        level: 'Regular',
        company: 'Stripe',
        technologies: ['Security', 'Cryptography'],
        category: {
          name: 'Security',
          theme: '#FF2056',
        },
        question: 'What is the purpose of salting passwords before hashing them?',
        answer:
          'A salt is a random string added to the password before passing it into a hash function. It prevents attackers from using precomputed dictionary tables (Rainbow Tables) to reverse hashes, ensuring that two users with identical passwords end up with completely different hashes.',
      },
      {
        index: 15,
        level: 'Senior',
        company: 'Apple',
        technologies: ['Architecture', 'Microservices'],
        category: {
          name: 'Architecture',
          theme: '#615FFF',
        },
        question: 'What is the Saga Pattern in microservices and what problem does it solve?',
        answer:
          'The Saga Pattern manages distributed transactions across multiple independent microservices. Instead of a global lock, it executes a sequence of local transactions. If one transaction fails, the Saga runs fallback compensating transactions to roll back changes made by previous services.',
      },
      {
        index: 16,
        level: 'Junior',
        technologies: ['JavaScript'],
        category: {
          name: 'JavaScript/TypeScript',
          theme: '#F0B100',
        },
        question: 'What is a Closure in JavaScript? Give a brief example.',
        answer:
          'A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). In other words, a closure gives an inner function access to the outer function’s scope even after the outer function has finished executing.',
      },
      {
        index: 17,
        level: 'Regular',
        technologies: ['Docker', 'CI/CD'],
        category: {
          name: 'DevOps',
          theme: '#00BC7D',
        },
        question: 'What is the difference between a Docker Image and a Docker Container?',
        answer:
          'A Docker Image is a read-only blueprint containing the source code, libraries, dependencies, and tools required to run an application. A Docker Container is a live, runnable instance of that image, isolated from the host machine, which can be started, stopped, and modified.',
      },
      {
        index: 18,
        level: 'Senior',
        company: 'Meta',
        technologies: ['React', 'Performance'],
        category: {
          name: 'Performance',
          theme: '#FE9A00',
        },
        question: 'How does React’s Virtual DOM reconciliation mechanism work?',
        answer:
          'When state changes, React builds a new Virtual DOM tree and compares it with a snapshot of the previous tree using a diffing algorithm. It identifies the exact nodes that changed and batches those updates to the real DOM (commit phase), preventing expensive full-page layout repaints.',
      },
      {
        index: 19,
        level: 'Junior',
        technologies: ['Git'],
        category: {
          name: 'Terminal',
          theme: '#00B8DB',
        },
        question: 'What is the difference between git merge and git rebase?',
        answer:
          'git merge ties two branching histories together with a new merge commit, preserving the exact chronological order of work. git rebase rewrites history by moving the entire branch base to the tip of the target branch, resulting in a cleaner, completely linear commit history graph.',
      },
      {
        index: 20,
        level: 'Regular',
        company: 'Vercel',
        technologies: ['Next.js', 'System Design'],
        category: {
          name: 'SystemDesign',
          theme: '#AD46FF',
        },
        question:
          'What is the difference between SSR (Server-Side Rendering) and SSG (Static Site Generation)?',
        answer:
          'SSG generates the HTML file at build time, caching it for instant distribution via a CDN. SSR generates HTML dynamically on the server upon every request. Use SSG for blogs or marketing pages, and SSR for secure dashboards with highly dynamic user data.',
      },
    ],
    questionsCount: 20,
  } satisfies QuestionsProps

  return { QUESTIONS_DATA }
}
