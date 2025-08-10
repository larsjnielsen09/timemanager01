# Time Manager

A simple, modern time tracking web app with customers, optional departments, projects, time entries, and summary reports.

## Tech Stack
- Backend: FastAPI, SQLAlchemy, SQLite
- Frontend: React (Vite), TypeScript, Tailwind CSS, React Router

## Features
- Customers and Departments
  - Create customers and optional departments
- Projects
  - Link projects to a customer and (optionally) a department
  - Active/inactive toggle
- Time Tracking
  - Log billable and non-billable time with descriptions
  - Quick-add form on the dashboard
- Reports
  - Hours by Project
  - Hours by Customer
- Dashboard
  - Compact overview (top projects/customers)
  - Recent time logs

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+ (3.12/3.13 also fine)

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .\.venv\Scripts\Activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
API docs: http://localhost:8000/docs

SQLite DB file: `backend/timemanager.db` (auto-created)

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```
Open http://localhost:5173

### Build Frontend
```bash
npm run build
npm run preview
```

## Project Structure
```
 timemanager/
 ├─ backend/
 │  └─ app/
 │     ├─ main.py           # FastAPI app & routers
 │     ├─ models.py         # SQLAlchemy models
 │     ├─ schemas.py        # Pydantic schemas
 │     └─ routers/          # CRUD + reports endpoints
 └─ frontend/
    └─ src/
       ├─ pages/            # Dashboard, Customers, Departments, Projects, Time
       ├─ lib/api.ts        # fetch wrapper
       └─ App.tsx           # layout & routing
```

## API Overview
- `GET /customers`, `POST /customers`, `PUT /customers/{id}`, `DELETE /customers/{id}`
- `GET /departments`, `POST /departments`, `PUT /departments/{id}`, `DELETE /departments/{id}`
- `GET /projects`, `POST /projects`, `PUT /projects/{id}`, `DELETE /projects/{id}`
- `GET /time-entries`, `POST /time-entries`, `PUT /time-entries/{id}`, `DELETE /time-entries/{id}`
- `GET /reports/by-project`, `GET /reports/by-customer`

## Notes
- CORS is configured for `http://localhost:5173`
- Default list page size allows up to `limit=10000`

## License
MIT
