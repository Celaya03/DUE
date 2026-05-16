-- Script de migración para corregir el problema de datos compartidos entre usuarios
-- Ejecuta esto en el SQL Editor de Supabase

-- Eliminar tablas existentes
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS habits;
DROP TABLE IF EXISTS transactions;

-- Recrear tablas con clave primaria compuesta (id, user_id)
-- Esto asegura que cada usuario tenga sus propios datos aislados

CREATE TABLE tasks (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  due_date TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (id, user_id)
);

CREATE TABLE habits (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL,
  streak INTEGER NOT NULL,
  icon TEXT NOT NULL,
  PRIMARY KEY (id, user_id)
);

CREATE TABLE transactions (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  PRIMARY KEY (id, user_id)
);

-- Crear índices para mejorar el rendimiento de las consultas por user_id
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
