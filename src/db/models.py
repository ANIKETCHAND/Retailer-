"""
RetailVision - SQLAlchemy Database Models
Models for Users, Stores, and Marketplace Datasets.
"""

from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from src.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    stores = relationship("Store", back_populates="owner")


class Store(Base):
    __tablename__ = "stores"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(Text, default="")
    dataset_path = Column(String(255), nullable=False)

    # 3D Marketplace Coordinates & Visual Attributes
    grid_x = Column(Float, nullable=False, default=0.0)
    grid_z = Column(Float, nullable=False, default=0.0)
    rotation_y = Column(Float, default=0.0)
    color = Column(String(30), default="#3B82F6")
    is_default = Column(Boolean, default=False)

    # Cached Aggregate Stats for fast marketplace hover tooltips
    total_revenue = Column(Float, default=0.0)
    total_orders = Column(Integer, default=0)
    total_products = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="stores")
