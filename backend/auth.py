import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from functools import wraps
from models import db, User, Student, AuditLog

auth_bp = Blueprint('auth', __name__)

# Role decorator to restrict endpoints
def role_required(roles):
    if isinstance(roles, str):
        roles = [roles]
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            claims = get_jwt()
            role = claims.get('role')
            if role not in roles:
                return jsonify({"error": "Forbidden: Access denied for your role"}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Helper to log actions
def log_activity(user_id, action, target_table=None, details=None):
    try:
        ip = request.remote_addr
        log = AuditLog(
            user_id=user_id,
            action=action,
            target_table=target_table,
            details=details,
            ip_address=ip
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print(f"Failed to write audit log: {e}")
        db.session.rollback()

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    
    username = str(data.get('username', '')).strip()
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', '')).strip()
    registration_no = str(data.get('registration_no', '')).strip()
    first_name = str(data.get('first_name', '')).strip()
    last_name = str(data.get('last_name', '')).strip()
    program_id = data.get('program_id')
    
    if not username or not email or not password or not registration_no or not first_name or not last_name or not program_id:
        return jsonify({"error": "Missing required registration fields"}), 400
            
    # Check if user already exists
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400
        
    if Student.query.filter_by(registration_no=registration_no).first():
        return jsonify({"error": "Registration number already registered"}), 400

    try:
        # Create User
        user = User(
            username=username,
            email=email,
            role='student'
        )
        user.set_password(password)
        db.session.add(user)
        db.session.flush() # Get user.id
        
        # Parse date of birth
        dob = None
        if data.get('date_of_birth'):
            try:
                dob = datetime.datetime.strptime(str(data['date_of_birth']).strip(), '%Y-%m-%d').date()
            except ValueError:
                pass
        
        # Create Student Profile
        student = Student(
            user_id=user.id,
            registration_no=registration_no,
            first_name=first_name,
            last_name=last_name,
            gender=data.get('gender'),
            date_of_birth=dob,
            phone=str(data.get('phone', '')).strip() if data.get('phone') else None,
            program_id=int(program_id),
            status='active'
        )
        db.session.add(student)
        db.session.commit()
        
        log_activity(user.id, "student_register", "student", f"Student registered: {student.registration_no}")
        
        return jsonify({"message": "Registration successful", "user": user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

@auth_bp.route('/register-admin', methods=['POST'])
def register_admin():
    data = request.get_json() or {}
    
    username = str(data.get('username', '')).strip()
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', '')).strip()
    
    if not username or not email or not password:
        return jsonify({"error": "Missing required administrator registration fields"}), 400

    # Verify admin registration key (optional security feature, defaults to ADMIN2026 or admin123)
    admin_key = str(data.get('admin_key', '')).strip()
    valid_keys = ['', 'ADMIN2026', 'admin123', 'admin', 'SECRET_ADMIN_KEY']
    if admin_key and admin_key not in valid_keys:
        return jsonify({"error": "Invalid administrator authorization key"}), 403
        
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    try:
        user = User(
            username=username,
            email=email,
            role='admin'
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        log_activity(user.id, "admin_register", "user", f"Admin user created: {user.username}")
        
        return jsonify({"message": "Administrator account created successfully", "user": user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Admin registration failed: {str(e)}"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = str(data.get('username', '')).strip()
    password = str(data.get('password', '')).strip()
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
        
    # Check by username or email
    user = User.query.filter((User.username == username) | (User.email == username.lower())).first()
    
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401
        
    # Check if student is active
    student_id = None
    student_reg_no = None
    if user.role == 'student':
        student = Student.query.filter_by(user_id=user.id).first()
        if not student:
            return jsonify({"error": "Student profile not found"}), 400
        if student.status != 'active':
            return jsonify({"error": f"Student account is {student.status}"}), 403
        student_id = student.id
        student_reg_no = student.registration_no
        
    # Additional claims for role-based validation in JWT
    additional_claims = {
        "role": user.role,
        "student_id": student_id,
        "student_reg_no": student_reg_no
    }
    
    access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
    
    log_activity(user.id, "user_login", "user", f"User logged in: {user.username} as {user.role}")
    
    response_data = {
        "access_token": access_token,
        "user": user.to_dict()
    }
    if user.role == 'student':
        student = Student.query.filter_by(user_id=user.id).first()
        response_data["student"] = student.to_dict()
        
    return jsonify(response_data), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    response_data = {
        "user": user.to_dict()
    }
    if user.role == 'student':
        student = Student.query.filter_by(user_id=user.id).first()
        if student:
            response_data["student"] = student.to_dict()
            
    return jsonify(response_data), 200
