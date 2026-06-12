# Contributing

Thanks for taking interest in TaskTracker TWA.

## Development Flow

1. Create a feature branch from `main`.
2. Keep changes focused and documented.
3. Run backend checks and frontend build before opening a pull request.
4. Do not commit generated files, local environments, or secrets.

## Backend Checks

```bash
venv\Scripts\python.exe manage.py check
$env:DJANGO_USE_SQLITE="True"; venv\Scripts\python.exe manage.py test
```

## Frontend Checks

```bash
cd templates
npm.cmd run build
```

## Code Style

- Prefer existing Django and React patterns already used in the project.
- Keep API permissions scoped to the authenticated user.
- Keep environment-specific values in `.env`.
- Add migrations for model changes.
- Update README or CHANGELOG when behavior changes.

## Pull Request Checklist

- No real secrets in the diff.
- No generated folders such as `node_modules`, `templates/dist`, or `staticfiles`.
- Backend checks pass.
- Frontend build passes.
- Documentation is updated when setup or behavior changes.
