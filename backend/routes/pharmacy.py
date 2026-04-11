from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db, Medicine, InventoryTransaction, User
from datetime import datetime

pharmacy_bp = Blueprint("pharmacy", __name__, url_prefix="/api/pharmacy")

def require_admin():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Forbidden – admin context required"}), 403

@pharmacy_bp.get("/medicines")
@jwt_required()
def list_medicines():
    q = Medicine.query
    search = request.args.get("search")
    if search:
        q = q.filter(Medicine.name.ilike(f"%{search}%"))
    
    medicines = q.order_by(Medicine.name).all()
    return jsonify([m.to_dict() for m in medicines]), 200

@pharmacy_bp.post("/medicines")
@jwt_required()
def add_medicine():
    err = require_admin()
    if err: return err
    
    data = request.get_json()
    if Medicine.query.filter_by(name=data["name"]).first():
        return jsonify({"error": "Medicine already exists"}), 409
        
    medicine = Medicine(
        name           = data["name"],
        category       = data.get("category"),
        unit_price     = data.get("unit_price", 0),
        stock_quantity = data.get("stock_quantity", 0),
        min_stock_level = data.get("min_stock_level", 10),
        manufacturer   = data.get("manufacturer"),
        expiry_date    = datetime.strptime(data["expiry_date"], "%Y-%m-%d").date() if data.get("expiry_date") else None
    )
    db.session.add(medicine)
    db.session.commit()
    return jsonify({"message": "Medicine added", "medicine": medicine.to_dict()}), 201

@pharmacy_bp.put("/medicines/<int:medicine_id>")
@jwt_required()
def update_medicine(medicine_id):
    err = require_admin()
    if err: return err
    
    medicine = Medicine.query.get_or_404(medicine_id)
    data = request.get_json()
    
    for field in ["name", "category", "unit_price", "stock_quantity", "min_stock_level", "manufacturer"]:
        if field in data:
            setattr(medicine, field, data[field])
            
    if "expiry_date" in data:
        medicine.expiry_date = datetime.strptime(data["expiry_date"], "%Y-%m-%d").date() if data["expiry_date"] else None
        
    db.session.commit()
    return jsonify({"message": "Medicine updated", "medicine": medicine.to_dict()}), 200

@pharmacy_bp.post("/transactions")
@jwt_required()
def record_transaction():
    err = require_admin()
    if err: return err
    
    data = request.get_json()
    medicine = Medicine.query.get_or_404(data["medicine_id"])
    identity = get_jwt_identity()
    
    trx = InventoryTransaction(
        medicine_id = medicine.medicine_id,
        type        = data["type"],
        quantity    = data["quantity"],
        description = data.get("description"),
        performed_by = int(identity)
    )
    
    # Update stock based on transaction type
    if data["type"] in ["Purchase", "Adjustment"]:
        medicine.stock_quantity += data["quantity"]
    elif data["type"] in ["Sale", "Expired"]:
        medicine.stock_quantity -= data["quantity"]
        
    db.session.add(trx)
    db.session.commit()
    return jsonify({"message": "Transaction recorded", "stock_quantity": medicine.stock_quantity}), 201
