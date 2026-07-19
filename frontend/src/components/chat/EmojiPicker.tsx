"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import categories from "./emojiData.json";

// Apple emoji PNGs (Telegram-style) generated from emoji-datasource-apple and
// served from /public/emoji/apple/64.
const BASE = "/emoji/apple/64";

// "1f600.png" -> the actual emoji character, so we can insert it into the input.
function toChar(file: string): string {
  return file
    .replace(".png", "")
    .split("-")
    .map((hex) => String.fromCodePoint(parseInt(hex, 16)))
    .join("");
}

export default function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [cat, setCat] = useState(0);
  const category = categories[cat];

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl lg:w-[340px]">
      {/* Emoji grid for the active category. Cells fill the width (bigger tap
          targets on mobile); the emoji image stays a consistent size. */}
      <div className="grid max-h-60 grid-cols-8 gap-0.5 overflow-y-auto p-2">
        {category.emojis.map((file) => (
          <button
            key={file}
            type="button"
            onClick={() => onSelect(toChar(file))}
            className="flex aspect-square w-full items-center justify-center rounded-lg hover:bg-black/5"
          >
            <img src={`${BASE}/${file}`} alt="" loading="lazy" className="h-7 w-7" />
          </button>
        ))}
      </div>

      {/* Category tabs (Telegram keeps these at the bottom). */}
      <div className="flex items-center justify-between border-t border-black/5 px-2 py-1.5">
        {categories.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(i)}
            aria-label={c.id}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              cat === i ? "bg-root-primary/10" : "hover:bg-black/5"
            }`}
          >
            <img src={`${BASE}/${c.icon}`} alt="" className="h-6 w-6" />
          </button>
        ))}
      </div>
    </div>
  );
}
