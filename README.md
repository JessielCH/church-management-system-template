# ⛪ Church Management System (SaaS Open-Source Template)

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![Prisma 6](https://img.shields.io/badge/Prisma-6.4-blue?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-green?logo=postgresql)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, full-stack administrative platform for church operations, membership tracking, pastoral agendas with WhatsApp reminders, and multimedia projection/publicity ticketing systems. Built with **Next.js 16 App Router**, **Prisma 6 ORM**, **PostgreSQL (Supabase)**, and a responsive **Vanilla CSS Design System**.

---

## ✨ Key Features

### 📅 Pastoral Agenda & WhatsApp Reminders
- Interactive pastoral agenda for scheduling visits, counsels, and church events.
- **Multi-Choice WhatsApp Reminders**: Flexible notification scheduling (`1 Hour Before`, `1 Day Before`, `1 Week Before`, or `Disabled`).
- Visual KPI cards displaying upcoming events and scheduled visits count.

### 🎬 Multimedia & Worship Tickets Module
- **Dedicated Worship Song Tickets (`WORSHIP_SONG`)**: Submit songs for projection during services with song title, artist/author, and assigned weekly worship director.
- **Publicity & Production Requests (`MEDIA_REQUEST`)**: Submit requests for video announcements, graphics, and publicity banners.
- **3-Day Production Deadline Suggestion**: Intelligent deadline calculation that warns users if a request is submitted less than 3 days before the event date to prevent production delays.
- **Ticket Assignment Workflow**: Multimedia Admins can assign tickets to specific operators (`multimedia1`, `multimedia2`).
- **Prominent Realizado Badge**: Visible completion checkmark status (`✓ Realizado`) across all user roles.

### 🔐 Granular Multi-Role Security System
- Pre-configured role hierarchy: `PASTOR`, `COORDINADOR`, `SECRETARIA`, `MULTIMEDIA`, `LEADER`, `ADMIN`.
- **Encrypted Authentication**: Irreversible password security powered by `bcryptjs`.
- Route protection proxy using Next.js 16 edge proxy conventions.

### 📱 Full Mobile Responsiveness & Collapsible Sidebar
- Responsive design tailored for smartphones, tablets, and desktop displays.
- Collapsible sidebar menu with a toggle button (☰) that collapses to icon view on desktop and slides smoothly on mobile screens.

---

## 🛠️ Tech Stack & Architecture

- **Frontend & Server Actions**: Next.js 16 (App Router & Server Actions)
- **Database & ORM**: PostgreSQL (Supabase) + Prisma ORM `v6.4.0`
- **Authentication**: Custom HTTP-only session cookies with Bcrypt password hashing
- **Styling**: Vanilla CSS Design System with curated color variables & HSL gradients

---

## 👥 Seeded Test User Matrix

This template comes with seeded test accounts out of the box for instant evaluation:

| Role | Username | Default Password | Platform Scope |
| :--- | :--- | :--- | :--- |
| **Pastor** | `pastor1` | `pastor1` | Executive oversight, Pastoral Agenda, WhatsApp alerts |
| **Coordinador** | `admin` | `admin123` | Data completeness monitoring & delay audits |
| **Secretaria** | `secretaria1` | `secretaria1` | Attendance records & membership details |
| **Admin Multimedia** | `multimedia_admin` | `multimedia_admin` | Ticket receiving & operator assignment |
| **Multimedia Operator 1** | `multimedia1` | `multimedia1` | Worship projection & media production tasks |
| **Multimedia Operator 2** | `multimedia2` | `multimedia2` | Worship projection & media production tasks |
| **Líder** | `lider1` | `lider1` | Ministry-scoped access & ticket creation |

---

## 🚀 Quick Start & Installation

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/church-management-system-template.git
cd church-management-system-template
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase / PostgreSQL database connection URLs:
```bash
cp .env.example .env
```

### 4. Push Database Schema & Seed Initial Users
```bash
# Push schema to live database
npm run db:push

# Seed test accounts
npm run db:seed
```

### 5. Launch Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
