import crypto from "crypto";

const SECRET = process.env.CAPTCHA_SECRET || crypto.randomBytes(32).toString("hex");

interface CaptchaResult {
  problem: string;
  token: string;
}

export function generateCaptcha(): CaptchaResult {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const answer = a + b;
  const problem = `${a} + ${b} = ?`;

  const data = `${answer}|${Date.now() + 5 * 60 * 1000}`; // 5 min expiry
  const hmac = crypto.createHmac("sha256", SECRET).update(data).digest("hex");
  const token = Buffer.from(`${data}:${hmac}`).toString("base64url");

  return { problem, token };
}

export function verifyCaptcha(userAnswer: string, token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon === -1) return false;

    const data = decoded.slice(0, lastColon);
    const hmac = decoded.slice(lastColon + 1);

    const expectedHmac = crypto
      .createHmac("sha256", SECRET)
      .update(data)
      .digest("hex");
    if (hmac !== expectedHmac) return false;

    const [answerStr, expiryStr] = data.split("|");
    const expiry = parseInt(expiryStr, 10);
    if (Date.now() > expiry) return false;

    return parseInt(userAnswer, 10) === parseInt(answerStr, 10);
  } catch {
    return false;
  }
}
