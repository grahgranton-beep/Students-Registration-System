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
    
    # Validation
    required_fields = ['username', 'email', 'password', 'registration_no', 'first_name', 'last_name', 'program_id']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400
            
    # Check if user already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already exists"}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 400
        
    if Student.query.filter_by(registration_no=data['registration_no']).first():
        return jsonify({"error": "Registration number already registered"}), 400

    try:
        # Create User
        user = User(
            username=data['username'],
            email=data['email'],
            role='student'
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.flush() # Get user.id
        
        # Parse date of birth
        dob = None
        if data.get('date_of_birth'):
            try:
                dob = datetime.datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            except ValueError:
                pass
        
        # Create Student Profile
        student = Student(
            user_id=user.id,
            registration_no=data['registration_no'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            gender=data.get('gender'),
            date_of_birth=dob,
            phone=data.get('phone'),
            program_id=int(data['program_id']),
            status='active'
        )
        db.session.add(student)
        db.session.commit()
        
        log_activity(user.id, "student_register", "student", f"Student registered: {student.registration_no}")
        
        return jsonify({"message": "Registration successful", "user": user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
        
    # Check by username or email
    user = User.query.filter((User.username == username) | (User.email == username)).first()
    
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
    user = User.query.get(int(user_id))
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
