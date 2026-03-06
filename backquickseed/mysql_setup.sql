-- ============================================================
-- Ejecutar como root en MySQL antes de levantar el backend
-- ============================================================

-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS quickseed
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Crear el usuario de aplicación
CREATE USER IF NOT EXISTS 'quickseed_user'@'localhost'
  IDENTIFIED BY 'QuickSeed!2026';

CREATE USER IF NOT EXISTS 'quickseed_user'@'127.0.0.1'
  IDENTIFIED BY 'QuickSeed!2026';

-- 3. Otorgar permisos solo a la base de datos de la app
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER
  ON quickseed.*
  TO 'quickseed_user'@'localhost';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER
  ON quickseed.*
  TO 'quickseed_user'@'127.0.0.1';

FLUSH PRIVILEGES;

-- 4. Verificar
SELECT user, host FROM mysql.user WHERE user = 'quickseed_user';
SHOW GRANTS FOR 'quickseed_user'@'localhost';
