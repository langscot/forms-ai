export async function validateTurnstile(token: string) {
  const response = await fetch(`https://challenges.cloudflare.com/turnstile/v0/siteverify`, {
    method: 'POST',
    body: JSON.stringify({
      secret: process.env.NEXT_PUBLIC_CF_SECRET_KEY,
      response: token,
    }),
  });

  return response.json() as Promise<{ success: boolean }>;
}