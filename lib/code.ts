import crypto from "crypto";

const LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function nieuweCode() {
  return Array.from({ length: 6 }, () => LETTERS[crypto.randomInt(LETTERS.length)]).join("");
}
