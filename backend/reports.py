import io
import csv
from flask import Blueprint, send_file, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from models import Student, Registration, Unit, AcademicSession, Department, Program
from auth import role_required, log_activity

reports_bp = Blueprint('reports', __name__)

# ==========================================
# 1. STUDENT REGISTRATION SLIP (PDF)
# ==========================================
@reports_bp.route('/registration-slip/<int:student_id>', methods=['GET'])
@jwt_required()
def download_registration_slip(student_id):
    claims = get_jwt()
    role = claims.get('role')
    current_user_id = int(get_jwt_identity())
    
    student = Student.query.get_or_404(student_id)
    
    # Auth check: Student itself or Admin
    if role != 'admin' and student.user_id != current_user_id:
        return jsonify({"error": "Unauthorized"}), 403
        
    active_session = AcademicSession.query.filter_by(is_active=True).first()
    if not active_session:
        return jsonify({"error": "No active academic session"}), 400
        
    registrations = Registration.query.filter_by(
        student_id=student_id, 
        session_id=active_session.id
    ).all()
    
    # Setup PDF Buffer
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1E3A8A'), # Navy
        alignment=1 # Centered
    )
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#4B5563'),
        alignment=1
    )
    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E3A8A'),
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1F2937')
    )
    table_header = ParagraphStyle(
        'TableHeaderStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=colors.white
    )
    
    story = []
    
    # Header Section
    story.append(Paragraph("STUDENT REGISTRATION SYSTEM", title_style))
    story.append(Paragraph(f"Official Unit Registration Slip - {active_session.name}", subtitle_style))
    story.append(Spacer(1, 15))
    
    # Student Details Grid
    details_data = [
        [
            Paragraph(f"<b>Student Name:</b> {student.first_name} {student.last_name}", body_style),
            Paragraph(f"<b>Reg No:</b> {student.registration_no}", body_style)
        ],
        [
            Paragraph(f"<b>Department:</b> {student.program.department.name if student.program else 'N/A'}", body_style),
            Paragraph(f"<b>Program:</b> {student.program.name if student.program else 'N/A'}", body_style)
        ],
        [
            Paragraph(f"<b>Email:</b> {student.user.email}", body_style),
            Paragraph(f"<b>Date Printed:</b> {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}", body_style)
        ]
    ]
    
    details_table = Table(details_data, colWidths=[270, 270])
    details_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('LINEBELOW', (0,-1), (-1,-1), 1, colors.HexColor('#E5E7EB')),
    ]))
    
    story.append(details_table)
    story.append(Spacer(1, 20))
    
    # Units List Table
    story.append(Paragraph("Registered Units", section_title))
    
    headers = [
        Paragraph("Unit Code", table_header),
        Paragraph("Unit Name", table_header),
        Paragraph("Credits", table_header),
        Paragraph("Status", table_header)
    ]
    
    table_data = [headers]
    total_credits = 0
    
    for r in registrations:
        status_color = '#10B981' if r.status == 'approved' else '#F59E0B' if r.status == 'pending' else '#EF4444'
        status_text = f"<b><font color='{status_color}'>{r.status.upper()}</font></b>"
        
        table_data.append([
            Paragraph(r.unit.code, body_style),
            Paragraph(r.unit.name, body_style),
            Paragraph(str(r.unit.credits), body_style),
            Paragraph(status_text, body_style)
        ])
        if r.status in ['approved', 'pending']:
            total_credits += r.unit.credits
            
    # Add Total Credits Row
    table_data.append([
        Paragraph("<b>Total Course Load:</b>", body_style),
        Paragraph("", body_style),
        Paragraph(f"<b>{total_credits} Credits</b>", body_style),
        Paragraph("", body_style)
    ])
    
    units_table = Table(table_data, colWidths=[90, 270, 80, 100])
    units_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-2), 0.5, colors.HexColor('#E5E7EB')),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#F3F4F6')),
        ('LINEABOVE', (0,-1), (-1,-1), 1.5, colors.HexColor('#1E3A8A')),
    ]))
    
    story.append(units_table)
    story.append(Spacer(1, 40))
    
    # Signatures block
    sig_data = [
        [Paragraph("_____________________________<br/><b>Student Signature</b>", body_style),
         Paragraph("_____________________________<br/><b>Registrar Stamp & Signature</b>", body_style)]
    ]
    sig_table = Table(sig_data, colWidths=[270, 270])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(sig_table)
    
    # Build Document
    doc.build(story)
    buffer.seek(0)
    
    log_activity(current_user_id, "download_slip", "registration", f"Downloaded registration slip for student {student.registration_no}")
    
    filename = f"Registration_Slip_{student.registration_no.replace('/', '_')}.pdf"
    return send_file(
        buffer, 
        mimetype='application/pdf', 
        as_attachment=True, 
        download_name=filename
    )

