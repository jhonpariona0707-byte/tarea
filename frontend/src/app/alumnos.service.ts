import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Alumno {
  id: number;
  nombre: string;
  correo: string;
  curso: string;
}

export type AlumnoInput = Omit<Alumno, 'id'>;

@Injectable({ providedIn: 'root' })
export class AlumnosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:4567/alumnos';

  listar(): Observable<Alumno[]> {
    return this.http.get<Alumno[]>(this.apiUrl);
  }

  crear(alumno: AlumnoInput): Observable<Alumno> {
    return this.http.post<Alumno>(this.apiUrl, alumno);
  }

  actualizar(id: number, alumno: AlumnoInput): Observable<Alumno> {
    return this.http.put<Alumno>(`${this.apiUrl}/${id}`, alumno);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
