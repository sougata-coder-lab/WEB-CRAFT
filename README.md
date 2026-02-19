# WebCraft AI – AI-Powered Website Builder SaaS

A full-stack AI website builder where users describe a website in plain English and get complete, responsive HTML/CSS/JS generated instantly.

## 🚀 Tech Stack

**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS v4 + Lucide React + Sonner + React Router DOM + Axios  
**Backend:** Node.js + Express + MongoDB (Mongoose) + JWT Auth + OpenRouter AI API

---

## 📁 Project Structure

```
qwert/
├── backend/                  # Express API server
│   ├── src/
│   │   ├── config/           # DB + JWT config
│   │   ├── controllers/      # Auth, Projects, Community, AI
│   │   ├── middleware/        # Auth guard, error handler
│   │   ├── models/           # User, Project (Mongoose)
│   │   ├── routes/           # /api/auth, /api/projects, /api/community, /api/ai
│   │   └── utils/            # aiGenerator.js (OpenRouter calls)
│   ├── .env
│   └── server.js
│
└── frontend/                 # React + Vite SPA
    ├── src/
    │   ├── context/          # AuthContext (JWT + localStorage)
    │   ├── hooks/            # useAuth
    │   ├── pages/            # Home, Login, Signup, Projects, Builder, Community, Pricing, View
    │   ├── components/       # Navbar
    │   ├── services/         # api.ts (Axios), ai.ts
    │   └── types/            # TypeScript interfaces
    ├── .env
    └── vite.config.ts        # Proxy /api → localhost:5000
```

---

## ⚙️ Setup

### 1. Backend

```bash
cd backend
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-website-builder
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
OPENROUTER_API_KEY=sk-or-v1-your-key-here
FRONTEND_URL=http://localhost:5173
```

Get your free OpenRouter API key at: https://openrouter.ai

Install dependencies & start:
```bash
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
```

The `.env` is already configured:
```env
VITE_API_URL=http://localhost:5000
```

Install dependencies & start:
```bash
npm install
npm run dev
```

### 3. MongoDB

Make sure MongoDB is running locally:
```bash
mongod
# or on Termux:
mongod --dbpath ~/mongodb-data
```

---

## 🌐 Running the App

1. Start MongoDB
2. Start backend: `cd backend && npm run dev` → runs on http://localhost:5000
3. Start frontend: `cd frontend && npm run dev` → runs on http://localhost:5173
4. Open http://localhost:5173 in your browser

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 Auth | Email/password signup & login with JWT |
| 🤖 AI Generation | Describe → get full HTML/CSS/JS website |
| 👁️ Live Preview | iframe with `srcdoc` + sandbox |
| 📱 Device Toggles | Mobile (412px), Tablet (768px), Desktop |
| ✏️ Code Editor | Edit raw HTML with live apply |
| 💾 Save & Download | Save to DB or download as index.html |
| 🌍 Publish | Publish to community gallery |
| 🕐 Version History | Every generation saved; rollback anytime |
| 🖼️ Community Gallery | Browse all published AI websites |
| 💬 Chat Interface | Follow-up prompts to revise the site |

---

## 🤖 AI Models Used (via OpenRouter)

The system tries these models in order (fallback chain):
1. `qwen/qwen-2.5-coder-32b-instruct` (best quality)
2. `deepseek/deepseek-coder`
3. `meta-llama/llama-3.1-8b-instruct:free` (free fallback)

---

## 🔑 Environment Variables

### Backend `.env`
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) |
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `FRONTEND_URL` | Frontend URL for CORS |

### Frontend `.env`
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/signup` – Register
- `POST /api/auth/login` – Login
- `GET /api/auth/me` – Get current user (protected)

### Projects (all protected)
- `GET /api/projects` – List user's projects
- `POST /api/projects` – Create project
- `GET /api/projects/:id` – Get project
- `PUT /api/projects/:id` – Update project
- `DELETE /api/projects/:id` – Delete project
- `POST /api/projects/:id/generate` – Generate AI code
- `POST /api/projects/:id/rollback/:versionIndex` – Rollback version
- `PUT /api/projects/:id/publish` – Toggle publish

### Community (public)
- `GET /api/community` – Get published projects (paginated)
- `GET /api/community/:id` – Get single published project

### AI (protected)
- `POST /api/ai/generate` – Direct AI generation

---

## 🎨 Design System

- **Background:** `bg-black` / `bg-gray-950`
- **Text:** `text-white` / `text-gray-400`
- **Accent:** `indigo-600` / `indigo-500`
- **Font:** Outfit (Google Fonts)
- **Icons:** Lucide React
