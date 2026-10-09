# Leitner Flow

A spaced repetition flashcard application built with Next.js, SQLite, and vanilla CSS. The application implements the Leitner 3-box method to schedule review intervals based on recall performance.

---

## Overview

The application organizes study material into three distinct boxes corresponding to review frequency:

- **Box 1 (Daily)**: All new cards start here. Reviewed once every day.
  - Correct answer: Promotes the card to Box 2.
  - Incorrect answer: Card remains in Box 1 for reinforcement.
- **Box 2 (Weekly)**: Scheduled for review on Sundays.
  - A "Practice Anytime" toggle is available in the menu for unconstrained weekday review.
  - Correct answer: Promotes the card to Box 3.
  - Incorrect answer: Demotes the card back to Box 1.
- **Box 3 (Monthly)**: Long-term retention box. Cards remain here for monthly maintenance reviews unless deleted.
  - Correct answer: Retained in Box 3 with streak increment.
  - Incorrect answer: Demotes back to Box 1 for relearning.

---

## Features

### Study Interface
- Integrated header containing navigation controls and the 3-box segmented status bar.
- Interactive 3D flashcard flip with front-to-back perspective transform.
- Real-time session progress, card streaks, and review counts.
- Synthesized audio feedback generated via the Web Audio API with a persistent mute toggle.
- Keyboard navigation shortcuts for rapid reviews without mouse interaction.

### Card Creation
- Quick Add modal accessible from the header bar and the slide-out menu.
- Card creation directly into Box 1 or a user-selected target box.
- Keyboard shortcut (`Ctrl+Enter` or `Cmd+Enter`) to save instantly.

### Card Management and Authentication
- Edit Mode is password-protected to prevent unauthorized card alterations or deletions.
- Default administrator password: `Amber test`
- Password can be changed from the Flashcard Manager or the slide-out menu once unlocked.
- Password hashing with bcrypt, session tokens with HMAC SHA-256, and rate-limiting against brute force attempts.
- In-place card editor allowing updates to question text, answer text, and box frequency.
- Deletion controls with confirmation safety checks.

### Responsive Drawer
- Non-essential controls, preferences, system rules, and statistics are consolidated into a slide-out drawer.
- Fully adapted for mobile viewports and desktop layouts.

---

## Keyboard Shortcuts

| Key | Context | Action |
| --- | --- | --- |
| `Space` | Study | Flip flashcard between question and answer |
| `1` or `Left Arrow` | Card back | Mark incorrect (demote to Box 1) |
| `2` or `Right Arrow` | Card back | Mark correct (promote to next box) |
| `Left Arrow` | Card front | Previous card in deck |
| `Right Arrow` | Card front | Next card in deck |
| `Ctrl+Enter` / `Cmd+Enter` | Modals | Save and submit card form |
| `Escape` | Modals / Menu | Close modal or drawer |

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Vanilla CSS (no external utility frameworks)
- **Icons**: Lucide React
- **Database**: SQLite via `@libsql/client` (local file or Turso cloud)
- **Security**: bcryptjs, Zod, HMAC-signed HTTP-only session cookies
- **Audio**: Web Audio API oscillator synthesis

---

## Project Structure

```
├── leitner.db               # Local SQLite database file
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/        # Authentication, verification, and logout routes
│   │   │   └── cards/       # Card CRUD and review mutation endpoints
│   │   ├── globals.css      # Core styles, design tokens, and layout classes
│   │   ├── layout.tsx       # Root layout and metadata
│   │   └── page.tsx         # Main application controller
│   ├── components/
│   │   ├── BoxSelector.tsx  # 3-Box segmented switcher component
│   │   ├── CardDeck.tsx     # Flashcard display, evaluation, and controls
│   │   ├── ChangePasswordModal.tsx # Password modification modal
│   │   ├── EditModeModal.tsx       # Authenticated card manager and editor
│   │   ├── MenuDrawer.tsx   # Slide-out menu with preferences and metrics
│   │   ├── Navbar.tsx       # Unified header with integrated box tabs
│   │   └── QuickAddModal.tsx # New flashcard creation modal
│   └── lib/
│       ├── auth.ts          # Session tokens and cookie handling
│       ├── db.ts            # Database schema setup and starter seed data
│       ├── rate-limit.ts    # Sliding-window brute force rate limiter
│       └── sound.ts         # Audio synthesizer implementation
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js 18.18 or higher
- pnpm (recommended), npm, or yarn

### Installation

1. Clone or open the repository directory:
   ```bash
   cd HHG-Whisperflow-Task
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm run dev
   ```
   Or:
   ```bash
   pnpm run server
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your web browser.

The application automatically creates and initializes `leitner.db` with the schema and starter flashcards upon initial boot.

---

## Production Build

To create an optimized production build:

```bash
pnpm run build
pnpm run start
```

---

## Environment Variables and Deployment

The application runs locally without any required environment variables using a local `leitner.db` SQLite file.

For cloud deployments (such as Vercel) where local file storage is ephemeral, configure the following variables in your environment:

| Variable | Description | Default (Local) |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | Turso / LibSQL connection URL (`libsql://...`) | `file:leitner.db` |
| `TURSO_AUTH_TOKEN` | Authentication token for Turso cloud database | None |
| `SESSION_SECRET` | Secret string for HMAC SHA-256 session signature | Hardcoded development fallback |

---

## Database Schema

### `cards`
- `id` (TEXT, Primary Key): Unique card identifier
- `question` (TEXT, Not Null): Front prompt text
- `answer` (TEXT, Not Null): Back answer text
- `box` (INTEGER, Not Null, Default 1): Active Leitner box (1, 2, or 3)
- `created_at` (INTEGER, Not Null): Creation timestamp in epoch milliseconds
- `last_reviewed_at` (INTEGER): Timestamp of the most recent review
- `review_count` (INTEGER, Default 0): Total review submissions
- `streak` (INTEGER, Default 0): Current consecutive correct answers

### `settings`
- `key` (TEXT, Primary Key): Setting key name (e.g., `edit_password_hash`)
- `value` (TEXT, Not Null): Stored value