const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    ssl: { rejectUnauthorized: false }
};

async function runMigration() {
    console.log('Starting migration...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to Aiven MySQL. Executing statements...');

    try {
        await connection.query('ALTER TABLE Torneos ADD COLUMN id_equipo CHAR(36) NULL;');
        console.log('Added id_equipo column.');
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column id_equipo already exists, ignoring...');
        } else {
            console.error('Error adding column:', err.message);
        }
    }

    try {
        await connection.query('ALTER TABLE Torneos ADD CONSTRAINT fk_torneos_equipo FOREIGN KEY (id_equipo) REFERENCES Equipos(id_equipo) ON DELETE CASCADE;');
        console.log('Added foreign key fk_torneos_equipo.');
    } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_CANT_CREATE_TABLE') {
            console.log('Foreign key fk_torneos_equipo already exists, ignoring...');
        } else {
            console.error('Error adding foreign key:', err.message);
            // non-fatal
        }
    }

    const sp_create = `
CREATE PROCEDURE sp_torneos_create(
    IN p_id CHAR(36),
    IN p_torneo VARCHAR(100),
    IN p_temporada_id INT,
    IN p_id_equipo CHAR(36)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error al crear torneo';
    END;

    START TRANSACTION;
    
    INSERT INTO Torneos (id_torneo, torneo, temporada_id, id_equipo)
    VALUES (p_id, p_torneo, p_temporada_id, p_id_equipo);
    
    COMMIT;
    
    SELECT * FROM Torneos WHERE id_torneo = p_id;
END
    `;

    const sp_get_by_equipo = `
CREATE PROCEDURE sp_torneos_get_by_equipo(IN p_id_equipo CHAR(36))
BEGIN
    SELECT * FROM Torneos WHERE id_equipo = p_id_equipo OR id_equipo IS NULL ORDER BY torneo;
END
    `;

    const sp_get_by_equipo_temporada = `
CREATE PROCEDURE sp_torneos_get_by_equipo_and_temporada(
    IN p_id_equipo CHAR(36),
    IN p_temporada_id INT
)
BEGIN
    SELECT * FROM Torneos 
    WHERE (id_equipo = p_id_equipo OR id_equipo IS NULL) 
      AND temporada_id = p_temporada_id 
    ORDER BY torneo;
END
    `;

    const sp_update = `
CREATE PROCEDURE sp_torneos_update(
    IN p_id CHAR(36),
    IN p_torneo VARCHAR(100),
    IN p_temporada_id INT,
    IN p_id_equipo CHAR(36)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error al actualizar torneo';
    END;

    START TRANSACTION;
    
    SELECT COUNT(*) INTO v_count FROM Torneos WHERE id_torneo = p_id;
    IF v_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Torneo no encontrado';
    END IF;
    
    UPDATE Torneos SET
        torneo = p_torneo,
        temporada_id = p_temporada_id,
        id_equipo = COALESCE(p_id_equipo, id_equipo)
    WHERE id_torneo = p_id;
    
    COMMIT;
    
    SELECT * FROM Torneos WHERE id_torneo = p_id;
END
    `;

    try {
        await connection.query('DROP PROCEDURE IF EXISTS sp_torneos_create;');
        await connection.query(sp_create);
        console.log('Updated sp_torneos_create.');

        await connection.query('DROP PROCEDURE IF EXISTS sp_torneos_get_by_equipo;');
        await connection.query(sp_get_by_equipo);
        console.log('Created sp_torneos_get_by_equipo.');

        await connection.query('DROP PROCEDURE IF EXISTS sp_torneos_get_by_equipo_and_temporada;');
        await connection.query(sp_get_by_equipo_temporada);
        console.log('Created sp_torneos_get_by_equipo_and_temporada.');

        await connection.query('DROP PROCEDURE IF EXISTS sp_torneos_update;');
        await connection.query(sp_update);
        console.log('Updated sp_torneos_update.');

    } catch (err) {
        console.error('Error with stored procedures:', err.message);
    }

    console.log('Migration completed!');
    await connection.end();
}

runMigration();
