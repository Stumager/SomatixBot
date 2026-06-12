# Changelog

All notable changes to this project will be documented in this file.

The format follows the spirit of Keep a Changelog, and this project uses informal semantic versioning while it is a pet project.

## [Unreleased]

### Added

- Public project documentation.
- GitHub Actions CI for backend checks/tests and frontend build.
- Security policy and secret-history cleanup guide.

### Changed

- Hardened environment-driven Django settings.
- Pinned backend dependency versions.
- Replaced server-specific deploy workflow with neutral CI.
- Removed generated/local artifacts from git tracking.

### Removed

- Unused `ngrok` Python dependency.
- Tracked `node_modules`, `ngrok.exe`, and generated frontend build artifacts.