# ==========================================
# 2. CLASS LIST REPORT (CSV / PDF)
# ==========================================
@reports_bp.route('/class-list/<int:unit_id>/csv', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_class_list_csv(unit_id):
    unit = Unit.query.get_or_404(unit_id)
    active_session = AcademicSession.query.filter_by(is_active=True).first()
    
    if not active_session:
        return jsonify({"error": "No active academic session"}), 400
        
    registrations = Registration.query.filter_by(
        unit_id=unit_id,
        session_id=active_session.id
    ).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write metadata
    writer.writerow([f"Class List: {unit.code} - {unit.name}"])
    writer.writerow([f"Academic Session: {active_session.name}"])
    writer.writerow([f"Total Registered Students: {len(registrations)}"])
    writer.writerow([])
    
    # Write table header
    writer.writerow(["Student Reg No", "First Name", "Last Name", "Gender", "Program", "Status"])
    
    for r in registrations:
        writer.writerow([
            r.student.registration_no,
            r.student.first_name,
            r.student.last_name,
            r.student.gender or "",
            r.student.program.code if r.student.program else "N/A",
            r.status.upper()
        ])
        
    output.seek(0)
    buffer = io.BytesIO(output.getvalue().encode('utf-8'))
    
    log_activity(int(get_jwt_identity()), "download_class_list_csv", "unit", f"Downloaded class list CSV for unit {unit.code}")
    
    return send_file(
        buffer,
        mimetype='text/csv',
        as_attachment=True,
        download_name=f"ClassList_{unit.code}_{active_session.name.replace('/', '_')}.csv"
    )

@reports_bp.route('/class-list/<int:unit_id>/pdf', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_class_list_pdf(unit_id):
    unit = Unit.query.get_or_404(unit_id)
    active_session = AcademicSession.query.filter_by(is_active=True).first()
    
    if not active_session:
        return jsonify({"error": "No active academic session"}), 400
        
    registrations = Registration.query.filter_by(
        unit_id=unit_id,
        session_id=active_session.id
    ).all()
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'ClassTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1E3A8A'),
        alignment=1
    )
    meta_style = ParagraphStyle(
        'Meta',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#4B5563'),
        alignment=1
    )
    header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontSize=10,
        fontName='Helvetica-Bold',
        textColor=colors.white
    )
    cell_style = ParagraphStyle(
        'Cell',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#1F2937')
    )
    
    story = []
    
    story.append(Paragraph(f"CLASS REGISTER LIST", title_style))
    story.append(Paragraph(f"Unit: {unit.code} - {unit.name} ({unit.credits} Credits) | Session: {active_session.name}", meta_style))
    story.append(Spacer(1, 15))
    
    table_data = [[
        Paragraph("Reg No", header_style),
        Paragraph("Student Name", header_style),
        Paragraph("Gender", header_style),
        Paragraph("Program", header_style),
        Paragraph("Status", header_style)
    ]]
    
    for r in registrations:
        status_color = '#10B981' if r.status == 'approved' else '#F59E0B' if r.status == 'pending' else '#EF4444'
        status_text = f"<b><font color='{status_color}'>{r.status.upper()}</font></b>"
        
        table_data.append([
            Paragraph(r.student.registration_no, cell_style),
            Paragraph(f"{r.student.first_name} {r.student.last_name}", cell_style),
            Paragraph(r.student.gender or "N/A", cell_style),
            Paragraph(r.student.program.code if r.student.program else "N/A", cell_style),
            Paragraph(status_text, cell_style)
        ])
        
    class_table = Table(table_data, colWidths=[110, 180, 70, 100, 80])
    class_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]),
    ]))
    
    story.append(class_table)
    doc.build(story)
    buffer.seek(0)
    
    log_activity(int(get_jwt_identity()), "download_class_list_pdf", "unit", f"Downloaded class list PDF for unit {unit.code}")
    
    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f"ClassList_{unit.code}_{active_session.name.replace('/', '_')}.pdf"
    )

