import asyncio
from aiosmtpd.controller import Controller
import requests

class CustomSMTPServer:
    async def handle_DATA(self, server, session, envelope):
        print(f"Received email from: {envelope.mail_from}")
        print("Message:")
        email_content = envelope.content.decode('utf-8')
        print(email_content)
        print("-" * 50)

        # Send the email content to the application server
        await self.send_email_to_application(email_content)

        # Respond to the client
        return '250 Message accepted for delivery'

    async def send_email_to_application(self, email_content):
        try:
            # Your application server address and port
            app_server_url = 'http://localhost:3000/receive-email'
            
            # Prepare the payload to send to the application server
            payload = {
                'sender': 'sender@example.com',  # Replace with actual sender
                'recipient': 'recipient@example.com',  # Replace with actual recipient
                'subject': 'Email Subject',  # Replace with actual subject
                'body': email_content
            }

            # Make a POST request to the application server
            response = requests.post(app_server_url, json=payload)

            # Check if the request was successful
            if response.status_code == 200:
                print("Email sent to application server successfully.")
            else:
                print(f"Failed to send email to application server. Status code: {response.status_code}")

        except Exception as e:
            print(f"Error sending email to application server: {e}")

async def run_server(stop_event):
    controller = Controller(CustomSMTPServer(), hostname='localhost', port=1025)
    controller.start()
    print("SMTP server started. Listening on port 1025...")
    await stop_event.wait()  # Wait for the stop event

    print("Stopping SMTP server...")
    controller.stop()
    await controller.wait_closed()
    print("SMTP server stopped.")

if __name__ == "__main__":
    stop_event = asyncio.Event()
    try:
        asyncio.run(run_server(stop_event))
    except KeyboardInterrupt:
        stop_event.set()  # Set the stop event when KeyboardInterrupt is received
