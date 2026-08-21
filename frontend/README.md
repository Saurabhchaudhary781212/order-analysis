# Order Analytics Dashboard — Final Internship Build

A React + Flask analytics application that accepts CSV, JSON, Excel and XML datasets, stores each user's data, calculates business KPIs and renders charts and filtered order analysis.

## Features

- User registration and login
- Password hashing
- Per-user dataset storage in SQLite
- Protected analytics APIs
- CSV / JSON / XLSX / XLS / XML upload
- Multiple file upload
- Revenue, orders, AOV and delivery KPIs
- Revenue trend and category analytics data
- Delivery status breakdown
- Date, category and delivery filters
- Responsive React dashboard
- Axios API layer
- Chart.js visualization layer

## Run backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend: http://127.0.0.1:5000

The SQLite database `order_analytics.db` is created automatically.

## Run frontend

```bash
cd order-analytics-react-frontend
npm install
copy .env.example .env
npm run dev
```

Frontend: http://localhost:5173

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/upload`
- `GET /api/analytics/summary`
- `GET /api/analytics/data`
- `POST /api/analytics/clear`
- `GET /api/health`

Upload uses multipart field name `files` and supports multiple files.
