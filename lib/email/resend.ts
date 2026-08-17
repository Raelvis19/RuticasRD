import "server-only";

export interface TransactionalEmailResult {
  sent: boolean;
  reason?: "not_configured" | "provider_error";
}

interface TransactionalEmailInput {
  idempotencyKey: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

const RESEND_EMAILS_ENDPOINT = "https://api.resend.com/emails";

export async function sendTransactionalEmail(
  input: TransactionalEmailInput,
): Promise<TransactionalEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    console.error(
      `[email] RESEND_API_KEY is not configured; ${input.idempotencyKey} was not sent.`,
    );
    return { sent: false, reason: "not_configured" };
  }

  const from =
    process.env.RESERVATION_EMAIL_FROM?.trim() ||
    "Ruticas RD <no-responder@ruticasrd.com>";

  try {
    const response = await fetch(RESEND_EMAILS_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": input.idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    if (!response.ok) {
      const providerMessage = await response.text();
      console.error(
        `[email] Resend rejected ${input.idempotencyKey} with status ${response.status}: ${providerMessage}`,
      );
      return { sent: false, reason: "provider_error" };
    }

    return { sent: true };
  } catch (error) {
    console.error(`[email] Could not send ${input.idempotencyKey}:`, error);
    return { sent: false, reason: "provider_error" };
  }
}
