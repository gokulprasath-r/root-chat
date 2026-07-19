// Deterministic avatar colour from a string (username), so the same person always
// gets the same colour. Palette leans on the brand's earthy tones.
const PALETTE = ["#6F4E37", "#6B8E23", "#8B5E3C", "#4a7c59", "#a0632d", "#5f6b2e", "#7a5a3f"];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0; // keep it a 32-bit int
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
