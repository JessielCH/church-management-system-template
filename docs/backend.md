# Backend Architecture

The backend logic is tightly integrated into the Next.js repository using **Server Actions** and **Route Handlers**. The data layer relies on a managed PostgreSQL database.

## Entity-Relationship (ER) Model

This diagram illustrates the core database schema for the MVP.

```mermaid
erDiagram
    USERS ||--o{ MEMBERS : registers
    MEMBERS ||--o{ FOLLOW_UPS : receives
    MEMBERS {
        uuid id PK
        string first_name
        string last_name
        string email
        string phone
        string status "active | inactive | new"
        timestamp created_at
    }
    FOLLOW_UPS {
        uuid id PK
        uuid member_id FK
        uuid assigned_to FK
        string type "visit | call | message"
        string notes
        date due_date
        string status "pending | completed | urgent"
    }
    EVENTS {
        uuid id PK
        string title
        string description
        timestamp start_time
        timestamp end_time
        string event_type
    }
    MINISTRIES {
        uuid id PK
        string name
        string description
    }
    MEMBERS }|--|{ MINISTRIES : participates_in
```

## API and Data Fetching
- **Server Actions**: We will use Next.js Server Actions for all mutations (e.g., creating a new member, updating follow-up status). This allows us to handle form submissions natively without writing separate API routes.
- **Data Access Layer**: Direct database queries using an ORM like **Prisma** or the **Supabase JS Client** directly from the Server Components.
