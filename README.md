# CRUD de alumnos

Aplicación con frontend Angular, API REST en Ruby (Sinatra) y persistencia SQLite.

## Requisitos

- Node.js 20.19+ o 22.12+
- Ruby 3.2+ y Bundler

## Iniciar el backend

Desde `tarea/backend`:

```powershell
bundle install
bundle exec ruby app.rb
```

La API escucha en `http://localhost:4567`. La base de datos `alumnos.sqlite3`
se crea automáticamente junto al backend.

## Iniciar el frontend

En otra terminal, desde `tarea/frontend`:

```powershell
npm install
npm start
```

Abre `http://localhost:4200`.

## Operaciones de la API

| Método | Ruta | Acción |
| --- | --- | --- |
| `GET` | `/alumnos` | Listar alumnos |
| `POST` | `/alumnos` | Crear alumno |
| `PUT` | `/alumnos/:id` | Actualizar alumno |
| `DELETE` | `/alumnos/:id` | Eliminar alumno |

Cada alumno tiene nombre, correo electrónico y curso. Los tres campos son
obligatorios; el correo debe tener un formato válido.
