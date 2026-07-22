import os
try:
    import pymysql
    pymysql.install_as_MySQLdb()
except ImportError:
    pass
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
        try:
            db.create_all()
        except Exception as e:
            print(f"Notice: db.create_all skipped/warning: {e}")
        seed_database()
        
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
    db.session.commit() # Commit to get IDs
    
    # 2. Create Departments
    cs_dept = Department.query.filter_by(code="CS").first()
    if not cs_dept:
        cs_dept = Department(code="CS", name="Computer Science & IT")
        db.session.add(cs_dept)
    eng_dept = Department.query.filter_by(code="ENG").first()
    if not eng_dept:
        eng_dept = Department(code="ENG", name="Engineering & Technology")
        db.session.add(eng_dept)
    db.session.commit()
    
    # 3. Create Programs
    programs_data = [
        ("BSE", "B.Sc. Software Engineering", cs_dept.id),
        ("BIT", "B.Sc. Information Technology", cs_dept.id),
        ("BEE", "B.Sc. Electrical Engineering", eng_dept.id),
        ("BCS", "B.Sc. Computer Science", cs_dept.id),
        ("BGD", "B.Sc. Graphics Design", cs_dept.id),
        ("BSECT", "B.Sc. Computer Technology", cs_dept.id),
        ("BDS", "B.Sc. Data Science", cs_dept.id),
        ("BCY", "B.Sc. Cyber Security", cs_dept.id),
    ]
    programs = {}
    for code, name, dept_id in programs_data:
        prog = Program.query.filter_by(code=code).first()
        if not prog:
            prog = Program(code=code, name=name, department_id=dept_id)
            db.session.add(prog)
            print(f"Seeded program: {code} - {name}")
        programs[code] = prog
    db.session.commit()
    
    # Get references to programs
    bse_prog = programs["BSE"]
    bit_prog = programs["BIT"]
    bcs_prog = programs["BCS"]
    bgd_prog = programs["BGD"]
    
    # 4. Create Units (Subjects)
    # BSE units
    cs101 = Unit.query.filter_by(code="CS101").first()
    if not cs101:
        cs101 = Unit(code="CS101", name="Introduction to Programming", credits=3, program_id=bse_prog.id, description="Introduction to basic programming concepts, control flows, data types, and syntax using Python.")
        db.session.add(cs101)
    se102 = Unit.query.filter_by(code="SE102").first()
    if not se102:
        se102 = Unit(code="SE102", name="Discrete Mathematics for SE", credits=3, program_id=bse_prog.id, description="Mathematical foundations including logic, set theory, graph theory, and proof techniques.")
        db.session.add(se102)
    se103 = Unit.query.filter_by(code="SE103").first()
    if not se103:
        se103 = Unit(code="SE103", name="Professional Ethics & Tech Law", credits=3, program_id=bse_prog.id, description="Ethical considerations, data privacy, intellectual property, and compliance in tech.")
        db.session.add(se103)
    se201 = Unit.query.filter_by(code="SE201").first()
    if not se201:
        se201 = Unit(code="SE201", name="Software Design & Patterns", credits=4, program_id=bse_prog.id, description="Covers software development life cycle, OOP principles, and design patterns like MVC, Singleton, and Factory.")
        db.session.add(se201)
    se311 = Unit.query.filter_by(code="SE311").first()
    if not se311:
        se311 = Unit(code="SE311", name="Web Application Development", credits=3, program_id=bse_prog.id, description="Hands-on web technologies including HTML, CSS, JavaScript, React, and Flask API integrations.")
        db.session.add(se311)
    se321 = Unit.query.filter_by(code="SE321").first()
    if not se321:
        se321 = Unit(code="SE321", name="Database Systems & SQL", credits=3, program_id=bse_prog.id, description="Relational database design, normal forms, ER mapping, and writing optimized SQL queries in MySQL.")
        db.session.add(se321)
    se401 = Unit.query.filter_by(code="SE401").first()
    if not se401:
        se401 = Unit(code="SE401", name="Advanced Agentic Coding", credits=4, program_id=bse_prog.id, description="Advanced architectures, LLMs, autonomous software agents, system testing, and CI/CD pipelines.")
        db.session.add(se401)
    db.session.commit()
    
    # Add prerequisites relationship if not already added
    if cs101 and se201 and cs101 not in se201.prerequisites:
        se201.prerequisites.append(cs101)
    if se201 and se311 and se201 not in se311.prerequisites:
        se311.prerequisites.append(se201)
    if se311 and se401 and se311 not in se401.prerequisites:
        se401.prerequisites.append(se311)
    
    # BIT units
    it101 = Unit.query.filter_by(code="IT101").first()
    if not it101:
        it101 = Unit(code="IT101", name="Computer Hardware & Systems", credits=3, program_id=bit_prog.id, description="Basics of computer architecture, components, and OS installation.")
        db.session.add(it101)
    it201 = Unit.query.filter_by(code="IT201").first()
    if not it201:
        it201 = Unit(code="IT201", name="Network Architectures", credits=3, program_id=bit_prog.id, description="Introduction to TCP/IP stack, routing protocols, subnets, and local area network setups.")
        db.session.add(it201)
    it202 = Unit.query.filter_by(code="IT202").first()
    if not it202:
        it202 = Unit(code="IT202", name="System Administration", credits=3, program_id=bit_prog.id, description="Managing Linux and Windows server environments, user permissions, and services.")
        db.session.add(it202)
        
    # CS units
    cs102 = Unit.query.filter_by(code="CS102").first()
    if not cs102:
        cs102 = Unit(code="CS102", name="Data Structures & Algorithms", credits=3, program_id=bcs_prog.id, description="Fundamentals of data structures (arrays, trees, graphs) and algorithm analysis.")
        db.session.add(cs102)
    cs202 = Unit.query.filter_by(code="CS202").first()
    if not cs202:
        cs202 = Unit(code="CS202", name="Operating Systems", credits=3, program_id=bcs_prog.id, description="Core OS principles including processes, threads, memory management, and file systems.")
        db.session.add(cs202)
    cs301 = Unit.query.filter_by(code="CS301").first()
    if not cs301:
        cs301 = Unit(code="CS301", name="Artificial Intelligence & Machine Learning", credits=4, program_id=bcs_prog.id, description="Neural networks, supervised & unsupervised learning, and computer vision basics.")
        db.session.add(cs301)
        
    # GD units
    gd101 = Unit.query.filter_by(code="GD101").first()
    if not gd101:
        gd101 = Unit(code="GD101", name="Introduction to Digital Design", credits=3, program_id=bgd_prog.id, description="Basics of digital graphics, vector tools, and color theory.")
        db.session.add(gd101)
    gd201 = Unit.query.filter_by(code="GD201").first()
    if not gd201:
        gd201 = Unit(code="GD201", name="Typography & Layout", credits=3, program_id=bgd_prog.id, description="Principles of layout design, typography choice, and hierarchy in page design.")
        db.session.add(gd201)
    gd202 = Unit.query.filter_by(code="GD202").first()
    if not gd202:
        gd202 = Unit(code="GD202", name="UI/UX Prototyping", credits=3, program_id=bgd_prog.id, description="User experience research, wireframing, and interactive prototyping in Figma.")
        db.session.add(gd202)
    
    db.session.commit()
    
    # 5. Create Users (Admin and Student)
    admin_user = User.query.filter_by(username="admin").first()
    if not admin_user:
        admin_user = User(username="admin", email="admin@school.edu", role="admin")
        admin_user.set_password("admin123")
        db.session.add(admin_user)
    
    student_user = User.query.filter_by(username="student").first()
    if not student_user:
        student_user = User(username="student", email="student@school.edu", role="student")
        student_user.set_password("student123")
        db.session.add(student_user)
    db.session.commit()
    
    # 6. Create Student Profile
    student_profile = Student.query.filter_by(user_id=student_user.id).first()
    if not student_profile:
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
    past_reg = Registration.query.filter_by(student_id=student_profile.id, unit_id=cs101.id).first()
    if not past_reg:
        past_reg = Registration(
            student_id=student_profile.id,
            unit_id=cs101.id,
            session_id=past_session.id,
            status="approved" # Already completed in a past semester
        )
        db.session.add(past_reg)
    
    # Pre-register some pending units for the active session to demonstrate the dashboard
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

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
