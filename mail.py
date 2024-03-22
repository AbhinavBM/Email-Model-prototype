import smtplib
from email.message import EmailMessage

def send_email_via_smtp():
    message = EmailMessage()
    message['Subject'] = 'Test Email'
    message['From'] = 'appa@gmail.com'
    message['To'] = 'mama@gmail.com'
    message.set_content("Drop in queries for FREE for mentors from Hindustan Times Group, Barclays, PwC, etc. to answer them!InboxUnstop Mentorships <noreply@dare2compete.news> Unsubscribe2:22 PM (4 hours ago)to meHi Abhinav,Imagine if all those questions in your head about your career, placement prep, resume and much more could be answered by top experts. For free. Sounds too good to be true, right? Not when you share your queries with mentors on Unstop who can help you find the right answers. 😎Start sharing queries with mentors for free!Here are a few more:Dhananjay Adodra - Senior Product Manager at PayU | ex-Tata CLiQ | FinTech, e-Commerce, Product LeadershipNaina Dasouni - Chief of Staff | Specializing in Startup Pre-series C | IIM IndoreNiranjan Tungare - Investment Banking Analyst at Bank of America | NMIMS | Ex-Dell TechnologiesHeenali Modi - Analyst at Barclays | Reliance Securities | MBA Finance IMT Nagpur | NMCCEJegannath Uma Maheswaran - Product Supply Manager - P&G | IIT Madras | Unstop B-School Leader'23 | National Winner - Infosys Ingenious'22 & 6 Bschool Competitions | Ex-WiproMentors from your favourite brands are now just a message away! Start dropping your queries for free and find the answer to all your dilemmas! Regards,Team Unstop ")

    # Connect to the SMTP server running on localhost:1025
    with smtplib.SMTP('localhost', 1025) as server:
        # Send the email message
        server.send_message(message)

if __name__ == "__main__":
    send_email_via_smtp()
