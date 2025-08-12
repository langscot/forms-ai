export async function validateTurnstile(token: string) {
  const response = await fetch(`https://challenges.cloudflare.com/turnstile/v0/siteverify`, {
    method: 'POST',
    body: JSON.stringify({
      secret: process.env.CF_SECRET_KEY,
      response: token,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json() as Promise<{ success: boolean }>;
}