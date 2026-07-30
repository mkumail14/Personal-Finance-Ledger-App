import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount) {
  const num = Number(amount) || 0;
  return `Rs ${num.toLocaleString('en-PK')}`;
}
