const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailError(email: string) {
  const value = email.trim();
  if (!value) return 'Introduz o teu email.';
  if (!emailPattern.test(value)) return 'Introduz um email válido.';
  return undefined;
}
