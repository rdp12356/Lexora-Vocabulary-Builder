# 🌟 Lexora Vocabulary Builder

**A beautiful, modern full-stack vocabulary learning web app** featuring Tinder-style swipe flashcards, mastery buckets, liquid glass UI with animated orbs, and intelligent progress tracking.

Built as a clean TypeScript monorepo — perfect for fun, addictive language learning.

![Lexora Preview](https://via.placeholder.com/1200x600/4f46e5/ffffff?text=Lexora+Vocabulary+Builder+—+Swipe+Mode+%26+Liquid+Glass+UI)  
*(Replace with actual screenshots/GIFs from `attached_assets/` — swipe mode, word detail with orbs, progress charts, and mobile view are highly recommended!)*

## ✨ Features

- **Swipe Learning Mode** — Intuitive Tinder-style card swiping for vocabulary practice
- **Mastery Buckets** — Spaced-repetition style system (New → Learning → Mastered)
- **Word Lists** — Create and organize custom vocabulary collections
- **Rich Word Details** — Expandable sections with definitions, examples, and progress
- **Progress Analytics** — Beautiful Recharts visualizations of your learning journey
- **Liquid Glass UI** — Modern glassmorphic design with animated orbs and smooth Framer Motion interactions
- **Fully Responsive** — Works seamlessly on desktop and mobile

## 🛠️ Tech Stack

### Monorepo (pnpm workspaces)
- **Frontend**: React 19 + Vite, Tailwind CSS, shadcn/ui, Framer Motion, TanStack Query, React Hook Form + Zod, Recharts, Wouter
- **Backend**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Type Safety**: End-to-end with Orval (OpenAPI spec → Zod schemas + React hooks)
- **Validation**: Zod v4 + drizzle-zod
- **Build**: esbuild (CJS bundles)
- **TypeScript**: 5.9

## 📁 Project Structure

```bash
Lexora-Vocabulary-Builder/
├── lib/                    # Shared packages (api-spec, api-zod, api-client-react, db, etc.)
├── artifacts/              # Build outputs
├── attached_assets/        # Images, icons, and static assets
├── scripts/                # Utility scripts
├── replit.md               # Additional workspace documentation
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── .replit                 # Replit configuration
🚀 Quick Start
Prerequisites

Node.js 24+
pnpm
PostgreSQL (for local dev)

Installation & Development
Bash# 1. Clone the repo
git clone https://github.com/rdp12356/Lexora-Vocabulary-Builder.git
cd Lexora-Vocabulary-Builder

# 2. Install dependencies
pnpm install

# 3. Type check everything
pnpm run typecheck

# 4. Start backend
pnpm --filter @workspace/api-server run dev

# 5. (In a new terminal) Start frontend
pnpm --filter @workspace/frontend run dev   # (adjust filter name if your frontend package is named differently)
For more workspace-specific commands, see replit.md.
API Code Generation
After changing the OpenAPI spec:
Bashpnpm --filter @workspace/api-spec run codegen
📜 Available Scripts (from root)

pnpm run typecheck — Full type check across all packages
pnpm run build — Build everything
pnpm --filter @workspace/db run push — Push database schema changes (dev)

🤝 Contributing
Contributions, issues, and feature requests are welcome!
Feel free to open a PR or issue.
📄 License
This project is open source and licensed under the MIT License (add a LICENSE file).

Made with ❤️ for language learners everywhere
