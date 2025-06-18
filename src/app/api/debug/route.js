// Endpoint de debugging ultra simple
export async function GET() {
  return new Response('API WORKING!', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

export async function POST() {
  return new Response('POST API WORKING!', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
