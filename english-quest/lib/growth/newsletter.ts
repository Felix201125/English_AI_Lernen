export type NewsletterSubscriber = {
  email: string;
  confirmed: boolean;
  confirmToken?: string;
  list: "news" | "teacher_pack";
};

export function isListed(
  subs: NewsletterSubscriber[],
  email: string,
  list: NewsletterSubscriber["list"]
): boolean {
  return subs.some(
    (s) =>
      s.email === email.toLowerCase() && s.list === list && s.confirmed
  );
}

export function confirmSubscriber(
  subs: NewsletterSubscriber[],
  token: string
): NewsletterSubscriber[] {
  return subs.map((s) =>
    s.confirmToken === token ? { ...s, confirmed: true, confirmToken: undefined } : s
  );
}
