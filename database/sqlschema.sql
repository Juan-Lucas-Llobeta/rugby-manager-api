-- ==========================================
-- DATABASE SETUP
-- ==========================================
CREATE DATABASE IF NOT EXISTS rugby_manager
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
	USE rugby_manager;
-- ==========================================
-- USUARIO
-- ==========================================
CREATE TABLE Usuarios (
    id_usuario CHAR(36) PRIMARY KEY,
    correo VARCHAR(255) NOT NULL UNIQUE,
    apellido VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ==========================================
-- EQUIPO
-- ==========================================
CREATE TABLE Equipos (
    id_equipo CHAR(36) PRIMARY KEY,
    equipo VARCHAR(100) NOT NULL,
    club VARCHAR(100),
    temporada_id INT
);
-- ==========================================
-- STAFF
-- ==========================================
CREATE TABLE Staff (
    id_staff CHAR(36) PRIMARY KEY,
    id_usuario CHAR(36) NOT NULL,
    id_equipo CHAR(36) NOT NULL,
    rol ENUM('HEAD_COACH', 'ENTRENADOR', 'MANAGER') NOT NULL,
    permisos JSON,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_equipo) REFERENCES Equipos(id_equipo) ON DELETE CASCADE
);
-- ==========================================
-- JUGADOR
-- ==========================================
CREATE TABLE Jugadores (
    id_jugador CHAR(36) PRIMARY KEY,
    id_equipo CHAR(36) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    apodo VARCHAR(50),
    fecha_nacimiento DATE,
    peso_kg DECIMAL(5,2),
    altura_cm INT,
    posicion_principal VARCHAR(50) NOT NULL,
    posiciones_alternativas JSON,
    estado ENUM('DISPONIBLE', 'LESIONADO', 'SUSPENDIDO', 'NO_DISPONIBLE') DEFAULT 'DISPONIBLE',
    FOREIGN KEY (id_equipo) REFERENCES Equipos(id_equipo) ON DELETE CASCADE
);
-- ==========================================
-- TORNEO
-- ==========================================
CREATE TABLE Torneos (
    id_torneo CHAR(36) PRIMARY KEY,
    torneo VARCHAR(100) NOT NULL,
    temporada_id INT
);
-- ==========================================
-- PARTIDO
-- ==========================================
CREATE TABLE Partidos (
    id_partido CHAR(36) PRIMARY KEY,
    id_equipo CHAR(36) NOT NULL,
    id_torneo CHAR(36),
    rival VARCHAR(100) NOT NULL,
    condicion ENUM('LOCAL', 'VISITANTE') NOT NULL,
    fecha_hora DATETIME NOT NULL,
    marcador_propio INT DEFAULT 0,
    marcador_rival INT DEFAULT 0,
    estado ENUM('PROGRAMADO', 'EN_JUEGO', 'JUGADO') DEFAULT 'PROGRAMADO',
    FOREIGN KEY (id_equipo) REFERENCES Equipos(id_equipo),
    FOREIGN KEY (id_torneo) REFERENCES Torneos(id_torneo)
);
-- ==========================================
-- EVENTO_PARTIDO
-- ==========================================
CREATE TABLE EventosPartido (
    id_evento CHAR(36) PRIMARY KEY,
    id_partido CHAR(36) NOT NULL,
    minuto INT NOT NULL,
    es_propio BOOLEAN NOT NULL,
    FOREIGN KEY (id_partido) REFERENCES Partidos(id_partido) ON DELETE CASCADE
);
-- ==========================================
-- EVENTO_PUNTAJE
-- ==========================================
CREATE TABLE EventosPuntaje (
    id_evento CHAR(36) PRIMARY KEY,
    tipo ENUM('TRY', 'CONVERSION', 'PENAL', 'DROP_GOAL', 'TRY_PENAL') NOT NULL,
    id_jugador CHAR(36),
    FOREIGN KEY (id_evento) REFERENCES EventosPartido(id_evento) ON DELETE CASCADE,
    FOREIGN KEY (id_jugador) REFERENCES Jugadores(id_jugador)
);
-- ==========================================
-- EVENTO_FORMACION
-- ==========================================
CREATE TABLE EventosFormacion (
    id_evento CHAR(36) PRIMARY KEY,
    tipo ENUM('SCRUM', 'LINEOUT', 'RED_CARD', 'YELLOW_CARD') NOT NULL,
    resultado ENUM('GANADO', 'PERDIDO'),
    FOREIGN KEY (id_evento) REFERENCES EventosPartido(id_evento) ON DELETE CASCADE
);
-- ==========================================
-- CONVOCATORIA
-- ==========================================
CREATE TABLE Convocatorias (
    id_convocatoria CHAR(36) PRIMARY KEY,
    id_partido CHAR(36) NOT NULL,
    id_jugador CHAR(36) NOT NULL,
    tipo ENUM('TITULAR', 'SUPLENTE') NOT NULL,
    posicion VARCHAR(50) NOT NULL,
    numero_camiseta INT,
    FOREIGN KEY (id_partido) REFERENCES Partidos(id_partido) ON DELETE CASCADE,
    FOREIGN KEY (id_jugador) REFERENCES Jugadores(id_jugador),
    UNIQUE KEY unique_convocatoria (id_partido, id_jugador)
);
-- ==========================================   
-- ENTRENAMIENTO
-- ==========================================
CREATE TABLE Entrenamientos (
    id_entrenamiento CHAR(36) PRIMARY KEY,
    id_equipo CHAR(36) NOT NULL,
    fecha_hora DATETIME NOT NULL,
    enfoque VARCHAR(200),
    ubicacion VARCHAR(100),
    duracion_minutos INT,
    estado ENUM('PROGRAMADO', 'REALIZADO', 'CANCELADO') DEFAULT 'PROGRAMADO',
    notas TEXT,
    FOREIGN KEY (id_equipo) REFERENCES Equipos(id_equipo) ON DELETE CASCADE
);
-- ==========================================
-- ASISTENCIA
-- ==========================================
CREATE TABLE Asistencias (
    id_asistencia CHAR(36) PRIMARY KEY,
    id_entrenamiento CHAR(36) NOT NULL,
    id_jugador CHAR(36) NOT NULL,
    estado ENUM('PRESENTE', 'AUSENTE', 'JUSTIFICADO') NOT NULL,
    motivo_ausencia TEXT,
    hora_llegada TIME,
    FOREIGN KEY (id_entrenamiento) REFERENCES Entrenamientos(id_entrenamiento) ON DELETE CASCADE,
    FOREIGN KEY (id_jugador) REFERENCES Jugadores(id_jugador),
    UNIQUE KEY unique_asistencia (id_entrenamiento, id_jugador)
);
-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_jugador_equipo ON Jugadores(id_equipo);
CREATE INDEX idx_partido_fecha ON Partidos(fecha_hora);
CREATE INDEX idx_entrenamiento_fecha ON Entrenamientos(fecha_hora);