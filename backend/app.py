import os
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
    
    # Configure CORS - allow all origins
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Configure JWT
    JWTManager(app)
    
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
        try:
            db.create_all()
            print("Database tables created/verified.")
        except Exception as e:
            print(f"Notice: db.create_all error: {e}")
        try:
            seed_database()
        except Exception as e:
            print(f"Notice: seed_database error: {e}")
        
    return app

def seed_database():
    print("Checking and seeding database with academic records...")
    
    # 1. Create Academic Sessions
    past_session = AcademicSession.query.filter_by(name="2024/2025 Semester 2").first()
    if not past_session:
        past_session = AcademicSession(name="2024/2025 Semester 2", is_active=False)
        db.session.add(past_session)
    active_session = AcademicSession.query.filter_by(name="2025/2026 Semester 1").first()
    if not active_session:
        active_session = AcademicSession(name="2025/2026 Semester 1", is_active=True)
        db.session.add(active_session)
    next_session = AcademicSession.query.filter_by(name="2025/2026 Semester 2").first()
    if not next_session:
        next_session = AcademicSession(name="2025/2026 Semester 2", is_active=False)
        db.session.add(next_session)
    db.session.commit()
    # Re-fetch after commit to get IDs
    past_session = AcademicSession.query.filter_by(name="2024/2025 Semester 2").first()
    active_session = AcademicSession.query.filter_by(name="2025/2026 Semester 1").first()

    # 2. Create Department
    cs_dept = Department.query.filter_by(code="CS").first()
    if not cs_dept:
        cs_dept = Department(code="CS", name="Computer Science")
        db.session.add(cs_dept)
    it_dept = Department.query.filter_by(code="IT").first()
    if not it_dept:
        it_dept = Department(code="IT", name="Information Technology")
        db.session.add(it_dept)
    db.session.commit()
    cs_dept = Department.query.filter_by(code="CS").first()
    it_dept = Department.query.filter_by(code="IT").first()

    # 3. Create Programs
    bse_prog = Program.query.filter_by(code="BSE").first()
    if not bse_prog:
        bse_prog = Program(code="BSE", name="Bachelor of Software Engineering", department_id=cs_dept.id)
        db.session.add(bse_prog)
    bcs_prog = Program.query.filter_by(code="BCS").first()
    if not bcs_prog:
        bcs_prog = Program(code="BCS", name="Bachelor of Computer Science", department_id=cs_dept.id)
        db.session.add(bcs_prog)
    bit_prog = Program.query.filter_by(code="BIT").first()
    if not bit_prog:
        bit_prog = Program(code="BIT", name="Bachelor of Information Technology", department_id=it_dept.id)
        db.session.add(bit_prog)
    db.session.commit()
    bse_prog = Program.query.filter_by(code="BSE").first()
    bcs_prog = Program.query.filter_by(code="BCS").first()
    bit_prog = Program.query.filter_by(code="BIT").first()

    # 4. Create Units
    cs101 = Unit.query.filter_by(code="CS101").first()
    if not cs101:
        cs101 = Unit(code="CS101", name="Introduction to Computer Science", credits=3, program_id=bse_prog.id,
                     description="Fundamentals of Computer Science and programming basics.")
        db.session.add(cs101)
    db.session.commit()
    cs101 = Unit.query.filter_by(code="CS101").first()

    math101 = Unit.query.filter_by(code="MATH101").first()
    if not math101:
        math101 = Unit(code="MATH101", name="Discrete Mathematics", credits=3, program_id=bse_prog.id,
                       description="Logic, sets, functions, combinatorics and graph theory.")
        db.session.add(math101)
    db.session.commit()

    se201 = Unit.query.filter_by(code="SE201").first()
    if not se201:
        se201 = Unit(code="SE201", name="Software Engineering Principles", credits=3, program_id=bse_prog.id,
                     description="Requirements engineering, design patterns, SDLC models.")
        db.session.add(se201)
    db.session.commit()
    se201 = Unit.query.filter_by(code="SE201").first()
    if se201 and cs101 and cs101 not in se201.prerequisites:
        se201.prerequisites.append(cs101)
    db.session.commit()

    se321 = Unit.query.filter_by(code="SE321").first()
    if not se321:
        se321 = Unit(code="SE321", name="Database Systems", credits=3, program_id=bse_prog.id,
                     description="Relational database design, SQL, normalization, transactions.")
        db.session.add(se321)
    db.session.commit()
    se321 = Unit.query.filter_by(code="SE321").first()

    cs301 = Unit.query.filter_by(code="CS301").first()
    if not cs301:
        cs301 = Unit(code="CS301", name="Data Structures & Algorithms", credits=3, program_id=bse_prog.id,
                     description="Arrays, linked lists, trees, graphs, sorting/searching algorithms.")
        db.session.add(cs301)
    web201 = Unit.query.filter_by(code="WEB201").first()
    if not web201:
        web201 = Unit(code="WEB201", name="Web Application Development", credits=3, program_id=bse_prog.id,
                      description="HTML, CSS, JavaScript, React, REST APIs.")
        db.session.add(web201)
    net201 = Unit.query.filter_by(code="NET201").first()
    if not net201:
        net201 = Unit(code="NET201", name="Computer Networks", credits=3, program_id=bse_prog.id,
                      description="TCP/IP, OSI model, network security fundamentals.")
        db.session.add(net201)
    db.session.commit()

    # 5. Create Admin User
    admin_user = User.query.filter_by(username="admin").first()
    if not admin_user:
        admin_user = User(username="admin", email="admin@school.edu", role="admin")
        admin_user.set_password("admin123")
        db.session.add(admin_user)
        db.session.commit()
    admin_user = User.query.filter_by(username="admin").first()

    # 6. Create Default Student User
    student_user = User.query.filter_by(username="student").first()
    if not student_user:
        student_user = User(username="student", email="student@school.edu", role="student")
        student_user.set_password("student123")
        db.session.add(student_user)
        db.session.flush()
        bse_prog = Program.query.filter_by(code="BSE").first()
        student_profile = Student(
            user_id=student_user.id,
            registration_no="REG/2025/0001",
            first_name="John",
            last_name="Doe",
            gender="Male",
            phone="+1234567890",
            program_id=bse_prog.id,
            status="active"
        )
        db.session.add(student_profile)
        db.session.commit()
    student_user = User.query.filter_by(username="student").first()
    student_profile = Student.query.filter_by(registration_no="REG/2025/0001").first()

    # 7. Create past APPROVED registration for CS101
    if student_profile and cs101 and past_session:
        past_reg = Registration.query.filter_by(student_id=student_profile.id, unit_id=cs101.id).first()
        if not past_reg:
            past_reg = Registration(
                student_id=student_profile.id,
                unit_id=cs101.id,
                session_id=past_session.id,
                status="approved"
            )
            db.session.add(past_reg)

    # Pre-register some pending units for the active session
    if student_profile and se321 and active_session:
        pending_reg1 = Registration.query.filter_by(student_id=student_profile.id, unit_id=se321.id).first()
        if not pending_reg1:
            pending_reg1 = Registration(
                student_id=student_profile.id,
                unit_id=se321.id,
                session_id=active_session.id,
                status="pending"
            )
            db.session.add(pending_reg1)
    db.session.commit()

    # 8. Create Audit log entry
    if admin_user:
        log = AuditLog.query.filter_by(action="seed_database").first()
        if not log:
            log = AuditLog(
                user_id=admin_user.id,
                action="seed_database",
                target_table="user",
                details="System pre-seeded with mock data.",
                ip_address="127.0.0.1"
            )
            db.session.add(log)
            db.session.commit()
    
    print("Database seeding / checks completed.")

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
