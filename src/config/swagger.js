const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Rugby Manager API',
            version: '1.0.0',
            description: 'API para gestión de equipos de rugby - Jugadores, Partidos, Entrenamientos y más',
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Servidor de desarrollo',
            },
        ],
        components: {
            schemas: {
                // EQUIPO
                Equipo: {
                    type: 'object',
                    properties: {
                        id_equipo: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' },
                        equipo: { type: 'string', example: 'M19' },
                        club: { type: 'string', example: 'San Isidro Club' },
                        temporada_id: { type: 'integer', example: 2025 }
                    }
                },
                EquipoInput: {
                    type: 'object',
                    required: ['equipo'],
                    properties: {
                        equipo: { type: 'string', example: 'Plantel Superior' },
                        club: { type: 'string', example: 'Hindu Club' },
                        temporada_id: { type: 'integer', example: 2025 }
                    }
                },

                // USUARIO
                Usuario: {
                    type: 'object',
                    properties: {
                        id_usuario: { type: 'string', format: 'uuid' },
                        correo: { type: 'string', format: 'email', example: 'juan@ejemplo.com' },
                        apellido: { type: 'string', example: 'García' },
                        nombre: { type: 'string', example: 'Juan' },
                        fecha_creacion: { type: 'string', format: 'date-time' }
                    }
                },
                UsuarioInput: {
                    type: 'object',
                    required: ['correo', 'apellido', 'nombre', 'password'],
                    properties: {
                        correo: { type: 'string', format: 'email', example: 'nuevo@ejemplo.com' },
                        apellido: { type: 'string', example: 'Pérez' },
                        nombre: { type: 'string', example: 'Carlos' },
                        password: { type: 'string', minLength: 6, example: 'miPassword123' }
                    }
                },
                UsuarioUpdate: {
                    type: 'object',
                    properties: {
                        correo: { type: 'string', format: 'email' },
                        apellido: { type: 'string' },
                        nombre: { type: 'string' }
                    }
                },

                // STAFF
                Staff: {
                    type: 'object',
                    properties: {
                        id_staff: { type: 'string', format: 'uuid' },
                        id_usuario: { type: 'string', format: 'uuid' },
                        id_equipo: { type: 'string', format: 'uuid' },
                        rol: { type: 'string', enum: ['HEAD_COACH', 'ENTRENADOR', 'MANAGER'] },
                        permisos: { type: 'array', items: { type: 'string' } },
                        nombre: { type: 'string', description: 'Nombre del usuario (JOIN)' },
                        apellido: { type: 'string', description: 'Apellido del usuario (JOIN)' }
                    }
                },
                StaffInput: {
                    type: 'object',
                    required: ['id_usuario', 'id_equipo', 'rol'],
                    properties: {
                        id_usuario: { type: 'string', format: 'uuid' },
                        id_equipo: { type: 'string', format: 'uuid' },
                        rol: { type: 'string', enum: ['HEAD_COACH', 'ENTRENADOR', 'MANAGER'] },
                        permisos: { type: 'array', items: { type: 'string' }, example: ['ver_jugadores', 'editar_formacion'] }
                    }
                },
                StaffUpdate: {
                    type: 'object',
                    properties: {
                        rol: { type: 'string', enum: ['HEAD_COACH', 'ENTRENADOR', 'MANAGER'] },
                        permisos: { type: 'array', items: { type: 'string' } }
                    }
                },

                // JUGADOR
                Jugador: {
                    type: 'object',
                    properties: {
                        id_jugador: { type: 'string', format: 'uuid' },
                        id_equipo: { type: 'string', format: 'uuid' },
                        nombre: { type: 'string', example: 'Juan' },
                        apellido: { type: 'string', example: 'Pérez' },
                        apodo: { type: 'string', example: 'Juancho' },
                        fecha_nacimiento: { type: 'string', format: 'date', example: '2000-05-15' },
                        peso_kg: { type: 'number', example: 85.5 },
                        altura_cm: { type: 'integer', example: 180 },
                        posicion_principal: { type: 'string', example: 'HOOKER' },
                        posiciones_alternativas: { type: 'array', items: { type: 'string' }, example: ['LOOSEHEAD_PROP', 'TIGHTHEAD_PROP'] },
                        estado: { type: 'string', enum: ['DISPONIBLE', 'LESIONADO', 'SUSPENDIDO', 'NO_DISPONIBLE'] }
                    }
                },
                JugadorInput: {
                    type: 'object',
                    required: ['id_equipo', 'nombre', 'apellido', 'posicion_principal'],
                    properties: {
                        id_equipo: { type: 'string', format: 'uuid' },
                        nombre: { type: 'string', example: 'Carlos' },
                        apellido: { type: 'string', example: 'González' },
                        apodo: { type: 'string', example: 'Carlitos' },
                        fecha_nacimiento: { type: 'string', format: 'date' },
                        peso_kg: { type: 'number', example: 90 },
                        altura_cm: { type: 'integer', example: 185 },
                        posicion_principal: { type: 'string', example: 'FLY_HALF' },
                        posiciones_alternativas: { type: 'array', items: { type: 'string' } },
                        estado: { type: 'string', enum: ['DISPONIBLE', 'LESIONADO', 'SUSPENDIDO', 'NO_DISPONIBLE'], default: 'DISPONIBLE' }
                    }
                },
                JugadorUpdate: {
                    type: 'object',
                    properties: {
                        nombre: { type: 'string' },
                        apellido: { type: 'string' },
                        apodo: { type: 'string' },
                        fecha_nacimiento: { type: 'string', format: 'date' },
                        peso_kg: { type: 'number' },
                        altura_cm: { type: 'integer' },
                        posicion_principal: { type: 'string' },
                        posiciones_alternativas: { type: 'array', items: { type: 'string' } },
                        estado: { type: 'string', enum: ['DISPONIBLE', 'LESIONADO', 'SUSPENDIDO', 'NO_DISPONIBLE'] }
                    }
                },

                // TORNEO
                Torneo: {
                    type: 'object',
                    properties: {
                        id_torneo: { type: 'string', format: 'uuid' },
                        torneo: { type: 'string', example: 'Torneo Apertura URBA' },
                        temporada_id: { type: 'integer', example: 2025 }
                    }
                },
                TorneoInput: {
                    type: 'object',
                    required: ['torneo'],
                    properties: {
                        torneo: { type: 'string', example: 'Torneo Clausura' },
                        temporada_id: { type: 'integer', example: 2025 }
                    }
                },

                // PARTIDO
                Partido: {
                    type: 'object',
                    properties: {
                        id_partido: { type: 'string', format: 'uuid' },
                        id_equipo: { type: 'string', format: 'uuid' },
                        id_torneo: { type: 'string', format: 'uuid' },
                        rival: { type: 'string', example: 'San Isidro Club' },
                        condicion: { type: 'string', enum: ['LOCAL', 'VISITANTE'] },
                        fecha_hora: { type: 'string', format: 'date-time' },
                        marcador_propio: { type: 'integer', default: 0 },
                        marcador_rival: { type: 'integer', default: 0 },
                        estado: { type: 'string', enum: ['PROGRAMADO', 'EN_JUEGO', 'JUGADO'] },
                        nombre_torneo: { type: 'string', description: 'Nombre del torneo (JOIN)' },
                        nombre_equipo: { type: 'string', description: 'Nombre del equipo (JOIN)' }
                    }
                },
                PartidoInput: {
                    type: 'object',
                    required: ['id_equipo', 'rival', 'condicion', 'fecha_hora'],
                    properties: {
                        id_equipo: { type: 'string', format: 'uuid' },
                        id_torneo: { type: 'string', format: 'uuid' },
                        rival: { type: 'string', example: 'Hindu Club' },
                        condicion: { type: 'string', enum: ['LOCAL', 'VISITANTE'] },
                        fecha_hora: { type: 'string', format: 'date-time', example: '2025-03-15T15:00:00' },
                        estado: { type: 'string', enum: ['PROGRAMADO', 'EN_JUEGO', 'JUGADO'], default: 'PROGRAMADO' }
                    }
                },
                PartidoUpdate: {
                    type: 'object',
                    properties: {
                        id_torneo: { type: 'string', format: 'uuid' },
                        rival: { type: 'string' },
                        condicion: { type: 'string', enum: ['LOCAL', 'VISITANTE'] },
                        fecha_hora: { type: 'string', format: 'date-time' },
                        marcador_propio: { type: 'integer' },
                        marcador_rival: { type: 'integer' },
                        estado: { type: 'string', enum: ['PROGRAMADO', 'EN_JUEGO', 'JUGADO'] }
                    }
                },

                // CONVOCATORIA
                Convocatoria: {
                    type: 'object',
                    properties: {
                        id_convocatoria: { type: 'string', format: 'uuid' },
                        id_partido: { type: 'string', format: 'uuid' },
                        id_jugador: { type: 'string', format: 'uuid' },
                        tipo: { type: 'string', enum: ['TITULAR', 'SUPLENTE'] },
                        posicion: { type: 'string', example: 'HOOKER' },
                        numero_camiseta: { type: 'integer', example: 2 },
                        nombre: { type: 'string', description: 'Nombre del jugador (JOIN)' },
                        apellido: { type: 'string', description: 'Apellido del jugador (JOIN)' },
                        apodo: { type: 'string' },
                        posicion_principal: { type: 'string' }
                    }
                },
                ConvocatoriaInput: {
                    type: 'object',
                    required: ['id_partido', 'id_jugador', 'tipo', 'posicion'],
                    properties: {
                        id_partido: { type: 'string', format: 'uuid' },
                        id_jugador: { type: 'string', format: 'uuid' },
                        tipo: { type: 'string', enum: ['TITULAR', 'SUPLENTE'] },
                        posicion: { type: 'string', example: 'FLY_HALF' },
                        numero_camiseta: { type: 'integer', example: 10 }
                    }
                },
                ConvocatoriaUpdate: {
                    type: 'object',
                    properties: {
                        tipo: { type: 'string', enum: ['TITULAR', 'SUPLENTE'] },
                        posicion: { type: 'string' },
                        numero_camiseta: { type: 'integer' }
                    }
                },

                // ENTRENAMIENTO
                Entrenamiento: {
                    type: 'object',
                    properties: {
                        id_entrenamiento: { type: 'string', format: 'uuid' },
                        id_equipo: { type: 'string', format: 'uuid' },
                        fecha_hora: { type: 'string', format: 'date-time' },
                        enfoque: { type: 'string', example: 'Defensa y tackles' },
                        ubicacion: { type: 'string', example: 'Cancha principal' },
                        duracion_minutos: { type: 'integer', example: 90 },
                        estado: { type: 'string', enum: ['PROGRAMADO', 'REALIZADO', 'CANCELADO'] },
                        notas: { type: 'string' },
                        nombre_equipo: { type: 'string', description: 'Nombre del equipo (JOIN)' }
                    }
                },
                EntrenamientoInput: {
                    type: 'object',
                    required: ['id_equipo', 'fecha_hora'],
                    properties: {
                        id_equipo: { type: 'string', format: 'uuid' },
                        fecha_hora: { type: 'string', format: 'date-time' },
                        enfoque: { type: 'string' },
                        ubicacion: { type: 'string' },
                        duracion_minutos: { type: 'integer' },
                        estado: { type: 'string', enum: ['PROGRAMADO', 'REALIZADO', 'CANCELADO'] },
                        notas: { type: 'string' }
                    }
                },
                EntrenamientoUpdate: {
                    type: 'object',
                    properties: {
                        fecha_hora: { type: 'string', format: 'date-time' },
                        enfoque: { type: 'string' },
                        ubicacion: { type: 'string' },
                        duracion_minutos: { type: 'integer' },
                        estado: { type: 'string', enum: ['PROGRAMADO', 'REALIZADO', 'CANCELADO'] },
                        notas: { type: 'string' }
                    }
                },

                // ASISTENCIA
                Asistencia: {
                    type: 'object',
                    properties: {
                        id_asistencia: { type: 'string', format: 'uuid' },
                        id_entrenamiento: { type: 'string', format: 'uuid' },
                        id_jugador: { type: 'string', format: 'uuid' },
                        estado: { type: 'string', enum: ['PRESENTE', 'AUSENTE', 'JUSTIFICADO'] },
                        motivo_ausencia: { type: 'string' },
                        hora_llegada: { type: 'string', format: 'time', example: '18:30:00' },
                        nombre: { type: 'string', description: 'Nombre del jugador (JOIN)' },
                        apellido: { type: 'string', description: 'Apellido del jugador (JOIN)' },
                        apodo: { type: 'string' }
                    }
                },
                AsistenciaInput: {
                    type: 'object',
                    required: ['id_entrenamiento', 'id_jugador', 'estado'],
                    properties: {
                        id_entrenamiento: { type: 'string', format: 'uuid' },
                        id_jugador: { type: 'string', format: 'uuid' },
                        estado: { type: 'string', enum: ['PRESENTE', 'AUSENTE', 'JUSTIFICADO'] },
                        motivo_ausencia: { type: 'string' },
                        hora_llegada: { type: 'string', format: 'time' }
                    }
                },
                AsistenciaUpdate: {
                    type: 'object',
                    properties: {
                        estado: { type: 'string', enum: ['PRESENTE', 'AUSENTE', 'JUSTIFICADO'] },
                        motivo_ausencia: { type: 'string' },
                        hora_llegada: { type: 'string', format: 'time' }
                    }
                },

                // EVENTO PUNTAJE
                EventoPuntaje: {
                    type: 'object',
                    properties: {
                        id_evento: { type: 'string', format: 'uuid' },
                        id_partido: { type: 'string', format: 'uuid' },
                        minuto: { type: 'integer', example: 23 },
                        es_propio: { type: 'boolean', default: true },
                        tipo: { type: 'string', enum: ['TRY', 'CONVERSION', 'PENAL', 'DROP_GOAL', 'TRY_PENAL'] },
                        id_jugador: { type: 'string', format: 'uuid' },
                        nombre: { type: 'string' },
                        apellido: { type: 'string' }
                    }
                },
                EventoPuntajeInput: {
                    type: 'object',
                    required: ['id_partido', 'minuto', 'tipo'],
                    properties: {
                        id_partido: { type: 'string', format: 'uuid' },
                        minuto: { type: 'integer' },
                        es_propio: { type: 'boolean', default: true },
                        tipo: { type: 'string', enum: ['TRY', 'CONVERSION', 'PENAL', 'DROP_GOAL', 'TRY_PENAL'] },
                        id_jugador: { type: 'string', format: 'uuid' }
                    }
                },
                EventoPuntajeUpdate: {
                    type: 'object',
                    properties: {
                        minuto: { type: 'integer' },
                        es_propio: { type: 'boolean' },
                        tipo: { type: 'string', enum: ['TRY', 'CONVERSION', 'PENAL', 'DROP_GOAL', 'TRY_PENAL'] },
                        id_jugador: { type: 'string', format: 'uuid' }
                    }
                },

                // EVENTO FORMACION
                EventoFormacion: {
                    type: 'object',
                    properties: {
                        id_evento: { type: 'string', format: 'uuid' },
                        id_partido: { type: 'string', format: 'uuid' },
                        minuto: { type: 'integer', example: 15 },
                        es_propio: { type: 'boolean', default: true },
                        tipo: { type: 'string', enum: ['SCRUM', 'LINEOUT', 'RED_CARD', 'YELLOW_CARD'] },
                        resultado: { type: 'string', enum: ['GANADO', 'PERDIDO'] }
                    }
                },
                EventoFormacionInput: {
                    type: 'object',
                    required: ['id_partido', 'minuto', 'tipo'],
                    properties: {
                        id_partido: { type: 'string', format: 'uuid' },
                        minuto: { type: 'integer' },
                        es_propio: { type: 'boolean', default: true },
                        tipo: { type: 'string', enum: ['SCRUM', 'LINEOUT', 'RED_CARD', 'YELLOW_CARD'] },
                        resultado: { type: 'string', enum: ['GANADO', 'PERDIDO'] }
                    }
                },
                EventoFormacionUpdate: {
                    type: 'object',
                    properties: {
                        minuto: { type: 'integer' },
                        es_propio: { type: 'boolean' },
                        tipo: { type: 'string', enum: ['SCRUM', 'LINEOUT', 'RED_CARD', 'YELLOW_CARD'] },
                        resultado: { type: 'string', enum: ['GANADO', 'PERDIDO'] }
                    }
                },

                // ERROR
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', example: 'Recurso no encontrado' }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
