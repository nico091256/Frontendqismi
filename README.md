# IT Support — Frontend

React + Vite frontend for the internal IT Support problem-reporting system.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Build tool & dev server |
| React Router v7 | Client-side routing |
| Axios | HTTP API calls |
| react-hot-toast | Notifications |
| lucide-react | Icons |

---

## Pages

| Route | Who uses it | What it does |
|---|---|---|
| `/` | Employee | Submit a new IT problem |
| `/admin` | IT Staff | View, resolve, delete problems |

---

## 1. Install Dependencies

```bash
cd frontend
npm install
```

---

## 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Change this to your deployed backend URL in production.

---

## 3. Run Development Server

> ⚠️ Make sure the backend is running first on port 5000.

```bash
npm run dev
```

Open **http://localhost:5173** in the browser.

---

## 4. Build for Production

```bash
npm run build
```

Output is in the `dist/` folder. Deploy it to any static host (Netlify, Vercel, Nginx, etc.).

---

## 5. Project Structure

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   └── problems.js      ← All API calls (axios)
│   ├── components/
│   │   ├── Navbar.jsx       ← Top navigation bar
│   │   └── ProblemCard.jsx  ← Problem item card (admin)
│   ├── pages/
│   │   ├── EmployeePage.jsx ← Problem submit form
│   │   └── AdminPage.jsx    ← Admin dashboard
│   ├── App.jsx              ← Router + Toaster
│   ├── main.jsx             ← React entry point
│   └── index.css            ← Design system (dark theme)
├── .env
├── .env.example
├── .gitignore
├── index.html
└── package.json
```

---

## 6. API Endpoints Used

| Action | Method | URL |
|---|---|---|
| Submit problem | `POST` | `/api/problems` |
| Get all problems | `GET` | `/api/problems` |
| Resolve problem | `PATCH` | `/api/problems/:id/resolve` |
| Delete problem | `DELETE` | `/api/problems/:id` |

---

## 7. Features

- **Employee page**: Hero section, form with validation, animated success screen with ticket number
- **Admin page**: Stats bar (total / new / resolved), filter buttons, card list with resolve & delete
- **Toast notifications**: Success/error feedback on all actions
- **Dark theme**: Premium glassmorphism UI, smooth animations
- **Responsive**: Works on mobile and desktop
