import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db, User, Student, Department, Program, Unit, AcademicSession, Registration, AuditLog
from auth import role_required, log_activity

api_bp = Blueprint('api', __name__)

# ==========================================
# DASHBOARD STATS (ADMIN)
# ==========================================
@api_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_stats():
    total_students = Student.query.count()
    pending_registrations = Registration.query.filter_by(status='pending').count()
    total_programs = Program.query.count()
    total_departments = Department.query.count()
    total_units = Unit.query.count()
    
    # Recent audits
    recent_logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(10).all()
    logs_list = [log.to_dict() for log in recent_logs]
    
    return jsonify({
        "stats": {
            "total_students": total_students,
            "pending_registrations": pending_registrations,
            "total_programs": total_programs,
            "total_departments": total_departments,
            "total_units": total_units
        },
        "recent_logs": logs_list
    }), 200

# ==========================================
# DEPARTMENTS CRUD
# ==========================================
@api_bp.route('/departments', methods=['GET'])
@jwt_required()
def get_departments():
    departments = Department.query.all()
    return jsonify([d.to_dict() for d in departments]), 200

@api_bp.route('/departments', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_department():
    data = request.get_json() or {}
    code = data.get('code')
    name = data.get('name')
    if not code or not name:
        return jsonify({"error": "Code and name are required"}), 400
    if Department.query.filter_by(code=code).first():
        return jsonify({"error": "Department code already exists"}), 400
        
    dep = Department(code=code, name=name)
    db.session.add(dep)
    db.session.commit()
    
    log_activity(int(get_jwt_identity()), "create_department", "department", f"Created department: {code} - {name}")
    return jsonify(dep.to_dict()), 201

@api_bp.route('/departments/<int:id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_department(id):
    dep = db.get_or_404(Department, id)
    data = request.get_json() or {}
    
    if data.get('code'):
        existing = Department.query.filter_by(code=data['code']).first()
        if existing and existing.id != id:
            return jsonify({"error": "Department code already exists"}), 400
        dep.code = data['code']
    if data.get('name'):
        dep.name = data['name']
        
    db.session.commit()
    log_activity(int(get_jwt_identity()), "update_department", "department", f"Updated department ID: {id}")
    return jsonify(dep.to_dict()), 200

@api_bp.route('/departments/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_department(id):
    dep = db.get_or_404(Department, id)
    db.session.delete(dep)
    db.session.commit()
    log_activity(int(get_jwt_identity()), "delete_department", "department", f"Deleted department ID: {id}")
    return jsonify({"message": "Department deleted successfully"}), 200

# ==========================================
# PROGRAMS CRUD
# ==========================================
@api_bp.route('/programs', methods=['GET'])
def get_programs():
    programs = Program.query.all()
    return jsonify([p.to_dict() for p in programs]), 200

@api_bp.route('/programs', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_program():
    data = request.get_json() or {}
    code = data.get('code')
    name = data.get('name')
    department_id = data.get('department_id')
    
    if not code or not name or not department_id:
        return jsonify({"error": "Code, name, and department_id are required"}), 400
    if Program.query.filter_by(code=code).first():
        return jsonify({"error": "Program code already exists"}), 400
    if not db.session.get(Department, department_id):
        return jsonify({"error": "Department not found"}), 400
        
    prog = Program(code=code, name=name, department_id=int(department_id))
    db.session.add(prog)
    db.session.commit()
    
    log_activity(int(get_jwt_identity()), "create_program", "program", f"Created program: {code}")
    return jsonify(prog.to_dict()), 201

@api_bp.route('/programs/<int:id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_program(id):
    prog = db.get_or_404(Program, id)
    data = request.get_json() or {}
    
    if data.get('code'):
        existing = Program.query.filter_by(code=data['code']).first()
        if existing and existing.id != id:
            return jsonify({"error": "Program code already exists"}), 400
        prog.code = data['code']
    if data.get('name'):
        prog.name = data['name']
    if data.get('department_id'):
        if not db.session.get(Department, data['department_id']):
            return jsonify({"error": "Department not found"}), 400
        prog.department_id = int(data['department_id'])
        
    db.session.commit()
    log_activity(int(get_jwt_identity()), "update_program", "program", f"Updated program ID: {id}")
    return jsonify(prog.to_dict()), 200

@api_bp.route('/programs/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_program(id):
    prog = db.get_or_404(Program, id)
    db.session.delete(prog)
    db.session.commit()
    log_activity(int(get_jwt_identity()), "delete_program", "program", f"Deleted program ID: {id}")
    return jsonify({"message": "Program deleted successfully"}), 200

# ==========================================
# UNITS CRUD
# ==========================================
@api_bp.route('/units', methods=['GET'])
@jwt_required()
def get_units():
    program_id = request.args.get('program_id')
    if program_id:
        units = Unit.query.filter_by(program_id=int(program_id)).all()
        if not units:
            # Fallback: return all available units if custom program units are empty
            units = Unit.query.all()
    else:
        units = Unit.query.all()
    return jsonify([u.to_dict() for u in units]), 200

@api_bp.route('/units', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_unit():
    data = request.get_json() or {}
    code = data.get('code')
    name = data.get('name')
    program_id = data.get('program_id')
    credits = data.get('credits', 3)
    prerequisite_ids = data.get('prerequisite_ids', []) # List of Unit IDs
    
    if not code or not name or not program_id:
        return jsonify({"error": "Code, name, and program_id are required"}), 400
    if Unit.query.filter_by(code=code).first():
        return jsonify({"error": "Unit code already exists"}), 400
    if not db.session.get(Program, program_id):
        return jsonify({"error": "Program not found"}), 400
        
    unit = Unit(
        code=code,
        name=name,
        program_id=int(program_id),
        description=data.get('description'),
        credits=int(credits)
    )
    
    # Add prerequisites
    if prerequisite_ids:
        prereqs = Unit.query.filter(Unit.id.in_(prerequisite_ids)).all()
        unit.prerequisites.extend(prereqs)
        
    db.session.add(unit)
    db.session.commit()
    
    log_activity(int(get_jwt_identity()), "create_unit", "unit", f"Created unit: {code}")
    return jsonify(unit.to_dict()), 201

@api_bp.route('/units/<int:id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_unit(id):
    unit = db.get_or_404(Unit, id)
    data = request.get_json() or {}
    
    if data.get('code'):
        existing = Unit.query.filter_by(code=data['code']).first()
        if existing and existing.id != id:
            return jsonify({"error": "Unit code already exists"}), 400
        unit.code = data['code']
    if data.get('name'):
        unit.name = data['name']
    if data.get('program_id'):
        if not db.session.get(Program, data['program_id']):
            return jsonify({"error": "Program not found"}), 400
        unit.program_id = int(data['program_id'])
    if 'credits' in data:
        unit.credits = int(data['credits'])
    if 'description' in data:
        unit.description = data['description']
        
    # Update prerequisites
    if 'prerequisite_ids' in data:
        unit.prerequisites.clear()
        prerequisite_ids = data['prerequisite_ids']
        if prerequisite_ids:
            # Prevent circular or self dependency
            if id in prerequisite_ids:
                return jsonify({"error": "A unit cannot be its own prerequisite"}), 400
            prereqs = Unit.query.filter(Unit.id.in_(prerequisite_ids)).all()
            unit.prerequisites.extend(prereqs)
            
    db.session.commit()
    log_activity(int(get_jwt_identity()), "update_unit", "unit", f"Updated unit ID: {id}")
    return jsonify(unit.to_dict()), 200

@api_bp.route('/units/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_unit(id):
    unit = db.get_or_404(Unit, id)
    db.session.delete(unit)
    db.session.commit()
    log_activity(int(get_jwt_identity()), "delete_unit", "unit", f"Deleted unit ID: {id}")
    return jsonify({"message": "Unit deleted successfully"}), 200

# ==========================================
# ACADEMIC SESSIONS CRUD
# ==========================================
@api_bp.route('/sessions', methods=['GET'])
def get_sessions():
    sessions = AcademicSession.query.all()
    return jsonify([s.to_dict() for s in sessions]), 200

@api_bp.route('/sessions', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_session():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({"error": "Session name is required"}), 400
    if AcademicSession.query.filter_by(name=name).first():
        return jsonify({"error": "Session name already exists"}), 400
        
    sess = AcademicSession(name=name, is_active=data.get('is_active', False))
    if sess.is_active:
        # Deactivate all others
        AcademicSession.query.update({AcademicSession.is_active: False})
        
    db.session.add(sess)
    db.session.commit()
    
    log_activity(int(get_jwt_identity()), "create_session", "academic_session", f"Created session: {name}")
    return jsonify(sess.to_dict()), 201

@api_bp.route('/sessions/<int:id>/activate', methods=['PUT'])
@jwt_required()
@role_required('admin')
def activate_session(id):
    sess = db.get_or_404(AcademicSession, id)
    
    # Deactivate all others, activate this
    AcademicSession.query.update({AcademicSession.is_active: False})
    sess.is_active = True
    db.session.commit()
    
    log_activity(int(get_jwt_identity()), "activate_session", "academic_session", f"Activated session ID: {id}")
    return jsonify(sess.to_dict()), 200

@api_bp.route('/sessions/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_session(id):
    sess = db.get_or_404(AcademicSession, id)
    if sess.is_active:
        return jsonify({"error": "Cannot delete the active session"}), 400
    db.session.delete(sess)
    db.session.commit()
    log_activity(int(get_jwt_identity()), "delete_session", "academic_session", f"Deleted session ID: {id}")
    return jsonify({"message": "Session deleted successfully"}), 200

# ==========================================
# STUDENTS CRUD (ADMIN)
# ==========================================
@api_bp.route('/students', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_students():
    students = Student.query.all()
    return jsonify([s.to_dict() for s in students]), 200

@api_bp.route('/students/<int:id>', methods=['GET'])
@jwt_required()
def get_student_by_id(id):
    student = db.get_or_404(Student, id)
    
    # Check if student is querying their own data or is admin
    claims = get_jwt()
    current_user_id = int(get_jwt_identity())
    if claims.get('role') != 'admin' and student.user_id != current_user_id:
        return jsonify({"error": "Access denied"}), 403
        
    return jsonify(student.to_dict()), 200

@api_bp.route('/students', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_student():
    data = request.get_json() or {}
    
    required = ['username', 'email', 'password', 'registration_no', 'first_name', 'last_name', 'program_id']
    for req in required:
        if not data.get(req):
            return jsonify({"error": f"Missing field: {req}"}), 400
            
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already exists"}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 400
    if Student.query.filter_by(registration_no=data['registration_no']).first():
        return jsonify({"error": "Registration number already registered"}), 400
    if not db.session.get(Program, data['program_id']):
        return jsonify({"error": "Program not found"}), 400
        
    try:
        user = User(username=data['username'], email=data['email'], role='student')
        user.set_password(data['password'])
        db.session.add(user)
        db.session.flush()
        
        dob = None
        if data.get('date_of_birth'):
            dob = datetime.datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            
        student = Student(
            user_id=user.id,
            registration_no=data['registration_no'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            gender=data.get('gender'),
            date_of_birth=dob,
            phone=data.get('phone'),
            program_id=int(data['program_id']),
            status=data.get('status', 'active')
        )
        db.session.add(student)
        db.session.commit()
        
        log_activity(int(get_jwt_identity()), "create_student", "student", f"Admin created student: {student.registration_no}")
        return jsonify(student.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api_bp.route('/students/<int:id>', methods=['PUT'])
@jwt_required()
def update_student(id):
    student = db.get_or_404(Student, id)
    
    # Restrict edit to Admin or owner
    claims = get_jwt()
    current_user_id = int(get_jwt_identity())
    is_admin = (claims.get('role') == 'admin')
    if not is_admin and student.user_id != current_user_id:
        return jsonify({"error": "Access denied"}), 403
        
    data = request.get_json() or {}
    
    try:
        # Edit user account details
        user = student.user
        if data.get('email') and data['email'] != user.email:
            if User.query.filter_by(email=data['email']).first():
                return jsonify({"error": "Email already in use"}), 400
            user.email = data['email']
            
        if data.get('password'):
            user.set_password(data['password'])
            
        # Edit Student details
        if data.get('first_name'):
            student.first_name = data['first_name']
        if data.get('last_name'):
            student.last_name = data['last_name']
        if 'gender' in data:
            student.gender = data['gender']
        if 'phone' in data:
            student.phone = data['phone']
        if 'date_of_birth' in data and data['date_of_birth']:
            student.date_of_birth = datetime.datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            
        # Admin-only student modifications
        if is_admin:
            if data.get('registration_no') and data['registration_no'] != student.registration_no:
                if Student.query.filter_by(registration_no=data['registration_no']).first():
                    return jsonify({"error": "Registration number already in use"}), 400
                student.registration_no = data['registration_no']
            if data.get('program_id'):
                if not db.session.get(Program, data['program_id']):
                    return jsonify({"error": "Program not found"}), 400
                student.program_id = int(data['program_id'])
            if data.get('status'):
                student.status = data['status']
                
        db.session.commit()
        log_activity(current_user_id, "update_student", "student", f"Updated student profile ID: {id}")
        return jsonify(student.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api_bp.route('/students/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_student(id):
    student = db.get_or_404(Student, id)
    user = student.user
    db.session.delete(student)
    db.session.delete(user)
    db.session.commit()
    log_activity(int(get_jwt_identity()), "delete_student", "student", f"Deleted student & user ID: {id}")
    return jsonify({"message": "Student deleted successfully"}), 200

# ==========================================
# REGISTRATIONS BUSINESS LOGIC & ENDPOINTS
# ==========================================
@api_bp.route('/registrations', methods=['GET'])
@jwt_required()
def get_registrations():
    claims = get_jwt()
    role = claims.get('role')
    session_id = request.args.get('session_id')
    
    if role == 'admin':
        # Admin gets everything, with filters
        query = Registration.query
        if session_id:
            query = query.filter_by(session_id=int(session_id))
        registrations = query.all()
    else:
        # Student only gets their own
        student_id = claims.get('student_id')
        query = Registration.query.filter_by(student_id=student_id)
        if session_id:
            query = query.filter_by(session_id=int(session_id))
        registrations = query.all()
        
    return jsonify([r.to_dict() for r in registrations]), 200

@api_bp.route('/registrations', methods=['POST'])
@jwt_required()
def register_units():
    claims = get_jwt()
    role = claims.get('role')
    user_id = int(get_jwt_identity())
    
    # Resolve student ID
    if role == 'admin':
        data = request.get_json() or {}
        student_id = data.get('student_id')
        unit_ids = data.get('unit_ids', [])
    else:
        student_id = claims.get('student_id')
        data = request.get_json() or {}
        unit_ids = data.get('unit_ids', [])
        
    if not student_id:
        return jsonify({"error": "Student ID is required"}), 400
    if not unit_ids:
        return jsonify({"error": "No units selected for registration"}), 400
        
    student = db.session.get(Student, student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    if student.status != 'active':
        return jsonify({"error": f"Student status is '{student.status}'. Registration forbidden."}), 400
        
    # Get active session
    active_session = AcademicSession.query.filter_by(is_active=True).first()
    if not active_session:
        return jsonify({"error": "No active academic session found for registration"}), 400
        
    units = Unit.query.filter(Unit.id.in_(unit_ids)).all()
    if len(units) != len(unit_ids):
        return jsonify({"error": "Some selected units do not exist"}), 400
        
    # 1. DUPLICATE PREVENTION: Check if already registered in active session
    existing_regs = Registration.query.filter_by(student_id=student_id, session_id=active_session.id).all()
    existing_unit_ids = {r.unit_id for r in existing_regs}
    
    # 2. CREDIT LIMIT CHECK (18 credits maximum)
    current_credits = sum(r.unit.credits for r in existing_regs if r.status in ['approved', 'pending'])
    new_credits = sum(u.credits for u in units)
    total_credits = current_credits + new_credits
    
    if total_credits > 18:
        return jsonify({
            "error": f"Credit limit exceeded. Current: {current_credits} credits, Selected: {new_credits} credits. Maximum allowed: 18 credits."
        }), 400
        
    # Get past approved registrations for prerequisite checking
    approved_regs = Registration.query.filter_by(student_id=student_id, status='approved').all()
    approved_unit_ids = {r.unit_id for r in approved_regs}
    
    # 3. PREREQUISITE CHECKS
    prereq_errors = []
    for unit in units:
        if unit.id in existing_unit_ids:
            prereq_errors.append(f"Already registered for {unit.code} ({unit.name}) in this session.")
            continue
            
        for prereq in unit.prerequisites:
            if prereq.id not in approved_unit_ids:
                prereq_errors.append(f"Prerequisite unit '{prereq.code}' for '{unit.code}' has not been completed/approved.")
                
    if prereq_errors:
        return jsonify({"error": "Business rule validations failed", "details": prereq_errors}), 400
        
    # If validations pass, save registrations
    try:
        new_registrations = []
        for unit in units:
            reg = Registration(
                student_id=student_id,
                unit_id=unit.id,
                session_id=active_session.id,
                status='pending' # Default to pending, admin must approve
            )
            db.session.add(reg)
            new_registrations.append(reg)
            
        db.session.commit()
        
        log_activity(
            user_id,
            "register_units",
            "registration",
            f"Registered units {', '.join([u.code for u in units])} for student ID: {student_id}"
        )
        return jsonify([r.to_dict() for r in new_registrations]), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to register: {str(e)}"}), 500

@api_bp.route('/registrations/<int:id>/status', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_registration_status(id):
    reg = db.get_or_404(Registration, id)
    data = request.get_json() or {}
    status = data.get('status')
    
    if status not in ['approved', 'rejected', 'pending']:
        return jsonify({"error": "Invalid registration status"}), 400
        
    reg.status = status
    db.session.commit()
    
    log_activity(
        int(get_jwt_identity()),
        "update_registration_status",
        "registration",
        f"Updated registration ID {id} status to '{status}' for student ID {reg.student_id}"
    )
    return jsonify(reg.to_dict()), 200

@api_bp.route('/registrations/bulk-status', methods=['PUT'])
@jwt_required()
@role_required('admin')
def bulk_update_registration_status():
    """Approve or reject multiple registrations at once."""
    data = request.get_json() or {}
    ids = data.get('ids', [])
    status = data.get('status')
    
    if status not in ['approved', 'rejected', 'pending']:
        return jsonify({"error": "Invalid status. Use 'approved', 'rejected', or 'pending'."}), 400
    if not ids:
        return jsonify({"error": "No registration IDs provided."}), 400
    
    updated = Registration.query.filter(Registration.id.in_(ids)).all()
    if not updated:
        return jsonify({"error": "No matching registrations found."}), 404
    
    for reg in updated:
        reg.status = status
    db.session.commit()
    
    user_id = int(get_jwt_identity())
    log_activity(
        user_id,
        "bulk_update_registration_status",
        "registration",
        f"Bulk updated {len(updated)} registrations to '{status}' (IDs: {ids})"
    )
    return jsonify({"updated": len(updated), "status": status}), 200

@api_bp.route('/registrations/<int:id>', methods=['DELETE'])
@jwt_required()
def drop_registration(id):
    reg = db.get_or_404(Registration, id)
    claims = get_jwt()
    role = claims.get('role')
    user_id = int(get_jwt_identity())
    
    if role != 'admin':
        student_id = claims.get('student_id')
        if reg.student_id != student_id:
            return jsonify({"error": "Access denied"}), 403
        if reg.status != 'pending':
            return jsonify({"error": "Cannot drop an approved or rejected registration"}), 400
            
    db.session.delete(reg)
    db.session.commit()
    
    log_activity(user_id, "drop_registration", "registration", f"Dropped registration ID {id}")
    return jsonify({"message": "Registration dropped successfully"}), 200

# ==========================================
# AUDIT LOGS (ADMIN ONLY)
# ==========================================
@api_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_audit_logs():
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).all()
    return jsonify([log.to_dict() for log in logs]), 200
