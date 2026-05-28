from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
from io import BytesIO
from django.core.files import File
from datetime import datetime

class InvoicePDFGenerator:
    @staticmethod
    def generate(invoice, transaction):
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72)
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            alignment=TA_CENTER,
            spaceAfter=30
        )
        
        story = []
        
        # Header
        story.append(Paragraph("AIRPORT FUEL MANAGEMENT SYSTEM", title_style))
        story.append(Paragraph("Fuel Supply Invoice", styles['Heading2']))
        story.append(Spacer(1, 20))
        
        # Invoice Details
        invoice_data = [
            ['Invoice Number:', invoice.invoice_number],
            ['Date:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
            ['Transaction ID:', transaction.transaction_number],
        ]
        
        invoice_table = Table(invoice_data, colWidths=[2*inch, 4*inch])
        invoice_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        story.append(invoice_table)
        story.append(Spacer(1, 20))
        
        # Supplier and Airline Details
        details_data = [
            ['Supplier Details', 'Airline Details'],
            [transaction.supplier.company_name, transaction.airline.airline_name],
            [transaction.supplier.address[:50], f"Code: {transaction.airline.airline_code}"],
            [f"GST: {transaction.supplier.gst_number}", f"Contact: {transaction.airline.contact_person}"],
            [f"Email: {transaction.supplier.email}", f"Phone: {transaction.airline.phone}"],
        ]
        
        details_table = Table(details_data, colWidths=[3*inch, 3*inch])
        details_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), colors.grey),
            ('BACKGROUND', (1, 0), (1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        story.append(details_table)
        story.append(Spacer(1, 20))
        
        # Transaction Details
        transaction_data = [
            ['Description', 'Details'],
            ['Fuel Type', transaction.get_fuel_type_display()],
            ['Quantity (Liters)', f"{transaction.quantity:,.2f}"],
            ['Price per Liter', f"₹{transaction.price_per_liter:,.2f}"],
            ['Subtotal', f"₹{transaction.subtotal:,.2f}"],
            [f'GST ({transaction.gst_rate}%)', f"₹{transaction.gst_amount:,.2f}"],
            ['Total Amount', f"₹{transaction.total_amount:,.2f}"],
        ]
        
        transaction_table = Table(transaction_data, colWidths=[2*inch, 3*inch])
        transaction_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        story.append(transaction_table)
        story.append(Spacer(1, 20))
        
        # Footer
        footer_text = f"""
        <para align="center">
        <font size=9>
        This is a computer generated invoice and does not require signature.<br/>
        Payment Terms: {transaction.airline.payment_terms} days<br/>
        For queries: accounts@airportfuel.com | +91-1234567890
        </font>
        </para>
        """
        story.append(Paragraph(footer_text, styles['Normal']))
        
        doc.build(story)
        buffer.seek(0)
        
        return File(buffer, name=f"invoice_{invoice.invoice_number}.pdf")