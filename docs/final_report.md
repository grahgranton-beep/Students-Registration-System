# Student Registration System - Final Report

This report summarizes the design, implementation, testing results, security elements, and conclusions of the Student Registration System.

---

## Chapter 1: Implementation Details

### 1.1 Architecture & Stack Choice
The application is built using a modern **Three-Tier Architecture** separating presenting interfaces, application processes, and data stores:
- **Presentation Tier**: Built using React.js (via Vite) and styled with Vanilla CSS. We avoided TailwindCSS to maintain absolute layout control and achieve high-end aesthetics (sleek dark mode, glassmorphism blur filters, responsive cards).
- **Application Tier**: Built using the Flask framework in Python. It exposes RESTful JSON endpoints, utilizes Flask-JWT-Extended for token authentication, and runs business rule checkers.
- **Data Tier**: Supported by MySQL. Connection parameters are configured via environment variables.

### 1.2 Database Schema
Structured into 8 relational tables:
1. `User`: Manages authentication credentials and role flags (`student`, `admin`).
2. `Department`: Groups academic programs.
3. `Program`: Defines degree tracks (e.g. BSE, BIT).
4. `Student`: Extends users with details like registration numbers and DOBs.
5. `AcademicSession`: Manages active semesters.
6. `Unit`: Lists syllabus units, credits, and links them to programs.
7. `UnitPrerequisite`: Self-referential junction table mapping course requirements.
8. `Registration`: Tracks student course enrollments per semester.
9. `AuditLog`: Captures system activity audits.

### 1.3 Key Implementations
- **SQL Injection Prevention**: Enforced via SQLAlchemy ORM which uses parameterized queries.
- **Password Protection**: Enforced using `bcrypt` (one-way salting and hashing).
- **SQLite Fallback**: Dynamic database connection fallback configured in `app.py`. If the MySQL port (3306) is unreachable, the system automatically redirects connections to a local SQLite file (`students_registration.db`), ensuring immediate usability.
- **PDF Report Generation**: Executed on-the-fly using the `reportlab` engine in Python.

---

## Chapter 2: Testing Summary

### 2.1 Testing Strategy
We implemented automated unit and integration tests using Python's `unittest` framework. The test database runs fully isolated inside memory (`sqlite:///:memory:`), keeping the local tables clean.

### 2.2 Automated Test Coverage
- **Authentication**: Checks password hashing matching and JWT token delivery.
- **Role Permissions (RBAC)**: Verifies that student accounts receive a 403 Forbidden error when calling administrative endpoints (e.g., creating departments).
- **Registration business rules**:
  - Checks that students cannot register for courses without completed prerequisites.
  - Checks that total registration loads cannot exceed 18 credits.
  - Checks that duplicate course registrations in the same semester are blocked.

---

## Chapter 3: Test Case Documentation Table

Below is the execution result table of the testing suite.

| Test ID | Test Category | Input Data | Expected Output | Actual Output | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-AUTH-01** | Pass Hashing | Plaintext string "mypassword" | Password hash generated; verify matches correct, rejects incorrect | Password hash created; verify succeeds for true, rejects false | **Pass** |
| **TC-AUTH-02** | Login JWT | Correct username & password | `200 OK` + JSON response containing JWT access token | `200 OK` + JWT token returned | **Pass** |
| **TC-RBAC-01** | Role Block | Student JWT accessing `POST /api/departments` | `403 Forbidden` JSON error payload | `403 Forbidden` response returned | **Pass** |
| **TC-RBAC-02** | Role Access | Admin JWT accessing `POST /api/departments` | `201 Created` department object JSON | `201 Created` response returned | **Pass** |
| **TC-RULE-01** | Prereqs Check | Registering for `SE311` before approving prerequisite `SE201` | `400 Bad Request` + Prerequisite mismatch error detail | `400 Bad Request` + Prerequisite missing detail | **Pass** |
| **TC-RULE-02** | Credit limit | Registering units exceeding 18 total credits | `400 Bad Request` + Credit limit exceeded error details | `400 Bad Request` + Credit limit warning | **Pass** |
| **TC-RULE-03** | Duplicates | Registering for same course twice in active semester | `400 Bad Request` + Already registered error details | `400 Bad Request` + Duplicate error returned | **Pass** |

---

## Chapter 4: User Acceptance Testing (UAT) Checklist

The system was verified manually across several UAT checkpoints.

| UAT ID | Checkpoint Description | Verification Steps | Status |
| :--- | :--- | :--- | :---: |
| **UAT-01** | Self-Service Signup | Register new student account -> check if user & student tables populate correctly. | **Successful** |
| **UAT-02** | Login Redirects | Login as admin -> redirected to Admin portal. Login as student -> redirected to Student portal. | **Successful** |
| **UAT-03** | Lock Interface | Inspect Unit Registration as Student -> verify courses with unmet prerequisites are locked out. | **Successful** |
| **UAT-04** | Limit Enforcements | Try selecting units exceeding 18 credits -> verify warning displays and prevents form submit. | **Successful** |
| **UAT-05** | Approval Queue | Approve student registration as Admin -> verify status changes from pending to approved in student portal. | **Successful** |
| **UAT-06** | Report Downloads | Download PDF student registration slips, CSV class registers, and summary PDFs. Verify alignment. | **Successful** |
| **UAT-07** | Database Backups | Run PowerShell script -> verify timestamped backup file is saved to the backups folder. | **Successful** |
| **UAT-08** | SQLite Fallback | Shut down local MySQL server -> verify system automatically boots up using SQLite. | **Successful** |

---

## Chapter 5: Project Conclusion

The React-Flask Student Registration Portal fully satisfies all academic, design, and business requirements. 
- It achieves **Visual Excellence** using Vanilla CSS glassmorphic components, offering a sleek look.
- It secures **Data Integrity** via bcrypt password hashing, parameterized SQL execution, and an automated PowerShell backup script.
- It implements **Business Controls** by strictly enforcing prerequisite rules, maximum semester credit weights, and duplicate prevention.
- Its **Automated Testing Suite** and isolated testing configs ensure that changes to the portal code can be validated quickly.

The resulting portal is a premium, lightweight, and highly reliable academic system.
