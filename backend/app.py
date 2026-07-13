import os
import pymysql
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from models import db, User, Student, Department, Program, Unit, AcademicSession, Registration, AuditLog
from auth import auth_bp
from routes import api_bp
from reports import reports_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Configure CORS - allow React dev server
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Configure JWT
    jwt = JWTManager(app)
    
    # Check MySQL connectivity and create database if missing
    # Otherwise fallback to SQLite
    db_uri = app.config['MYSQL_URI']
    if not app.config.get('TESTING'):
        try:
            # Connect to MySQL server to check availability and create database
            conn = pymysql.connect(
                host=app.config['MYSQL_HOST'],
                user=app.config['MYSQL_USER'],
                password=app.config['MYSQL_PASSWORD'],
                port=int(app.config['MYSQL_PORT']),
                connect_timeout=3
            )
            cursor = conn.cursor()
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {app.config['MYSQL_DB']}")
            conn.close()
            app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
            print(f"Successfully connected to MySQL database: {app.config['MYSQL_DB']}")
        except Exception as e:
            print(f"WARNING: MySQL database connection failed: {e}")
            print(f"Falling back to local SQLite database: {app.config['SQLITE_URI']}")
            app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLITE_URI']
            
    # Initialize DB
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    
    # Error Handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Bad Request", "message": str(error)}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"error": "Unauthorized", "message": str(error)}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"error": "Forbidden", "message": str(error)}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not Found", "message": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal Server Error", "message": str(error)}), 500
        
    # Database Initialization & Seeding
    with app.app_context():
        db.create_all()
        seed_database()
        
    return app

def seed_database():
    # Only seed if User table is empty
    if User.query.first():
        return
        
    print("Pre-seeding database with mock academic records...")
    
    # 1. Create Academic Sessions
    past_session = AcademicSession(name="2024/2025 Semester 2", is_active=False)
    active_session = AcademicSession(name="2025/2026 Semester 1", is_active=True)
    next_session = AcademicSession(name="2025/2026 Semester 2", is_active=False)
    
    db.session.add_all([past_session, active_session, next_session])
    db.session.commit() # Commit to get IDs
    
    # 2. Create Departments
    cs_dept = Department(code="CS", name="Computer Science & IT")
    eng_dept = Department(code="ENG", name="Engineering & Technology")
    
    db.session.add_all([cs_dept, eng_dept])
    db.session.commit()
    
    # 3. Create Programs
    bse_prog = Program(code="BSE", name="B.Sc. Software Engineering", department_id=cs_dept.id)
    bit_prog = Program(code="BIT", name="B.Sc. Information Technology", department_id=cs_dept.id)
    bee_prog = Program(code="BEE", name="B.Sc. Electrical Engineering", department_id=eng_dept.id)
    
    db.session.add_all([bse_prog, bit_prog, bee_prog])
    db.session.commit()
    
    # 4. Create Units (Subjects)
    # BSE units
    cs101 = Unit(code="CS101", name="Introduction to Programming", credits=3, program_id=bse_prog.id, description="Introduction to basic programming concepts, control flows, data types, and syntax using Python.")
    se201 = Unit(code="SE201", name="Software Design & Patterns", credits=4, program_id=bse_prog.id, description="Covers software development life cycle, OOP principles, and design patterns like MVC, Singleton, and Factory.")
    se311 = Unit(code="SE311", name="Web Application Development", credits=3, program_id=bse_prog.id, description="Hands-on web technologies including HTML, CSS, JavaScript, React, and Flask API integrations.")
    se321 = Unit(code="SE321", name="Database Systems & SQL", credits=3, program_id=bse_prog.id, description="Relational database design, normal forms, ER mapping, and writing optimized SQL queries in MySQL.")
    se401 = Unit(code="SE401", name="Advanced Agentic Coding", credits=4, program_id=bse_prog.id, description="Advanced architectures, LLMs, autonomous software agents, system testing, and CI/CD pipelines.")
    
    # Add prerequisites relationship
    se201.prerequisites.append(cs101)
    se311.prerequisites.append(se201)
    se401.prerequisites.append(se311)
    
    # BIT units
    it101 = Unit(code="IT101", name="Computer Hardware & Systems", credits=3, program_id=bit_prog.id, description="Basics of computer architecture, components, and OS installation.")
    it201 = Unit(code="IT201", name="Network Architectures", credits=3, program_id=bit_prog.id, description="Introduction to TCP/IP stack, routing protocols, subnets, and local area network setups.")
    
    db.session.add_all([cs101, se201, se311, se321, se401, it101, it201])
    db.session.commit()
    
    # 5. Create Users (Admin and Student)
    admin_user = User(username="admin", email="admin@school.edu", role="admin")
    admin_user.set_password("admin123")
    
    student_user = User(username="student", email="student@school.edu", role="student")
    student_user.set_password("student123")
    
    db.session.add_all([admin_user, student_user])
    db.session.commit()
    
    # 6. Create Student Profile
    student_profile = Student(
        user_id=student_user.id,
        registration_no="REG/2026/0001",
        first_name="John",
        last_name="Doe",
        gender="Male",
        phone="+1234567890",
        program_id=bse_prog.id,
        status="active"
    )
    db.session.add(student_profile)
    db.session.commit()
    
    # 7. Create past APPROVED registration for CS101 so John Doe meets prerequisites for SE201
    past_reg = Registration(
        student_id=student_profile.id,
        unit_id=cs101.id,
        session_id=past_session.id,
        status="approved" # Already completed in a past semester
    )
    
    # Pre-register some pending units for the active session to demonstrate the dashboard
    pending_reg1 = Registration(
        student_id=student_profile.id,
        unit_id=se321.id,
        session_id=active_session.id,
        status="pending"
    )
    
    db.session.add_all([past_reg, pending_reg1])
    db.session.commit()
    
    # 8. Create Audit log entry
    log = AuditLog(
        user_id=admin_user.id,
        action="seed_database",
        target_table="user",
        details="System pre-seeded with mock data.",
        ip_address="127.0.0.1"
    )
    db.session.add(log)
    db.session.commit()
    
    print("Database seeding completed.")

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
