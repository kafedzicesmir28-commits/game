# The Treasure of Our Story

A romantic browser adventure game — a gift experience built with React, TypeScript, Vite, Tailwind, Framer Motion, and Canvas Confetti.

## Quick Start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`) on your phone or desktop.

## Customize Everything (No Code Changes)

Edit **`src/config/gameContent.json`** to change:

- Opening lines and treasure messages
- All questions, answers, hints, and secret codes
- Boss battle questions
- Future dreams questions
- Romantic messages
- Map labels and story text
- Final love letter (`meta.finalMessage`)
- Audio file paths

## Photos

Add your photos to these folders (replace the placeholder SVGs):

| Folder | Used in |
|--------|---------|
| `public/photos/first-date/` | First Date location |
| `public/photos/memory-puzzle/` | Memory Puzzle (drag-and-drop) |
| `public/photos/favorite-moments/` | Favorite Moments |

Update filenames in `gameContent.json` → `photoOrder` arrays to match your files.

Supported formats: `.jpg`, `.png`, `.webp`, `.svg`

## Audio (Optional)

Replace placeholder paths in `gameContent.json` → `audio`:

| File | Purpose |
|------|---------|
| `public/audio/background.mp3` | Background music |
| `public/audio/unlock.mp3` | Location unlocked |
| `public/audio/key-collected.mp3` | Key obtained |
| `public/audio/correct.mp3` | Correct answer |
| `public/audio/wrong.mp3` | Wrong answer |
| `public/audio/treasure.mp3` | Treasure opened |

Toggle music and SFX from the map screen (top-right icons).

## Save System

Progress is saved automatically in **localStorage**. Completed levels, unlocked locations, and collected keys persist if the browser is closed.

Use **Play Again** on the treasure screen to reset progress.

## Build for Production

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, etc.).

## Game Flow

1. **Opening Scene** → Start Adventure
2. **World Map** → Tap locations to travel (only unlocked ones open)
3. **10 Locations** → Story + challenge + golden key reward
4. **Treasure Chamber** → Open the chest for the final message and confetti