# ==========================================
# 3. REGISTRATION SUMMARY REPORT (CSV / PDF)
# ==========================================
@reports_bp.route('/summary/csv', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_summary_csv():
    active_session = AcademicSession.query.filter_by(is_active=True).first()
    if not active_session:
        return jsonify({"error": "No active session"}), 400
        
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([f"System Registration Summary: {active_session.name}"])
    writer.writerow([f"Report Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}"])
    writer.writerow([])
    
    writer.writerow(["Student Reg No", "Student Name", "Program", "Unit Code", "Unit Name", "Credits", "Registration Status"])
    
    registrations = Registration.query.filter_by(session_id=active_session.id).all()
    for r in registrations:
        writer.writerow([
            r.student.registration_no,
            f"{r.student.first_name} {r.student.last_name}",
            r.student.program.code if r.student.program else "N/A",
            r.unit.code,
            r.unit.name,
            r.unit.credits,
            r.status.upper()
        ])
        
    output.seek(0)
    buffer = io.BytesIO(output.getvalue().encode('utf-8'))
    
    log_activity(int(get_jwt_identity()), "download_summary_csv", "registration", f"Downloaded summary CSV for session {active_session.name}")
    
    return send_file(
        buffer,
        mimetype='text/csv',
        as_attachment=True,
        download_name=f"RegistrationSummary_{active_session.name.replace('/', '_')}.csv"
    )

@reports_bp.route('/summary/pdf', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_summary_pdf():
    active_session = AcademicSession.query.filter_by(is_active=True).first()
    if not active_session:
        return jsonify({"error": "No active session"}), 400
        
    registrations = Registration.query.filter_by(session_id=active_session.id).all()
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter,
        rightMargin=30, leftMargin=30, topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'SummaryTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1E3A8A'),
        alignment=1
    )
    meta_style = ParagraphStyle(
        'Meta',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#4B5563'),
        alignment=1
    )
    header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontSize=9,
        fontName='Helvetica-Bold',
        textColor=colors.white
    )
    cell_style = ParagraphStyle(
        'Cell',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#1F2937')
    )
    
    story = []
    
    story.append(Paragraph("REGISTRATION SUMMARY REPORT", title_style))
    story.append(Paragraph(f"Academic Session: {active_session.name} | Total Records: {len(registrations)}", meta_style))
    story.append(Spacer(1, 15))
    
    table_data = [[
        Paragraph("Student Reg No", header_style),
        Paragraph("Student Name", header_style),
        Paragraph("Program", header_style),
        Paragraph("Unit Code", header_style),
        Paragraph("Unit Name", header_style),
        Paragraph("Credits", header_style),
        Paragraph("Status", header_style)
    ]]
    
    for r in registrations:
        status_color = '#10B981' if r.status == 'approved' else '#F59E0B' if r.status == 'pending' else '#EF4444'
        status_text = f"<b><font color='{status_color}'>{r.status.upper()}</font></b>"
        
        table_data.append([
            Paragraph(r.student.registration_no, cell_style),
            Paragraph(f"{r.student.first_name} {r.student.last_name}", cell_style),
            Paragraph(r.student.program.code if r.student.program else "N/A", cell_style),
            Paragraph(r.unit.code, cell_style),
            Paragraph(r.unit.name, cell_style),
            Paragraph(str(r.unit.credits), cell_style),
            Paragraph(status_text, cell_style)
        ])
        
    summary_table = Table(table_data, colWidths=[95, 110, 65, 60, 120, 45, 55])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]),
    ]))
    
    story.append(summary_table)
    doc.build(story)
    buffer.seek(0)
    
    log_activity(int(get_jwt_identity()), "download_summary_pdf", "registration", f"Downloaded summary PDF for session {active_session.name}")
    
    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f"RegistrationSummary_{active_session.name.replace('/', '_')}.pdf"
    )
