/**
 * Input validation helpers for enterprise data integrity
 */

export const isValidEmail = (email: string): boolean => {
  if (!email || !email.trim()) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

export const isValidPhone = (phone: string): boolean => {
  if (!phone || !phone.trim()) return false;
  // Allows optional +, digits, spaces, hyphens, min 7 digits, max 15 digits
  const cleaned = phone.replace(/[\s-]/g, "");
  const regex = /^\+?[0-9]{7,15}$/;
  return regex.test(cleaned);
};

export const isValidCompanyCode = (code: string): boolean => {
  if (!code || !code.trim()) return false;
  // 2 to 12 alphanumeric characters, no spaces
  const regex = /^[A-Za-z0-9_-]{2,12}$/;
  return regex.test(code.trim());
};

export const isValidUrl = (url: string): boolean => {
  if (!url || !url.trim()) return false;
  const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
  return regex.test(url.trim());
};

export const isValidName = (name: string): boolean => {
  if (!name || !name.trim()) return false;
  // At least 2 characters, allows letters, spaces, dots, hyphens
  return name.trim().length >= 2;
};

export const isValidPassword = (password: string): { valid: boolean; message?: string } => {
  if (!password) {
    return { valid: false, message: "Password is required." };
  }
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters long." };
  }
  return { valid: true };
};
