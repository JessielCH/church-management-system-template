# Church Management System

[![CodeQL Analysis](https://github.com/JessielCH/church-management-system/actions/workflows/codeql.yml/badge.svg)](https://github.com/JessielCH/church-management-system/actions/workflows/codeql.yml)
[![CI/CD](https://github.com/JessielCH/church-management-system/actions/workflows/lint.yml/badge.svg)](https://github.com/JessielCH/church-management-system/actions/workflows/lint.yml)

Administrative and Management System for Churches, designed to help manage membership, evangelism, consolidation, and discipleship.

<img src="images/logo.svg" alt="System Logo" width="80">

## Features (MVP)
- **Institutional Dashboard**: KPIs for membership and evangelism.
- **Membership Management**: Member database (active, inactive).
- **Consolidation**: Follow-ups with automatic alerts.
- **Agenda**: Events and weekly planning.

## Architecture
This project is designed with a **Full-Stack Monorepo** approach:
- **Framework**: Next.js (App Router)
- **Database**: PostgreSQL (Vercel Postgres or Supabase)
- **Deployment**: Vercel

## Code Quality (CI/CD)
The repository uses **GitHub Actions** and **Local Hooks** to ensure code quality and long-term maintainability:
- **Pre-commit Hooks**: Local tests and linting run automatically before making a commit.
- **Commitlint**: Commits must follow the international convention (e.g., `feat: add user login`, `fix: header alignment`).
- **Linting**: Automatic validation of React/Next.js code on every Pull Request.

## Current Directory Structure
- `/mockup/`: Contains the initial prototype in HTML/CSS/JS (Vanilla).

## Local Development (Mockup Phase)
Open `mockup/index.html` in any web browser. No installation required.

---
*MVP Prototype - Generic White-Label Church Management Platform.*
