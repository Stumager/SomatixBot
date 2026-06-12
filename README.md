# TaskTracker TWA

TaskTracker TWA is a Telegram Mini App for personal task planning and workout tracking. The project combines a Django REST API, JWT authentication through Telegram WebApp init data, PostgreSQL persistence, and a React/Vite frontend optimized for Telegram's in-app viewport.

## Features

- Telegram Mini App authentication with server-side init data verification.
- Personal task CRUD with categories, due dates, search, ordering, and completion status.
- Workout planning linked to tasks.
- Exercise catalog, workout history, set logging, and total volume statistics.
- Telegram task notifications through a background scheduler.
- Docker Compose setup for local backend, frontend build, and PostgreSQL.
- GitHub Actions CI for backend checks/tests and frontend build.

## Tech Stack

- Backend: Python 3.12, Django 6, Django REST Framework, Simple JWT, django-filter.
- Database: PostgreSQL 16.
- Frontend: React 18, TypeScript, Vite, TanStack Query, Zustand, Tailwind CSS, Framer Motion.
- Integrations: Telegram Mini Apps, Telegram Bot API.
- Tooling: Docker, Docker Compose, GitHub Actions.

## Project Structure

```text
.
├── core/                 # Django project settings and URL routing
├── tasks/                # Task, category, Telegram auth, notification logic
├── gym/                  # Workout models, serializers, API views, fixtures
├── templates/            # React/Vite Telegram Mini App frontend
├── .github/workflows/    # CI configuration
├── docker-compose.yml    # Local Docker stack
├── Dockerfile            # Production-like image build
└── requirements.txt      # Pinned backend dependencies
```

## Local Setup With Docker

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Fill `.env` with local values. At minimum set `DJANGO_SECRET_KEY`, `DB_PASSWORD`, and `BOT_TOKEN`.

3. Start the stack:

```bash
docker compose up --build
```

4. Apply migrations and load the exercise catalog in another shell:

```bash
docker compose exec web python manage.py migrate
docker compose exec web python manage.py loaddata gym/fixtures/initial_exercises.json
```

5. Open the backend at `http://localhost:8000`.

## Local Setup Without Docker

Backend:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata gym/fixtures/initial_exercises.json
python manage.py runserver
```

Frontend:

```bash
cd templates
npm ci
npm run dev
```

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`.

## Environment Variables

Use `.env.example` as the source of truth for local configuration.

Key variables:

- `DJANGO_SECRET_KEY`: required when `DJANGO_DEBUG=False`.
- `DJANGO_DEBUG`: set to `True` for local development and `False` in production.
- `ALLOWED_HOSTS`: comma-separated host list.
- `CORS_ALLOWED_ORIGINS`: comma-separated frontend origins for browser requests.
- `CSRF_TRUSTED_ORIGINS`: comma-separated trusted origins.
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`: PostgreSQL connection.
- `DJANGO_USE_SQLITE`: optional local-only switch for checks/tests without PostgreSQL.
- `BOT_TOKEN`: Telegram bot token used for auth verification and notifications.
- `TELEGRAM_AUTH_MAX_AGE_SECONDS`: max age for Telegram WebApp auth data.
- `VITE_API_BASE_URL`: frontend API base URL.

## API Overview

Task API:

- `POST /api/auth/telegram/`
- `GET|POST /api/tasks/`
- `GET|PATCH|DELETE /api/tasks/<id>/`
- `GET|POST /api/categories/`
- `GET|DELETE /api/categories/<id>/`
- `POST /api/token/refresh/`

Workout API:

- `GET /api/gym/categories/`
- `GET /api/gym/catalog/`
- `GET /api/gym/catalog/<id>/`
- `GET|POST /api/gym/workouts/`
- `GET|PATCH|DELETE /api/gym/workouts/<id>/`
- `POST|PATCH /api/gym/workouts/<id>/finish/`
- `GET /api/gym/history/`

## Quality Checks

```bash
venv\Scripts\python.exe manage.py check
$env:DJANGO_USE_SQLITE="True"; venv\Scripts\python.exe manage.py test
cd templates
npm.cmd run build
```

The frontend build may warn about a large bundled chunk. It is not a build failure, but future code splitting would improve load performance.

## Security Notes Before Publishing

- Do not commit `.env`.
- Rotate any Telegram bot token that has ever been committed or shared.
- This repository previously contained generated/local artifacts; they are now ignored and removed from git tracking.
- If a real token exists in git history, rewrite history before making the repository public or create a new clean public repository.

See [SECURITY.md](SECURITY.md) for the disclosure policy and [docs/SECRET_HISTORY_CLEANUP.md](docs/SECRET_HISTORY_CLEANUP.md) for cleanup guidance.

## License

MIT. See [LICENSE](LICENSE).
