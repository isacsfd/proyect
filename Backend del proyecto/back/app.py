from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from database import Libro, UserTable, Prestamos
import database
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta

# Importa el modelo y las funciones CRUD
from database import SessionLocal, engine, UserTable

# Crea la base de datos (si no existe)
database.Base.metadata.create_all(bind = engine)

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],  # Permite todos los orígenes
    allow_credentials = True,
    allow_methods = ["*"],  # Permite todos los métodos
    allow_headers = ["*"],  # Permite todos los encabezados
)

# Endpoint raíz
@app.get("/")
def read_root():
    return {"message": "API de la Biblioteca IUB. Accede a /docs para la documentación interactiva."}


# Modelo Pydantic para usuarios
class UserCreate(BaseModel):
    nombre: str
    identificacion: str
    tipo: str
    nivel_academico: Optional[str] = None
    carrera: Optional[str] = None
    username: str
    password: str


class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    identificacion: Optional[str] = None
    tipo: Optional[str] = None
    nivel_academico: Optional[str] = None
    carrera: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    nombre: str
    identificacion: str
    tipo: str
    nivel_academico: Optional[str] = None
    carrera: Optional[str] = None

    class Config:
        from_attributes = True


# Dependencia para la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# login de la aplicación
@app.post("/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    user = db.query(UserTable).filter(UserTable.username == username, UserTable.password == password).first()
    if user is None:
        raise HTTPException(status_code = 401, detail = "Usuario o contraseña incorrectos")
    return {"message": "Inicio de sesión exitoso", "user": user.nombre}


# Endpoints CRUD para usuarios
@app.get("/usuarios/", response_model = List[UserResponse])
def read_all_users(db: Session = Depends(get_db)):
    return db.query(UserTable).all()


@app.post("/usuarios/", response_model = UserResponse, status_code = status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(UserTable).filter(UserTable.identificacion == user.identificacion).first()
    if db_user:
        raise HTTPException(status_code = 400, detail = "La identificación ya está registrada")
    new_user = UserTable(**user.model_dump())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.get("/usuarios/{user_id}", response_model = UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(UserTable).filter(UserTable.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code = 404, detail = "Usuario no encontrado")
    return db_user


@app.put("/usuarios/{user_id}", response_model = UserResponse)
def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(UserTable).filter(UserTable.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code = 404, detail = "Usuario no encontrado")
    for key, value in user.model_dump(exclude_unset = True).items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.delete("/usuarios/{user_id}", response_model = UserResponse)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(UserTable).filter(UserTable.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code = 404, detail = "Usuario no encontrado")
    db.delete(db_user)
    db.commit()

    # devolver un json con el mensaje de usuario eliminado
    return db_user


# Modelo Pydantic para libros
class LibroCreate(BaseModel):
    Autor: str
    Titulo: str
    Programa: str
    Item: int
    Signatura: str
    Areas: int
    Ejemplar: int
    Editorial: str
    Año: int
    Idioma: str
    Observaciones: Optional[str] = None
    Precio: Optional[str] = None
    Proveedor: Optional[str] = None
    Registro_en_linea: Optional[str] = None


class LibroUpdate(BaseModel):
    Autor: Optional[str] = None
    Titulo: Optional[str] = None
    Programa: Optional[str] = None
    Item: Optional[int] = None
    Signatura: Optional[str] = None
    Areas: Optional[int] = None
    Ejemplar: Optional[int] = None
    Editorial: Optional[str] = None
    Año: Optional[int] = None
    Idioma: Optional[str] = None
    Observaciones: Optional[str] = None
    Precio: Optional[str] = None
    Proveedor: Optional[str] = None
    Registro_en_linea: Optional[str] = None


class LibroResponse(BaseModel):
    ID: int
    Autor: str
    Titulo: str
    Programa: str
    Item: int
    Signatura: str
    Areas: int
    Ejemplar: int
    Editorial: str
    Año: int
    Idioma: str
    Observaciones: Optional[str] = None
    Precio: Optional[str] = None
    Proveedor: Optional[str] = None
    Registro_en_linea: Optional[str] = None

    class Config:
        from_attributes = True


# Endpoints CRUD para libros

@app.get("/libros/", response_model = List[LibroResponse])
def read_all_libros(db: Session = Depends(get_db)):
    return db.query(Libro).all()


@app.post("/libros/", response_model = LibroResponse, status_code = status.HTTP_201_CREATED)
def create_libro(libro: LibroCreate, db: Session = Depends(get_db)):
    db_libro = Libro(**libro.model_dump())
    db.add(db_libro)
    db.commit()
    db.refresh(db_libro)
    return db_libro


@app.get("/libros/{libro_id}", response_model = LibroResponse)
def read_libro(libro_id: int, db: Session = Depends(get_db)):
    db_libro = db.query(Libro).filter(Libro.ID == libro_id).first()
    if db_libro is None:
        raise HTTPException(status_code = 404, detail = "Libro no encontrado")
    return db_libro


@app.put("/libros/{libro_id}", response_model = LibroResponse)
def update_libro(libro_id: int, libro: LibroUpdate, db: Session = Depends(get_db)):
    db_libro = db.query(Libro).filter(Libro.ID == libro_id).first()
    if db_libro is None:
        raise HTTPException(status_code = 404, detail = "Libro no encontrado")
    for key, value in libro.model_dump(exclude_unset = True).items():
        setattr(db_libro, key, value)
    db.commit()
    db.refresh(db_libro)
    return db_libro


@app.delete("/libros/{libro_id}", response_model = LibroResponse)
def delete_libro(libro_id: int, db: Session = Depends(get_db)):
    db_libro = db.query(Libro).filter(Libro.ID == libro_id).first()
    if db_libro is None:
        raise HTTPException(status_code = 404, detail = "Libro no encontrado")
    db.delete(db_libro)
    db.commit()
    return db_libro


class LoanRequestCreate(BaseModel):
    user_id: int
    book_id: int
    loan_date: datetime
    delivery_date: datetime


class LoanRequestDelivery(BaseModel):
    entry_date: datetime
    observations: str


class LoanResponse(BaseModel):
    id: int
    user_id: int
    user: str
    book_id: int
    book: str
    loan_date: datetime
    delivery_date: datetime
    entry_date: Optional[datetime] = None
    state: str
    created_at: datetime


class Config:
    from_attributes = True


# Endpoints CRUD para préstamos de libros
@app.post("/loan/", status_code = status.HTTP_201_CREATED)
def loan_create(request: LoanRequestCreate, db: Session = Depends(get_db)):
    # 1. Valida que el libro exista.
    book = db.query(Libro).filter(Libro.ID == request.book_id).first()
    if book is None:
        raise HTTPException(status_code = 404, detail = "Libro no encontrado")

    # 2. Valida que el usuario exista.
    user = db.query(UserTable).filter(UserTable.id == request.user_id).first()
    if user is None:
        raise HTTPException(status_code = 404, detail = "Usuario no encontrado")

    # 3. Valida que el libro tenga ejemplares disponibles.
    if book.Ejemplar <= 0:
        raise HTTPException(status_code = 400, detail = "Libro no disponible")

    # 4. Valida que el libro no esté prestado a estudiante
    check = (db.query(Prestamos).filter(Prestamos.user_id == request.user_id, Prestamos.book_id == request.book_id,
                                        Prestamos.state == "Activo").first())

    if check is not None:
        raise HTTPException(status_code = 400, detail = "El libro ya está prestado a este usuario")

    loan = Prestamos(
        user_id = user.id,
        book_id = book.ID,
        loan_date = request.loan_date,
        delivery_date = request.delivery_date,
        state = "Activo",
    )

    book.Ejemplar -= 1

    db.add(loan)
    db.commit()
    db.refresh(loan)

    return loan


@app.get("/loan/", response_model = List[LoanResponse])
def loan_list(db: Session = Depends(get_db)):
    loans = db.query(Prestamos).all()
    result = []
    for loan in loans:
        user = db.query(UserTable).filter(UserTable.id == loan.user_id).first()
        book = db.query(Libro).filter(Libro.ID == loan.book_id).first()

        loan_dict = {
            "id": loan.id,
            "user_id": loan.user_id,
            "user": user.nombre,
            "book_id": loan.book_id,
            "book": book.Titulo,
            "loan_date": loan.loan_date,
            "delivery_date": loan.delivery_date,
            "entry_date": loan.entry_date,
            "state": loan.state,
            "created_at": loan.created_at
        }
        result.append(loan_dict)

    return result


@app.get("/loan/{loan_id}", response_model = LoanResponse)
def loan_get(loan_id: int, db: Session = Depends(get_db)):
    loan = db.query(Prestamos).filter(Prestamos.id == loan_id).first()

    if loan is None:
        raise HTTPException(status_code = 404, detail = "Préstamo no encontrado")

    user = db.query(UserTable).filter(UserTable.id == loan.user_id).first()
    book = db.query(Libro).filter(Libro.ID == loan.book_id).first()

    loan_dict = {
        "id": loan.id,
        "user_id": loan.user_id,
        "user": user.nombre,
        "book_id": loan.book_id,
        "book": book.Titulo,
        "loan_date": loan.loan_date,
        "delivery_date": loan.delivery_date,
        "entry_date": loan.entry_date,
        "state": loan.state,
        "created_at": loan.created_at
    }

    return loan_dict


@app.post("/loan/{loan_id}")
def loan_update(loan_id: int, request: LoanRequestDelivery, db: Session = Depends(get_db)):

    loan = db.query(Prestamos).filter(Prestamos.id == loan_id).first()

    if loan is None:
        raise HTTPException(status_code = 404, detail = "Préstamo no encontrado")

    loan.entry_date = request.entry_date
    loan.state = "Devuelto"
    loan.observations = request.observations

    book = db.query(Libro).filter(Libro.ID == loan.book_id).first()
    book.Ejemplar += 1

    db.commit()
    db.refresh(loan)

    return loan

@app.post("/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    user = db.query(UserTable).filter(UserTable.username == username, UserTable.password == password).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
        
    # Verificar si el usuario es administrador
    if user.tipo == "Administrador":
        verificar_prestamos_vencidos(db)  # Llamar a la función para verificar préstamos vencidos

    return {"message": "Inicio de sesión exitoso", "user": user.nombre}
# Modificar la función para aceptar la sesión de la base de datos como parámetro
def verificar_prestamos_vencidos(db: Session):
    try:
        prestamos_activos = db.query(Prestamos).filter(Prestamos.state == "Activo").all()
        fecha_actual = datetime.now()

        for prestamo in prestamos_activos:
            if prestamo.delivery_date < fecha_actual:
                prestamo.state = "Vencido"

        db.commit()
        print(f"✔ Verificación completada. Préstamos vencidos actualizados.")
    except Exception as e:
        print(f"Error al verificar préstamos vencidos: {e}")

