# Student Registration System - User Manual

This manual provides instructions for navigating the Student Registration Portal, designed for both **Students** and **Registrar Administrators**.

---

## 1. System Access and Authentication

### 1.1 Portal Landing Page
When you open the portal, you will be greeted by the landing page showcasing registration features and access shortcuts.
- Click **Portal Sign In** if you already have an account.
- Click **Self-Service Signup** if you are a new student.

### 1.2 Self-Service Student Signup
1. Click **Self-Service Signup** or navigate to `/register`.
2. Fill in the required registration forms:
   - **Account Details**: Username, Email, and Password.
   - **Personal Details**: First Name, Last Name, Gender, DOB, and Phone.
   - **Academic Details**: Select your corresponding **Academic Program** from the dropdown menu.
3. Click **Create Account**. You will be redirected to the sign-in page upon success.

### 1.3 Sign In Page
1. Navigate to `/login`.
2. Input your **Username** or **Email** and your **Password**.
   - *Test Student Account*: Username: `student` | Password: `student123`
   - *Test Registrar Admin*: Username: `admin` | Password: `admin123`
3. Click **Sign In**. The portal will direct you to your role-specific dashboard.

---

## 2. Student Portal Guide

### 2.1 Student Dashboard (`/student/dashboard`)
The dashboard gives you an overview of your academic profile and semester registration stats:
- **Semester Load Bar**: Shows the total credits registered out of the 18-credit limit.
- **Approved/Pending Counters**: Details how many course units have been processed.
- **Registration Summary**: Lists currently enrolled units in the active semester and their status.

### 2.2 Course Unit Registration (`/student/register`)
This interactive page allows you to enroll in curriculum courses.
1. Check the **Syllabus Units Table** to view available courses.
2. Observe **Lock Statuses**:
   - If a course has prerequisites you haven't completed, it will show a red **Locked** badge and disabled checkbox.
   - You must pass and get approval for the prerequisite unit (e.g., `CS101`) before enrolling in advanced units (e.g., `SE201`).
3. Check the checkboxes for the courses you wish to register:
   - The **Semester Load Status** bar at the top updates in real-time.
   - If you exceed the maximum credit limit of **18 credits**, the interface will prevent further selections and raise a warning.
4. Click **Confirm & Register** to submit.

### 2.3 View Registered Units (`/student/units`)
- Lists all units enrolled in the active session.
- **Drop Action**: You can drop **pending** course selections. Once approved or rejected by the admin, registrations are locked and cannot be deleted by the student.
- **Download PDF Slip**: Click **Download PDF Slip** to fetch your official, stamped registration slip. It saves to your computer as a formatted PDF.

### 2.4 Edit Profile (`/student/profile`)
- Update your contact details (Email, Phone).
- Securely update your password by filling in the password fields and clicking **Save Settings**.

---

## 3. Registrar Admin Portal Guide

### 3.1 Stats Dashboard (`/admin/dashboard`)
Provides an analytical layout for administrative controls:
- **Counters**: Real-time stats on total students, pending registrations, active courses, and departments.
- **Security Audit Log**: A scrolling terminal feeding security logs, listing actions, user, timestamp, database targets, and clients' IP addresses.

### 3.2 Student Management (`/admin/students`)
- **Search and Filter**: Search students by name, reg number, or program code.
- **Add Student**: Click **Add Student Account** to manually enroll a student (this creates their portal user account and student details at once).
- **Edit Student**: Click the **Edit** icon to adjust names, programs, or set student status (e.g. set to `suspended` to disable their logins).
- **Delete Student**: Click the **Trash** icon to permanently delete the profile and user logs.
- **Approval Queue**: Review pending unit registration requests. Click **Approve** (green) or **Reject** (red) to process students' enrollment forms.

### 3.3 Program & Unit Management (`/admin/courses`)
- **Manage Programs**: CRUD (Create, Read, Update, Delete) degree options and link them to respective departments.
- **Manage Units**:
  - Add or update courses, credit weights, and descriptions.
  - **Prerequisites Multi-select**: Link prerequisites from other units to enforce business logic on student registrations.

### 3.4 Departments & Semesters Config (`/admin/departments`)
- **Manage Departments**: CRUD departments code and titles.
- **Academic Semesters**: Create academic calendar sessions.
- **Session Activation**: Click **Activate** on a semester session. The system will set it as active and automatically set previous active sessions as inactive.

### 3.5 Report Center (`/admin/reports`)
1. **Class Registers List**:
   - Select an Academic Unit from the dropdown menu.
   - Click **PDF List** or **CSV List** to download the student registration spreadsheet for that course.
2. **General Registration Summary**:
   - Click **PDF Summary** or **CSV Summary** to download a global dump of all student registrations across the university.
