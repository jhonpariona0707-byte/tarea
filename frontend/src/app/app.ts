import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Alumno, AlumnoInput, AlumnosService } from './alumnos.service';

@Component({
  imports: [FormsModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly alumnosService = inject(AlumnosService);

  alumnos: Alumno[] = [];
  form: AlumnoInput = this.formularioVacio();
  editingId: number | null = null;
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.cargarAlumnos();
  }

  cargarAlumnos(): void {
    this.loading = true;
    this.errorMessage = '';
    this.alumnosService.listar().subscribe({
      next: (alumnos) => {
        this.alumnos = alumnos;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo conectar con la API. Comprueba que el servidor Ruby esté iniciado.';
      },
    });
  }

  guardarAlumno(): void {
    const alumno: AlumnoInput = {
      nombre: this.form.nombre.trim(),
      correo: this.form.correo.trim(),
      curso: this.form.curso.trim(),
    };

    if (!alumno.nombre || !alumno.correo || !alumno.curso) {
      this.errorMessage = 'Completa todos los campos antes de guardar.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    const request = this.editingId === null
      ? this.alumnosService.crear(alumno)
      : this.alumnosService.actualizar(this.editingId, alumno);

    request.subscribe({
      next: (alumnoGuardado: Alumno) => {
        this.saving = false;
        this.successMessage = this.editingId === null
          ? 'El alumno se agregó correctamente.'
          : 'Los cambios se guardaron correctamente.';

        if (this.editingId === null) {
          this.alumnos = [alumnoGuardado, ...this.alumnos];
        } else {
          this.alumnos = this.alumnos.map((alumnoActual) =>
            alumnoActual.id === alumnoGuardado.id ? alumnoGuardado : alumnoActual,
          );
        }

        this.cancelarEdicion();
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
        this.errorMessage = error.error?.error ?? 'No se pudo guardar el alumno. Inténtalo de nuevo.';
      },
    });
  }

  editarAlumno(alumno: Alumno): void {
    this.editingId = alumno.id;
    this.form = {
      nombre: alumno.nombre,
      correo: alumno.correo,
      curso: alumno.curso,
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  eliminarAlumno(alumno: Alumno): void {
    if (!window.confirm(`¿Eliminar a ${alumno.nombre}?`)) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.alumnosService.eliminar(alumno.id).subscribe({
      next: () => {
        this.successMessage = 'El alumno se eliminó correctamente.';
        this.alumnos = this.alumnos.filter((alumnoActual) => alumnoActual.id !== alumno.id);
        if (this.editingId === alumno.id) {
          this.cancelarEdicion();
        }
      },
      error: () => {
        this.errorMessage = 'No se pudo eliminar el alumno. Inténtalo de nuevo.';
      },
    });
  }

  cancelarEdicion(): void {
    this.editingId = null;
    this.form = this.formularioVacio();
  }

  iniciales(nombre: string): string {
    return nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0].toUpperCase())
      .join('');
  }

  private formularioVacio(): AlumnoInput {
    return { nombre: '', correo: '', curso: '' };
  }
}
