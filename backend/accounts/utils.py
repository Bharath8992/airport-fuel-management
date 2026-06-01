# accounts/utils.py
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_otp_email(user, otp_code, otp_type='verification'):
    """
    Send OTP email to user
    """
    subject = f'Your OTP for {otp_type} - Airport Fuel Management'
    
    # HTML email template
    html_message = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 10px;
            }}
            .header {{
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                padding: 20px;
            }}
            .otp-code {{
                font-size: 32px;
                font-weight: bold;
                color: #1e3a8a;
                text-align: center;
                padding: 20px;
                background: #f0f0f0;
                border-radius: 5px;
                letter-spacing: 5px;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                padding: 20px;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #ddd;
            }}
            .warning {{
                color: #ff6b6b;
                font-size: 12px;
                text-align: center;
                margin-top: 10px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>✈️ Airport Fuel Management System</h2>
            </div>
            <div class="content">
                <h3>Hello {user.first_name or user.username}!</h3>
                <p>You have requested to {otp_type} your account. Please use the following OTP code to complete the process:</p>
                
                <div class="otp-code">
                    {otp_code}
                </div>
                
                <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                <p>If you didn't request this, please ignore this email or contact support.</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 Airport Fuel Management System. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    '''
    
    # Plain text version
    plain_message = f'''
    Hello {user.first_name or user.username}!
    
    You have requested to {otp_type} your account. Please use the following OTP code to complete the process:
    
    {otp_code}
    
    This OTP is valid for 10 minutes.
    
    If you didn't request this, please ignore this email or contact support.
    
    ---
    Airport Fuel Management System
    '''
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
            html_message=html_message
        )
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False