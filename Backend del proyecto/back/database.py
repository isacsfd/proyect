from xmlrpc.client import DateTime

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root@localhost:3307/biblioteca" 
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class UserTable(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    phone = Column(String(50), nullable=False)
    address = Column(String(255), nullable=False)
    role_id = Column(Integer, nullable=False)
    password = Column(String(255), nullable=False)
    identificacion = Column(String(50), unique=True, index=True)
    nivel_academico = Column(String(50), nullable=True)
    carrera = Column(String(100), nullable=True)

class Libro(Base):
    __tablename__ = "libros"

    ID = Column(Integer, primary_key=True, index=True)
    Autor = Column(String(255), nullable=False)
    Titulo = Column(String(255), nullable=False)
    Programa = Column(String(100), nullable=False)
    Item = Column(Integer, nullable=False)
    Signatura = Column(String(50), nullable=False)
    Areas = Column(Integer, nullable=False)
    Ejemplar = Column(Integer, nullable=False)
    Editorial = Column(String(100), nullable=False)
    Año = Column(Integer, nullable=False) 
    Idioma = Column(String(50), nullable=False)
    Observaciones = Column(String(50), nullable=True)
    Precio = Column(String(50), nullable=True)
    Proveedor = Column(String(100), nullable=True)
    Registro_en_linea = Column(String(100), nullable=True)

class Prestamos(Base):
    __tablename__ = "prestamos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    book_id = Column(String(50), nullable=False)
    loan_date = Column(String(50), nullable=False)
    delivery_date = Column(String(50), nullable=False)
    entry_date = Column(String(50), nullable=True)
    state = Column(Enum("Activo", "Vencido", "Devuelto"), nullable=False) # A futuro crea una tabla donde se encuentren los estados
    observations = Column(String(250), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)

class Roles(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Integer, nullable=False)
    description = Column(String(50), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)

class Contratistas(Base):
    __tablename__ = "contratistas"
    
    ID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Editorial = Column(String(100), nullable=False)
    NIT = Column(Integer, nullable=False)

class Proveer(Base):
    __tablename__ = "proveer"
    
    Libro_ID = Column(Integer, primary_key=True, index=True)
    Contratista_ID = Column(Integer, primary_key=True, index=True)
