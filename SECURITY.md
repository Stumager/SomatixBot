# Security Policy

## Supported Version

This is a pet project, so only the current `main` branch is maintained.

## Reporting a Vulnerability

If you find a vulnerability, open a private report through GitHub Security Advisories if available, or contact the repository owner directly. Please include:

- affected endpoint or file;
- reproduction steps;
- expected impact;
- suggested fix, if you have one.

Please do not open public issues containing active secrets, exploit payloads, or private user data.

## Secrets

Never commit real values for:

- `BOT_TOKEN`;
- `DJANGO_SECRET_KEY`;
- database passwords;
- SSH keys;
- GitHub tokens;
- production `.env` files.

If a secret was committed, treat it as compromised:

1. Revoke or rotate it at the provider.
2. Remove it from the current code.
3. Rewrite git history before publishing publicly.
4. Force-push only after coordinating with every collaborator.

See `docs/SECRET_HISTORY_CLEANUP.md` for practical cleanup steps.
