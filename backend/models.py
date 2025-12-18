from flask_sqlalchemy import SQLAlchemy
from datetime import datetime  # Import datetime for date and time fields
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    security_question = db.Column(db.String(255), nullable=False)
    security_answer = db.Column(db.String(255), nullable=False)

# ---- Attendance Model ----
class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    worker_name = db.Column(db.String(100), nullable=False)
    attendance_date = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.String(255), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Associate with User
    user = db.relationship('User', backref=db.backref('attendances', lazy=True))

    def __repr__(self):
        return f'<Attendance {self.worker_name} on {self.attendance_date}>'

# ---- Seed Model ----
class Seed(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    quality = db.Column(db.String(50), nullable=False)
    vendor = db.Column(db.String(100), nullable=False)
    vendor_url = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Associate with User

    def __repr__(self):
        return f'<Seed {self.name}>'

# ---- Medicine/Fertilizer Model ----
class Medicine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    vendor = db.Column(db.String(100), nullable=False)
    vendor_url = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Associate with User

# ---- Expense Model ----
class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    category = db.Column(db.String(50), nullable=True)
    settled = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Associate with User

# ---- Weather Model ----
class Weather(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    condition = db.Column(db.String(200), nullable=False)
    date = db.Column(db.Date, nullable=False)

    def __repr__(self):
        return f'<Weather {self.condition} on {self.date}>'

# ---- Calendar/Reminder Model ----
class Calendar(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# ---- Contact Model ----
class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(100), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Associate with User
