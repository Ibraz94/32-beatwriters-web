export async function GET() {
  const res = await fetch('https://tools.32beatwriters.com/api/playerProps');
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
