from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

import random
import requests
import re
import logging
from models import db, User, Attendance, Seed, Medicine, Expense, Weather, Calendar, Contact
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func


logging.basicConfig(level=logging.INFO)

app = Flask(__name__)


# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///farmers_app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_secret_key'  # Replace with a secure key
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # Token expiration time
db.init_app(app)
jwt = JWTManager(app)
CORS(app)

limiter = Limiter(get_remote_address, app=app)

FAST2SMS_API_KEY = '0xoIc5HCCGiFECuCb2PB7DD1W9q66fLLGCZ4K8tOsEB8PQHnSiCnaIjZyFMr2EH8yPXvaIDZ0j35sk4f7CQwGeiWp1cL6oUqz9RtJxdOMnmlFbZ4OX8BGg6qitVMxhWHIo2TANJ31nbP'  # Replace with your Fast2SMS API key

# Add this to store revoked tokens
revoked_tokens = set()

# Check if a token is revoked
@jwt.token_in_blocklist_loader

def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    return jti in revoked_tokens


def is_valid_mobile_number(mobile_number):
    return re.match(r'^\+91\d{10}$', mobile_number) is not None


# ---- User Authentication Endpoints ----
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        mobile_number = data.get('mobile_number')
        password = data.get('password')

        logging.info(f"Received registration data: username={username}, mobile_number={mobile_number}")

        if not username or not mobile_number or not password:
            logging.error("Missing required fields")
            return jsonify({'message': 'All fields are required'}), 400

        if User.query.filter_by(mobile_number=mobile_number).first() or User.query.filter_by(username=username).first():
            logging.error("User already exists")
            return jsonify({'message': 'User already exists'}), 400

        # Create a new user
        hashed_password = generate_password_hash(password)  # Hash the password
        new_user = User(username=username, mobile_number=mobile_number, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        logging.info("User registered successfully")
        return jsonify({'message': 'Registration successful'}), 201

    except Exception as e:
        logging.error(f"Error in registration: {e}")
        return jsonify({'message': 'An error occurred during registration'}), 500


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')  # Use username instead of mobile_number
    password = data.get('password')

    user = User.query.filter_by(username=username).first()  # Query by username
    if user and check_password_hash(user.password, password):  # Verify the hashed password
        access_token = create_access_token(identity=str(user.id))  # Convert user ID to string
        return jsonify({'message': 'Login successful', 'token': access_token}), 200
    return jsonify({'message': 'Invalid credentials'}), 401


@app.route('/forgot-password', methods=['POST'])
@limiter.limit("5 per minute")  # Allow 5 requests per minute
def forgot_password():
    try:
        data = request.get_json()
        mobile_number = data.get('mobile_number')
        logging.info(f"Forgot password request for mobile number: {mobile_number}")

        # Check if the mobile number exists in the database
        user = User.query.filter_by(mobile_number=mobile_number).first()
        if not user:
            logging.error(f"Mobile number {mobile_number} not found in the database")
            return jsonify({'message': 'Mobile number not found'}), 404

        # Generate a random OTP
        otp = random.randint(100000, 999999)
        logging.info(f"Generated OTP: {otp}")

        # Send OTP via Fast2SMS
        url = "https://www.fast2sms.com/dev/bulkV2"
        payload = {
            'authorization': FAST2SMS_API_KEY,
            'sender_id': 'FSTSMS',
            'message': f'Your OTP for password reset is: {otp}',
            'language': 'english',
            'route': 'p',
            'numbers': mobile_number
        }
        headers = {'cache-control': 'no-cache'}

        response = requests.post(url, data=payload, headers=headers)
        logging.info(f"Fast2SMS API response: {response.status_code}, {response.text}")

        if response.status_code != 200:
            logging.error("Failed to send OTP via Fast2SMS")
            return jsonify({'message': 'Failed to send OTP'}), 500

        # Save the OTP in the database
        user.reset_otp = otp
        db.session.commit()
        logging.info("OTP saved in the database successfully")

        return jsonify({'message': 'OTP sent to your mobile number'}), 200

    except Exception as e:
        logging.error(f"Error in forgot-password: {e}")
        return jsonify({'message': 'An error occurred while processing your request'}), 500


@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    mobile_number = data.get('mobile_number')
    otp = data.get('otp')
    new_password = data.get('new_password')

    # Check if the mobile number exists in the database
    user = User.query.filter_by(mobile_number=mobile_number).first_or_404(description='Mobile number not found')

    # Verify the OTP
    if user.reset_otp != otp:
        return jsonify({'message': 'Invalid OTP'}), 400

    # Update the user's password
    user.password = generate_password_hash(new_password)
    user.reset_otp = None  # Clear the OTP after successful verification
    db.session.commit()

    return jsonify({'message': 'Password reset successful'}), 200

@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        jti = get_jwt()['jti']  # Get the unique identifier for the token
        revoked_tokens.add(jti)  # Add the token to the revoked list
        return jsonify({'message': 'Logout successful'}), 200
    except Exception as e:
        logging.error(f"Error during logout: {e}")
        return jsonify({'message': 'Failed to logout'}), 500


@app.route('/protected', methods=['GET'])
@jwt_required()
def protected_route():
    current_user = get_jwt_identity()
    return jsonify({'message': f'Hello, user {current_user}'}), 200


# ---- Attendance Endpoints ----
@app.route('/attendance', methods=['GET', 'POST'])
@jwt_required()
def manage_attendance():
    user_id = get_jwt_identity()

    if request.method == 'GET':
        # Fetch attendance records for the logged-in user
        attendance_list = Attendance.query.filter_by(user_id=user_id).all()
        return jsonify([{
            'id': a.id,
            'worker_name': a.worker_name,
            'attendance_date': a.attendance_date.strftime('%Y-%m-%d'),
            'notes': a.notes
        } for a in attendance_list])

    elif request.method == 'POST':
        data = request.get_json()
        worker_name = data.get('worker_name', '').strip()
        if not worker_name:
            return jsonify({'error': 'worker_name is required'}), 400

        # Add attendance record for the logged-in user
        new_attendance = Attendance(
            worker_name=worker_name,
            attendance_date=datetime.utcnow(),
            user_id=user_id
        )
        db.session.add(new_attendance)
        db.session.commit()
        return jsonify({'message': 'Attendance added successfully'}), 201


@app.route('/attendance', methods=['GET'])
@jwt_required()
def get_attendance():
    user_id = get_jwt_identity()
    attendance_list = Attendance.query.filter_by(user_id=user_id).all()
    return jsonify([
        {
            'id': a.id,
            'worker_name': a.worker_name or 'Unknown Worker',  # Provide a default value
            'attendance_date': a.attendance_date.strftime('%Y-%m-%d'),
            'notes': a.notes or ''
        } for a in attendance_list
    ])


@app.route('/attendance/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_attendance(id):
    user_id = get_jwt_identity()
    print(f"User ID: {user_id}, Attendance ID: {id}")  # Debug log

    attendance = Attendance.query.filter_by(id=id, user_id=user_id).first()
    if not attendance:
        print("Attendance record not found")  # Debug log
        return jsonify({'error': 'Attendance record not found'}), 404

    db.session.delete(attendance)
    db.session.commit()
    print("Attendance record deleted successfully")  # Debug log
    return jsonify({'message': 'Attendance record deleted successfully'}), 200


# ---- Seeds Endpoints ----
@app.route('/seeds', methods=['GET', 'POST'])
@jwt_required()
def manage_seeds():
    user_id = get_jwt_identity()

    if request.method == 'GET':
        # Fetch seeds for the logged-in user
        seeds = Seed.query.filter_by(user_id=user_id).all()
        seeds_list = [
            {
                'id': seed.id,
                'name': seed.name,
                'price': seed.price,
                'quality': seed.quality,
                'vendor': seed.vendor,
                'vendor_url': seed.vendor_url,
            }
            for seed in seeds
        ]
        return jsonify(seeds_list), 200

    elif request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        price = data.get('price')
        quality = data.get('quality')
        vendor = data.get('vendor')
        vendor_url = data.get('vendor_url')

        if not name or not price or not quality or not vendor :
            return jsonify({'message': 'All fields are required'}), 400

        # Add seed record for the logged-in user
        new_seed = Seed(name=name, price=price, quality=quality, vendor=vendor, vendor_url=vendor_url, user_id=user_id)
        db.session.add(new_seed)
        db.session.commit()

        return jsonify({'message': 'Seed added successfully'}), 201


@app.route('/seeds/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_seed(id):
    user_id = get_jwt_identity()

    # Ensure the seed belongs to the logged-in user
    seed = Seed.query.filter_by(id=id, user_id=user_id).first()
    if not seed:
        return jsonify({'message': 'Seed not found'}), 404

    db.session.delete(seed)
    db.session.commit()

    return jsonify({'message': 'Seed deleted successfully'}), 200


# ---- Expenses Endpoints ----
@app.route('/expenses', methods=['GET', 'POST'])
@jwt_required()
def manage_expenses():
    user_id = get_jwt_identity()

    if request.method == 'GET':
        # Fetch expenses for the logged-in user
        expenses = Expense.query.filter_by(user_id=user_id).all()
        expenses_list = [
            {
                'id': expense.id,
                'name': expense.name,
                'amount': expense.amount,
                'date': expense.date.strftime('%Y-%m-%d'),
                'category': expense.category,
                'settled': expense.settled,
            }
            for expense in expenses
        ]
        return jsonify(expenses_list), 200

    elif request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        amount = data.get('amount')
        date = data.get('date')
        category = data.get('category')

        if not name or not amount or not date:
            return jsonify({'message': 'Name, amount, and date are required'}), 400

        # Add expense record for the logged-in user
        new_expense = Expense(name=name, amount=amount, date=datetime.strptime(date, '%Y-%m-%d'), category=category, user_id=user_id)
        db.session.add(new_expense)
        db.session.commit()

        return jsonify({'message': 'Expense added successfully'}), 201


@app.route('/expenses/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_expense(id):
    user_id = get_jwt_identity()

    # Ensure the expense belongs to the logged-in user
    expense = Expense.query.filter_by(id=id, user_id=user_id).first()
    if not expense:
        return jsonify({'message': 'Expense not found'}), 404

    db.session.delete(expense)
    db.session.commit()

    return jsonify({'message': 'Expense deleted successfully'}), 200


@app.route('/expenses/settle', methods=['PUT'])
@jwt_required()
def settle_expense():
    data = request.get_json()
    expense_id = data.get('id')
    if not expense_id:
        return jsonify({'message': 'Expense ID is required'}), 400

    expense = Expense.query.filter_by(id=expense_id, user_id=get_jwt_identity()).first()
    if not expense:
        return jsonify({'message': 'Expense not found'}), 404

    expense.settled = True
    db.session.commit()
    return jsonify({'message': 'Expense settled successfully'}), 200


# ---- Medicines Endpoints ----
@app.route('/medicines', methods=['GET', 'POST'])
@jwt_required()
def manage_medicines():
    user_id = get_jwt_identity()

    if request.method == 'GET':
        # Fetch medicines for the logged-in user
        medicines = Medicine.query.filter_by(user_id=user_id).all()
        medicines_list = [
            {
                'id': medicine.id,
                'name': medicine.name,
                'quantity': medicine.quantity,
                'vendor': medicine.vendor,
                'vendor_url': medicine.vendor_url,
            }
            for medicine in medicines
        ]
        return jsonify(medicines_list), 200

    elif request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        quantity = data.get('quantity')
        vendor = data.get('vendor')
        vendor_url = data.get('vendor_url')

        if not name or not quantity or not vendor :
            return jsonify({'message': 'All fields are required'}), 400

        # Add medicine record for the logged-in user
        new_medicine = Medicine(name=name, quantity=quantity, vendor=vendor, vendor_url=vendor_url, user_id=user_id)
        db.session.add(new_medicine)
        db.session.commit()

        return jsonify({'message': 'Medicine added successfully'}), 201


@app.route('/medicines/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_medicine(id):
    user_id = get_jwt_identity()

    # Ensure the medicine belongs to the logged-in user
    medicine = Medicine.query.filter_by(id=id, user_id=user_id).first()
    if not medicine:
        return jsonify({'message': 'Medicine not found'}), 404

    db.session.delete(medicine)
    db.session.commit()

    return jsonify({'message': 'Medicine deleted successfully'}), 200


# ---- Calendar Endpoints ----
@app.route('/calendar', methods=['GET', 'POST', 'PUT', 'DELETE'])
@jwt_required()
def manage_calendar():
    user_id = get_jwt_identity()  # Get the logged-in user's ID

    if request.method == 'POST':
        # Add a new calendar event
        data = request.get_json()
        date_str = data.get('date')
        description = data.get('description')

        if not date_str or not description:
            return jsonify({'message': 'Date and description are required'}), 400

        try:
            # Convert the date string to a Python date object
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD.'}), 400

        new_event = Calendar(date=date, description=description, user_id=user_id)
        db.session.add(new_event)
        db.session.commit()
        return jsonify({'message': 'Calendar event added successfully'}), 201

    elif request.method == 'GET':
        # Fetch calendar events for the logged-in user
        events = Calendar.query.filter_by(user_id=user_id).all()
        return jsonify([
            {
                'id': event.id,
                'date': event.date.strftime('%Y-%m-%d'),
                'description': event.description
            }
            for event in events
        ]), 200

    elif request.method == 'PUT':
        # Update an existing calendar event
        data = request.get_json()
        event_id = data.get('id')
        date_str = data.get('date')
        description = data.get('description')

        if not event_id or not date_str or not description:
            return jsonify({'message': 'ID, date, and description are required'}), 400

        try:
            # Convert the date string to a Python date object
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD.'}), 400

        event = Calendar.query.filter_by(id=event_id, user_id=user_id).first()
        if not event:
            return jsonify({'message': 'Calendar event not found'}), 404

        event.date = date
        event.description = description
        db.session.commit()
        return jsonify({'message': 'Calendar event updated successfully'}), 200

    elif request.method == 'DELETE':
        # Delete a calendar event
        data = request.get_json()
        event_id = data.get('id')

        if not event_id:
            return jsonify({'message': 'ID is required'}), 400

        event = Calendar.query.filter_by(id=event_id, user_id=user_id).first()
        if not event:
            return jsonify({'message': 'Calendar event not found'}), 404

        db.session.delete(event)
        db.session.commit()
        return jsonify({'message': 'Calendar event deleted successfully'}), 200


@app.route('/calendar', methods=['DELETE'])
@jwt_required()
def delete_calendar_event():
    user_id = get_jwt_identity()  # Get the logged-in user's ID
    data = request.get_json()
    event_id = data.get('id')

    if not event_id:
        return jsonify({'message': 'ID is required'}), 400

    event = Calendar.query.filter_by(id=event_id, user_id=user_id).first()
    if not event:
        return jsonify({'message': 'Calendar event not found'}), 404

    db.session.delete(event)
    db.session.commit()
    return jsonify({'message': 'Calendar event deleted successfully'}), 200


# ---- Contacts Endpoints ----
@app.route('/contacts', methods=['GET', 'POST'])
@jwt_required()
def manage_contacts():
    user_id = get_jwt_identity()

    if request.method == 'GET':
        # Fetch contacts for the logged-in user
        contacts = Contact.query.filter_by(user_id=user_id).all()
        contacts_list = [
            {
                'id': contact.id,
                'name': contact.name,
                'phone_number': contact.phone_number,
                'email': contact.email,
            }
            for contact in contacts
        ]
        return jsonify(contacts_list), 200

    elif request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        phone_number = data.get('phone_number')
        email = data.get('email')

        if not name or not phone_number:
            return jsonify({'message': 'Name and phone number are required'}), 400

        # Add contact record for the logged-in user
        new_contact = Contact(name=name, phone_number=phone_number, email=email, user_id=user_id)
        db.session.add(new_contact)
        db.session.commit()

        return jsonify({'message': 'Contact added successfully'}), 201


@app.route('/contacts/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_contact(id):
    user_id = get_jwt_identity()

    # Ensure the contact belongs to the logged-in user
    contact = Contact.query.filter_by(id=id, user_id=user_id).first()
    if not contact:
        return jsonify({'message': 'Contact not found'}), 404

    db.session.delete(contact)
    db.session.commit()

    return jsonify({'message': 'Contact deleted successfully'}), 200


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)

