from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request

socketio = SocketIO(cors_allowed_origins="*", async_mode='eventlet')

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")

@socketio.on('join')
def on_join(data):
    role = data.get('role')
    user_id = data.get('user_id')
    if role:
        join_room(role)
        print(f"User {user_id} joined room: {role}")
    if user_id:
        join_room(f"user_{user_id}")
        print(f"User {user_id} joined private room: user_{user_id}")

def notify_new_appointment(doctor_id, appointment_data):
    """Notify doctor about a new booking."""
    socketio.emit('new_appointment', appointment_data, room=f"user_{doctor_id}")
    socketio.emit('admin_update', {"type": "new_appointment", "data": appointment_data}, room="admin")

def notify_appointment_status(patient_id, appointment_data):
    """Notify patient about status change."""
    socketio.emit('appointment_update', appointment_data, room=f"user_{patient_id}")
