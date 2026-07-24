import datetime
import bcrypt
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Junction Table for Unit Prerequisites (self-referential many-to-many)
unit_prerequisites = db.Table(
    'unit_prerequisites',
    db.Column('unit_id', db.Integer, db.ForeignKey('unit.id', ondelete='CASCADE'), primary_key=True),
    db.Column('prerequisite_id', db.Integer, db.ForeignKey('unit.id', ondelete='CASCADE'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student') # 'student' or 'admin'
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    student_profile = db.relationship('Student', backref='user', uselist=False, cascade="all, delete-orphan")
    audit_logs = db.relationship('AuditLog', backref='user', cascade="all, delete-orphan")

    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Department(db.Model):
    __tablename__ = 'department'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(10), unique=True, nullable=False) # e.g. "CS"
    name = db.Column(db.String(100), unique=True, nullable=False) # e.g. "Computer Science"
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    programs = db.relationship('Program', backref='department', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Program(db.Model):
    __tablename__ = 'program'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(10), unique=True, nullable=False) # e.g. "BSE"
    name = db.Column(db.String(100), nullable=False) # e.g. "B.Sc. Software Engineering"
    department_id = db.Column(db.Integer, db.ForeignKey('department.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    students = db.relationship('Student', backref='program', cascade="all, delete-orphan")
    units = db.relationship('Unit', backref='program', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "department_id": self.department_id,
            "department_name": self.department.name if self.department else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Student(db.Model):
    __tablename__ = 'student'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), unique=True, nullable=False)
    registration_no = db.Column(db.String(50), unique=True, nullable=False) # e.g. "REG/2026/0001"
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    gender = db.Column(db.String(10), nullable=True)
    date_of_birth = db.Column(db.Date, nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    program_id = db.Column(db.Integer, db.ForeignKey('program.id', ondelete='SET NULL'), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='active') # 'active', 'suspended'

    registrations = db.relationship('Registration', backref='student', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "username": self.user.username if self.user else None,
            "email": self.user.email if self.user else None,
            "registration_no": self.registration_no,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "gender": self.gender,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "phone": self.phone,
            "program_id": self.program_id,
            "program_name": self.program.name if self.program else None,
            "program_code": self.program.code if self.program else None,
            "department_name": self.program.department.name if self.program and self.program.department else None,
            "status": self.status
        }

class AcademicSession(db.Model):
    __tablename__ = 'academic_session'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False) # e.g. "2025/2026 Semester 1"
    is_active = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    registrations = db.relationship('Registration', backref='session', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Unit(db.Model):
    __tablename__ = 'unit'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(15), unique=True, nullable=False) # e.g. "SE311"
    name = db.Column(db.String(100), nullable=False)
    program_id = db.Column(db.Integer, db.ForeignKey('program.id', ondelete='CASCADE'), nullable=False)
    description = db.Column(db.Text, nullable=True)
    credits = db.Column(db.Integer, nullable=False, default=3)

    registrations = db.relationship('Registration', backref='unit', cascade="all, delete-orphan")

    # Many-to-many self-referential relationship for prerequisites
    prerequisites = db.relationship(
        'Unit',
        secondary=unit_prerequisites,
        primaryjoin=(id == unit_prerequisites.c.unit_id),
        secondaryjoin=(id == unit_prerequisites.c.prerequisite_id),
        backref='prerequisite_for'
    )

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "program_id": self.program_id,
            "program_code": self.program.code if self.program else None,
            "description": self.description,
            "credits": self.credits,
            "prerequisites": [
                {"id": p.id, "code": p.code, "name": p.name} for p in self.prerequisites
            ]
        }

class Registration(db.Model):
    __tablename__ = 'registration'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id', ondelete='CASCADE'), nullable=False)
    unit_id = db.Column(db.Integer, db.ForeignKey('unit.id', ondelete='CASCADE'), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey('academic_session.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending') # 'pending', 'approved', 'rejected'
    registered_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    __table_args__ = (
        db.UniqueConstraint('student_id', 'unit_id', 'session_id', name='uq_student_unit_session'),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "student_name": f"{self.student.first_name} {self.student.last_name}" if self.student else None,
            "student_reg_no": self.student.registration_no if self.student else None,
            "unit_id": self.unit_id,
            "unit_code": self.unit.code if self.unit else None,
            "unit_name": self.unit.name if self.unit else None,
            "unit_credits": self.unit.credits if self.unit else None,
            "session_id": self.session_id,
            "session_name": self.session.name if self.session else None,
            "status": self.status,
            "registered_at": self.registered_at.isoformat() if self.registered_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class AuditLog(db.Model):
    __tablename__ = 'audit_log'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='SET NULL'), nullable=True)
    action = db.Column(db.String(100), nullable=False) # e.g. "student_registered_unit"
    target_table = db.Column(db.String(50), nullable=True) # e.g. "registration"
    details = db.Column(db.Text, nullable=True) # JSON details
    ip_address = db.Column(db.String(45), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "username": self.user.username if self.user else "System/Deleted",
            "action": self.action,
            "target_table": self.target_table,
            "details": self.details,
            "ip_address": self.ip_address,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
