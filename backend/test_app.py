import unittest
import json
import datetime
from app import create_app, db
from config import Config
from models import User, Student, Department, Program, Unit, AcademicSession, Registration

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_SECRET_KEY = 'test-jwt-secret-key-minimum-32-bytes'

class StudentRegistrationSystemTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def get_token(self, username, password):
        res = self.client.post('/api/auth/login', json={
            "username": username,
            "password": password
        })
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data.decode('utf-8'))
        return data['access_token']

    def test_password_hashing(self):
        user = User(username="test_user", email="test@user.com", role="student")
        user.set_password("mypassword")
        db.session.add(user)
        db.session.commit()
        
        self.assertTrue(user.check_password("mypassword"))
        self.assertFalse(user.check_password("wrongpassword"))

    def test_student_login_and_roles(self):
        # Admin User exists from seed
        admin_token = self.get_token("admin", "admin123")
        self.assertIsNotNone(admin_token)
        
        # Test student login
        student_token = self.get_token("student", "student123")
        self.assertIsNotNone(student_token)
        
        # Admin-only endpoint with student token -> Should get 403
        res = self.client.post('/api/departments', json={
            "code": "TEST",
            "name": "Test Department"
        }, headers={"Authorization": f"Bearer {student_token}"})
        self.assertEqual(res.status_code, 403)
        
        # Admin-only endpoint with admin token -> Should succeed (201)
        res = self.client.post('/api/departments', json={
            "code": "TEST",
            "name": "Test Department"
        }, headers={"Authorization": f"Bearer {admin_token}"})
        self.assertEqual(res.status_code, 201)

    def test_registration_business_rules(self):
        # We need a student, units, and sessions setup.
        # Seed has already set up:
        # Student 'student' (John Doe) registered for CS101 (Approved in past session)
        # Session: 2025/2026 Semester 1 (Active)
        
        student = Student.query.filter_by(registration_no="REG/2026/0001").first()
        student_token = self.get_token("student", "student123")
        admin_token = self.get_token("admin", "admin123")
        
        # Let's check available units
        cs101 = Unit.query.filter_by(code="CS101").first()
        se201 = Unit.query.filter_by(code="SE201").first()
        se311 = Unit.query.filter_by(code="SE311").first()
        se321 = Unit.query.filter_by(code="SE321").first()
        
        # Rule 1: Prerequisite check
        # John Doe has CS101 approved. 
        # SE201 has prerequisite CS101. So John Doe SHOULD be able to register for SE201.
        # SE311 has prerequisite SE201. John Doe DOES NOT have SE201 approved yet. 
        # So John Doe SHOULD NOT be able to register for SE311.
        
        # Attempt to register for SE311 (Prerequisite mismatch)
        res = self.client.post('/api/registrations', json={
            "unit_ids": [se311.id]
        }, headers={"Authorization": f"Bearer {student_token}"})
        
        self.assertEqual(res.status_code, 400)
        data = json.loads(res.data.decode('utf-8'))
        self.assertIn("Prerequisite unit 'SE201' for 'SE311' has not been completed/approved.", data['details'][0])
        
        # Register for SE201 (Should succeed)
        res = self.client.post('/api/registrations', json={
            "unit_ids": [se201.id]
        }, headers={"Authorization": f"Bearer {student_token}"})
        self.assertEqual(res.status_code, 201)
        
        # Rule 2: Duplicate Prevention
        # Attempt to register for SE201 again in the same active session
        res = self.client.post('/api/registrations', json={
            "unit_ids": [se201.id]
        }, headers={"Authorization": f"Bearer {student_token}"})
        self.assertEqual(res.status_code, 400)
        data = json.loads(res.data.decode('utf-8'))
        self.assertIn("Already registered for SE201", data['details'][0])

    def test_credit_load_limit(self):
        student_token = self.get_token("student", "student123")
        
        # John Doe's program is Software Engineering.
        # Let's create mock units with heavy credits to exceed 18 credits.
        bse = Program.query.filter_by(code="BSE").first()
        
        heavy_unit1 = Unit(code="HVY1", name="Heavy Course 1", credits=8, program_id=bse.id)
        heavy_unit2 = Unit(code="HVY2", name="Heavy Course 2", credits=8, program_id=bse.id)
        heavy_unit3 = Unit(code="HVY3", name="Heavy Course 3", credits=8, program_id=bse.id)
        
        db.session.add_all([heavy_unit1, heavy_unit2, heavy_unit3])
        db.session.commit()
        
        # John Doe has already a pending registration for SE321 (3 credits) from seed.
        # Registering for heavy_unit1 (8 credits) + heavy_unit2 (8 credits) -> 3 + 8 + 8 = 19 credits (exceeds 18)
        res = self.client.post('/api/registrations', json={
            "unit_ids": [heavy_unit1.id, heavy_unit2.id]
        }, headers={"Authorization": f"Bearer {student_token}"})
        
        self.assertEqual(res.status_code, 400)
        data = json.loads(res.data.decode('utf-8'))
        self.assertIn("Credit limit exceeded", data['error'])

if __name__ == '__main__':
    unittest.main()
