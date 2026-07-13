# System Architecture and Design Diagrams

This document contains visual diagrams for the Student Registration System, representing database schemas, data flows, client-server tiers, and sequence steps.

---

## 1. Use Case Diagram
Describes user roles (Students and Registrar Administrators) and their respective actions.

```mermaid
usecaseDiagram
    actor Student
    actor Admin as "Registrar Admin"

    rect "Student Registration System"
        Student --> (Login / Logout)
        Student --> (Self-Service Registration)
        Student --> (Manage Profile)
        Student --> (Register for Units)
        Student --> (View Registration Status)
        Student --> (Download/Print Slip)

        (Register for Units) ..> (Prerequisite Check) : include
        (Register for Units) ..> (Credit Limit Check) : include

        (Login / Logout) <-- Admin
        Admin --> (Manage Students CRUD)
        Admin --> (Manage Depts & Programs CRUD)
        Admin --> (Manage Units CRUD)
        Admin --> (Approve / Reject Registrations)
        Admin --> (Generate CSV/PDF Reports)
        Admin --> (View Security Audit Logs)
    end
```

---

## 2. Entity Relationship Diagram (ERD)
Illustrates the MySQL relational database schema, tables, keys, and cardinality.

```mermaid
erDiagram
    user {
        int id PK
        string username
        string password_hash
        string email
        string role
        datetime created_at
    }
    
    student {
        int id PK
        int user_id FK
        string registration_no UK
        string first_name
        string last_name
        string gender
        date date_of_birth
        string phone
        int program_id FK
        string status
    }
    
    department {
        int id PK
        string code UK
        string name UK
        datetime created_at
    }
    
    program {
        int id PK
        string code UK
        string name
        int department_id FK
        datetime created_at
    }
    
    unit {
        int id PK
        string code UK
        string name
        int program_id FK
        string description
        int credits
    }
    
    unit_prerequisites {
        int unit_id PK, FK
        int prerequisite_id PK, FK
    }
    
    academic_session {
        int id PK
        string name UK
        boolean is_active
        datetime created_at
    }
    
    registration {
        int id PK
        int student_id FK
        int unit_id FK
        int session_id FK
        string status
        datetime registered_at
    }
    
    audit_log {
        int id PK
        int user_id FK
        string action
        string target_table
        string details
        string ip_address
        datetime created_at
    }

    user ||--o| student : "has profile"
    department ||--o{ program : "owns"
    program ||--o{ student : "contains"
    program ||--o{ unit : "curriculum"
    unit }|--o{ unit_prerequisites : "requires"
    student ||--o{ registration : "requests"
    unit ||--o{ registration : "linked"
    academic_session ||--o{ registration : "belongs_to"
    user ||--o{ audit_log : "triggers"
```

---

## 3. Data Flow Diagrams (DFD)

### Level 0: Context Diagram
Maps system inputs and outputs from entities.

```mermaid
graph TD
    Student((Student)) -->|Credentials / Register Forms| System[("Student Registration System")]
    System -->|Dashboard / Status / PDF Slips| Student

    Admin((Registrar Admin)) -->|Admin CRUD / Approvals / Filters| System
    System -->|Analytics Counters / Reports / Audits| Admin
```

### Level 1: Process Decomposition
Breaks down logical subprocesses and storage databases.

```mermaid
graph TD
    subgraph Users
        St((Student))
        Ad((Admin))
    end

    subgraph Processes
        P1(1.0 Authentication)
        P2(2.0 Profile Management)
        P3(3.0 Course & Curriculum Management)
        P4(4.0 Enrollment & Business Logic Validation)
        P5(5.5 Report Generator)
    end

    subgraph Database
        DB[(MySQL Data Store)]
    end

    St -->|Login details| P1
    P1 -->|JWT token| St
    P1 <-->|Verify credentials| DB

    St -->|Edit Email/Phone| P2
    P2 -->|Save Profile| DB

    Ad -->|CRUD Depts/Programs/Units| P3
    P3 -->|Write details| DB

    St -->|Select Unit IDs| P4
    P4 -->|Prerequisite, Limit & Duplicate Checks| DB
    DB -->|Read Approved Regs & Credits| P4
    P4 -->|Submit Pending Registrations| DB

    Ad -->|Approve/Reject requests| P4

    Ad -->|Request Summary/Class Lists| P5
    St -->|Request Print Slip| P5
    P5 -->|Read registers| DB
    P5 -->|CSV / PDF File Stream| Users
```

---

## 4. System Architecture Diagram (Three-Tier Tiers)
Shows physical separation of components.

```mermaid
graph LR
    subgraph Presentation Tier [Presentation Tier - UI client]
        ReactClient["React.js SPA client (Vite)"]
        BrowserStyle["Vanilla CSS Styles (index.css)"]
    end

    subgraph Application Tier [Application Tier - API Server]
        FlaskServer["Flask Web Server (Python)"]
        JWTAuth["Flask-JWT-Extended"]
        BLogic["Business Rules (Validations)"]
        PDFGen["ReportLab PDF Engine"]
        ORM["SQLAlchemy ORM"]
    end

    subgraph Data Tier [Data Tier - Storage]
        MySQL[("MySQL Database (XAMPP Server)")]
        SQLite[("SQLite Fallback DB (Local File)")]
    end

    ReactClient <-->|REST API / JSON| FlaskServer
    FlaskServer --> ORM
    ORM <-->|PyMySQL driver| MySQL
    ORM <-->|Local driver| SQLite
```

---

## 5. Sequence Diagram: Course Registration Workflow
Steps triggered when a student submits their unit selections.

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student User
    participant UI as React UI (UnitRegistration)
    participant API as Flask API (/api/registrations)
    participant DB as MySQL DB (Tables)

    Student->>UI: Select Units & Click Submit
    UI->>UI: Check Client Credits (< 18 cr)
    UI->>API: POST /api/registrations (Unit IDs, JWT)
    
    activate API
    API->>DB: Check if Student account is ACTIVE
    DB-->>API: Return Active status
    
    API->>DB: Fetch past APPROVED student registrations
    DB-->>API: List of past unit IDs
    
    API->>API: Rule 1: Validate Prerequisites met
    API->>API: Rule 2: Verify Total Credits <= 18
    API->>API: Rule 3: Check Duplicate requests in active session
    
    alt Validations Failed
        API-->>UI: Return 400 Bad Request (JSON error array)
        UI-->>Student: Display specific validation alerts (Toast)
    else Validations Pass
        API->>DB: Insert new registrations (Status = PENDING)
        API->>DB: Write Audit log activity details
        DB-->>API: Confirmation
        API-->>UI: Return 201 Created (JSON registration array)
        deactivate API
        UI-->>Student: Display Success Alert & Update dashboard progress
    end
```
