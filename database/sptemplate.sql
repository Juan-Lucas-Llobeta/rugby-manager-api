-- ==========================================
-- STORED PROCEDURE TEMPLATE - RUGBY MANAGER
-- ==========================================
-- Naming Convention: sp_[tabla]_[accion]
-- Example: sp_jugadores_create, sp_jugadores_get_by_id
-- ==========================================

DELIMITER //

-- ==========================================
-- TEMPLATE: GET ALL
-- No transaction needed (read-only)
-- ==========================================
CREATE PROCEDURE sp_[tabla]_get_all()
BEGIN
    SELECT * FROM [Tabla] ORDER BY [campo];
END //

-- ==========================================
-- TEMPLATE: GET BY ID
-- No transaction needed (read-only)
-- ==========================================
CREATE PROCEDURE sp_[tabla]_get_by_id(IN p_id CHAR(36))
BEGIN
    SELECT * FROM [Tabla] WHERE id_[tabla] = p_id;
END //

-- ==========================================
-- TEMPLATE: CREATE
-- Returns inserted row
-- ==========================================
CREATE PROCEDURE sp_[tabla]_create(
    IN p_id CHAR(36),
    IN p_campo1 VARCHAR(100),
    IN p_campo2 VARCHAR(100)
    -- Add more parameters as needed
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error al crear [entidad]';
    END;

    START TRANSACTION;
    
    -- Optional: Validate FK exists
    -- DECLARE v_fk_count INT DEFAULT 0;
    -- SELECT COUNT(*) INTO v_fk_count FROM OtraTabla WHERE id = p_fk_id;
    -- IF v_fk_count = 0 THEN
    --     SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'FK no encontrado';
    -- END IF;
    
    INSERT INTO [Tabla] (id_[tabla], campo1, campo2)
    VALUES (p_id, p_campo1, p_campo2);
    
    COMMIT;
    
    -- Return the created row
    SELECT * FROM [Tabla] WHERE id_[tabla] = p_id;
END //

-- ==========================================
-- TEMPLATE: UPDATE
-- Returns updated row
-- ==========================================
CREATE PROCEDURE sp_[tabla]_update(
    IN p_id CHAR(36),
    IN p_campo1 VARCHAR(100),
    IN p_campo2 VARCHAR(100)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error al actualizar [entidad]';
    END;

    START TRANSACTION;
    
    -- IMPORTANT: Use COUNT(*) INTO variable, NOT "IF NOT EXISTS (SELECT 1...)"
    SELECT COUNT(*) INTO v_count FROM [Tabla] WHERE id_[tabla] = p_id;
    IF v_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[Entidad] no encontrado';
    END IF;
    
    UPDATE [Tabla] SET
        campo1 = p_campo1,
        campo2 = p_campo2
    WHERE id_[tabla] = p_id;
    
    COMMIT;
    
    -- Return the updated row
    SELECT * FROM [Tabla] WHERE id_[tabla] = p_id;
END //

-- ==========================================
-- TEMPLATE: DELETE
-- Returns success indicator
-- ==========================================
CREATE PROCEDURE sp_[tabla]_delete(IN p_id CHAR(36))
BEGIN
    DECLARE v_count INT DEFAULT 0;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error al eliminar [entidad]';
    END;

    START TRANSACTION;
    
    SELECT COUNT(*) INTO v_count FROM [Tabla] WHERE id_[tabla] = p_id;
    IF v_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[Entidad] no encontrado';
    END IF;
    
    DELETE FROM [Tabla] WHERE id_[tabla] = p_id;
    
    COMMIT;
    
    -- IMPORTANT: Do NOT use ROW_COUNT() after COMMIT - it's unreliable!
    -- Return 1 to indicate success (if we got here, delete worked)
    SELECT 1 AS affected_rows;
END //

-- ==========================================
-- TEMPLATE: GET WITH JOINS (REPEATABLE READ)
-- Use when reading multiple related tables
-- ==========================================
CREATE PROCEDURE sp_[tabla]_get_with_related(IN p_id CHAR(36))
BEGIN
    -- Use REPEATABLE READ when reading multiple related tables
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
    START TRANSACTION;
    
    -- First result set: main entity
    SELECT * FROM [Tabla] WHERE id_[tabla] = p_id;
    
    -- Second result set: related entity
    SELECT r.*, j.nombre
    FROM [Related] r
    JOIN [Joined] j ON r.id_joined = j.id_joined
    WHERE r.id_[tabla] = p_id
    ORDER BY r.campo;
    
    COMMIT;
END //

DELIMITER ;