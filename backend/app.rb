require 'json'
require 'sinatra'
require 'sqlite3'

DB = SQLite3::Database.new(File.join(__dir__, 'alumnos.sqlite3'))
DB.results_as_hash = true
DB.busy_timeout = 5000
DB.execute <<~SQL
  CREATE TABLE IF NOT EXISTS alumnos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL,
    curso TEXT NOT NULL
  )
SQL

configure do
  set :bind, '127.0.0.1'
  set :port, 4567
end

before do
  response.headers['Access-Control-Allow-Origin'] = 'http://localhost:4200'
  response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
  content_type :json
end

options '*' do
  status 204
end

helpers do
  def validar_alumno
    cuerpo = request.body.read.force_encoding(Encoding::UTF_8)
    halt 400, { error: 'El cuerpo de la solicitud debe usar UTF-8 válido.' }.to_json unless cuerpo.valid_encoding?

    datos = JSON.parse(cuerpo)
    halt 400, { error: 'El cuerpo de la solicitud debe ser un objeto JSON.' }.to_json unless datos.is_a?(Hash)

    alumno = {
      nombre: datos['nombre'].to_s.strip,
      correo: datos['correo'].to_s.strip,
      curso: datos['curso'].to_s.strip
    }

    halt 422, { error: 'Nombre, correo y curso son obligatorios.' }.to_json if alumno.values.any?(&:empty?)
    unless alumno[:correo].match?(/\A[^\s@]+@[^\s@]+\.[^\s@]+\z/)
      halt 422, { error: 'Escribe un correo electrónico válido.' }.to_json
    end

    alumno
  rescue JSON::ParserError
    halt 400, { error: 'El cuerpo de la solicitud no contiene JSON válido.' }.to_json
  end

  def buscar_alumno(id)
    fila = DB.get_first_row(
      'SELECT id, nombre, correo, curso FROM alumnos WHERE id = ?',
      id
    )
    fila && {
      id: fila['id'],
      nombre: fila['nombre'],
      correo: fila['correo'],
      curso: fila['curso']
    }
  end
end

get '/alumnos' do
  alumnos = DB.execute('SELECT id, nombre, correo, curso FROM alumnos ORDER BY id DESC')
  alumnos.map do |alumno|
    {
      id: alumno['id'],
      nombre: alumno['nombre'],
      correo: alumno['correo'],
      curso: alumno['curso']
    }
  end.to_json
end

post '/alumnos' do
  alumno = validar_alumno
  DB.execute(
    'INSERT INTO alumnos (nombre, correo, curso) VALUES (?, ?, ?)',
    alumno.values
  )
  status 201
  buscar_alumno(DB.last_insert_row_id).to_json
end

put '/alumnos/:id' do
  alumno = validar_alumno
  id = params[:id].to_i
  halt 404, { error: 'No se encontró el alumno.' }.to_json unless buscar_alumno(id)

  DB.execute(
    'UPDATE alumnos SET nombre = ?, correo = ?, curso = ? WHERE id = ?',
    [alumno[:nombre], alumno[:correo], alumno[:curso], id]
  )
  buscar_alumno(id).to_json
end

delete '/alumnos/:id' do
  id = params[:id].to_i
  halt 404, { error: 'No se encontró el alumno.' }.to_json unless buscar_alumno(id)

  DB.execute('DELETE FROM alumnos WHERE id = ?', id)
  status 204
  body ''
end

not_found do
  { error: 'No se encontró la ruta solicitada.' }.to_json
end
