// Mock fetch API: intercepts GET /api/names?q=<query> and returns a hardcoded
// list of names whose text contains the query (case-insensitive).
// An empty or missing query returns every name.

export const NAMES = [
  'Aarav Sharma',
  'Aditi Rao',
  'Aisha Khan',
  'Alice Johnson',
  'Amit Patel',
  'Ananya Iyer',
  'Bob Smith',
  'Charlie Brown',
  'Diana Prince',
  'Elena Garcia',
  'Farhan Ali',
  'Grace Lee',
  'Hiro Tanaka',
  'Isabella Rossi',
  'Karthik Nair',
  'Liam O’Connor',
  'Meera Joshi',
  'Noah Williams',
  'Priya Singh',
  'Rohan Mehta',
  'Aaliyah Brooks',
  'Abdul Rahman',
  'Adrian Novak',
  'Akira Yamamoto',
  'Alejandro Torres',
  'Alexander Petrov',
  'Amara Okafor',
  'Anika Das',
  'Arjun Reddy',
  'Beatrice Dubois',
  'Benjamin Clark',
  'Camila Fernandez',
  'Carlos Mendoza',
  'Chen Wei',
  'Chloe Martin',
  'Daniel Kim',
  'David Cohen',
  'Deepak Verma',
  'Elijah Turner',
  'Emma Wilson',
  'Fatima Zahra',
  'Felix Bauer',
  'Gabriel Santos',
  'Hannah Schmidt',
  'Harper Davis',
  'Ibrahim Hassan',
  'Ishaan Kapoor',
  'Isla Murphy',
  'Jack Thompson',
  'Jasmine Ahmed',
  'Javier Morales',
  'Kavya Menon',
  'Kenji Sato',
  'Kiara Malhotra',
  'Lakshmi Pillai',
  'Leila Haddad',
  'Lucas Silva',
  'Mateo Rivera',
  'Maya Krishnan',
  'Mei Lin',
  'Mohammed Siddiqui',
  'Nadia Petrova',
  'Naveen Kumar',
  'Nina Johansson',
  'Olivia Taylor',
  'Omar Farooq',
  'Pooja Bhatt',
  'Rahul Gupta',
  'Riya Desai',
  'Sakura Ito',
  'Samuel Adeyemi',
  'Sara Lindqvist',
  'Sofia Martinez',
  'Tanvi Kulkarni',
  'Thomas Anderson',
  'Vikram Choudhury',
  'Yuki Nakamura',
  'Zara Sheikh',
  'Zoe Campbell',
  "Gabriel Hernandez",
  "Gabriela Silva",
  "Giovanni Rossi",
  "Grace Thompson",
]

const MOCK_DELAY_MS = 300

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const sleep = (ms: number, signal?: AbortSignal | null) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'))
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })

export function installMockFetch() {
  const realFetch = window.fetch.bind(window)

  window.fetch = async (input, init) => {
    const url = new URL(
      input instanceof Request ? input.url : String(input),
      window.location.origin,
    )
    const method = (
      init?.method ?? (input instanceof Request ? input.method : 'GET')
    ).toUpperCase()

    if (url.pathname !== '/api/names' || method !== 'GET') {
      return realFetch(input, init)
    }

    await sleep(MOCK_DELAY_MS, init?.signal)

    const query = (url.searchParams.get('q') ?? '').trim().toLowerCase()
    const names = NAMES.filter((name) => name.toLowerCase().includes(query))

    return jsonResponse({ query, names })
  }
}
