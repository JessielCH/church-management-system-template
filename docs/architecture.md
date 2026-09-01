# General Architecture

The **Church Management System** is designed as a Full-Stack Monorepo. This approach minimizes DevOps overhead and keeps both the frontend and backend tightly coupled and easy to maintain.

## C4 Context Diagram

Below is the high-level C4 Context Diagram illustrating how users interact with the system and how the system interacts with external services.

```mermaid
C4Context
    title System Context Diagram for Church Management System

    Person(admin, "Church Admin", "Pastor, Coordinator, or Secretary managing the church.")
    Person(leader, "Ministry Leader", "Manages evangelism and discipleship.")
    
    System(cms, "Church Management System", "Allows management of members, evangelism, consolidation, and agendas.")
    
    System_Ext(db, "Supabase / Vercel Postgres", "Stores all relational data securely.")
    System_Ext(auth, "Authentication Provider", "Handles user login (e.g., Supabase Auth or NextAuth).")

    Rel(admin, cms, "Views KPIs, manages members and agenda", "HTTPS")
    Rel(leader, cms, "Tracks new contacts and consolidation", "HTTPS")
    
    Rel(cms, db, "Reads from and writes to", "PostgreSQL Connection / API")
    Rel(cms, auth, "Authenticates users", "OAuth / JWT")
```

## Core Technologies
- **Hosting / CI-CD**: Vercel
- **Framework**: Next.js (App Router)
- **Database**: PostgreSQL (via Supabase or Vercel Postgres)
- **Styling**: Tailwind CSS or Vanilla CSS Modules
- **State Management**: React Server Components + Client Hooks
