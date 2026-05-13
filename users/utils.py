from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os
from django.conf import settings
from datetime import datetime

def generate_certificate(enrollment):
    """Generate PDF Certificate"""
    filename = f"certificate_{enrollment.student.username}_{enrollment.course.id}.pdf"
    filepath = os.path.join(settings.MEDIA_ROOT, 'certificates', filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    c = canvas.Canvas(filepath, pagesize=letter)
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(300, 500, "Certificate of Completion")
    
    c.setFont("Helvetica", 20)
    c.drawCentredString(300, 420, f"This is to certify that")
    c.drawCentredString(300, 380, f"{enrollment.student.get_full_name() or enrollment.student.email}")
    c.drawCentredString(300, 340, f"has successfully completed the course")
    c.drawCentredString(300, 300, f"{enrollment.course.title}")
    
    c.setFont("Helvetica", 16)
    c.drawCentredString(300, 220, f"Issued on: {datetime.now().strftime('%d %B %Y')}")
    c.drawCentredString(300, 180, "LMS - Learning Management System")

    c.save()
    return f"certificates/{filename}"