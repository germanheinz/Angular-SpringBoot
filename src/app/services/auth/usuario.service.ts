import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from '../../config/config';
import { Usuario } from '../../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private _usuario: Usuario;
  private _token: string;

  constructor(private http: HttpClient) { }

  // GETTER USUARIO //
  // GUARDAR EN STORAGE //
  public get usuario(): Usuario {
    if (this._usuario != null) {
      return this._usuario;
    } else if (this.usuario == null && sessionStorage.getItem('usuario') == null) {
        this._usuario = JSON.parse(sessionStorage.getItem('usuario')) as Usuario;
        return this._usuario;
    }
    return new Usuario();
  }
  // GETTER TOKEN //
  // GUARDAR EN STORAGE //
  public get token(): string {
    if (this._token != null) {
      return this._token;
    } else if (this._token == null && sessionStorage.getItem('token') != null) {
        this._token = sessionStorage.getItem('token');
        return this._token;
    }
    return null;
  }

  // METODO LOGIN
  login(usuario: Usuario): Observable<any> {

    const url = 'http://localhost:8080/oauth/token';

    const credenciales = btoa('angularapp' + ':' + '12345');

    const httpHeaders = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + credenciales});

    let params = new URLSearchParams();
    params.set('grant_type', 'password');
    params.set('username', usuario.username);
    params.set('password', usuario.password);
    console.log(params.toString());


    return this.http.post<any>(url, params.toString(), {headers: httpHeaders});
  }
  // GUARDAR USUARIO EN LOCAL STORAGE
  guardarUsuario(accessToken: string): void {
    let payload = this.payload(accessToken);
    this._usuario = new Usuario();
    this._usuario.nombre = payload.nombre;
    this._usuario.apellido = payload.apellido;
    this._usuario.email = payload.email;
    this._usuario.username = payload.user_name;
    this._usuario.roles = payload.authorities;
    sessionStorage.setItem('usuario', JSON.stringify(this._usuario));
  }
  // GUARDAR TOKEN EN LOCAL STORAGE
  guardarToken(accessToken: string): void {
    this._token = accessToken;
    sessionStorage.setItem('token', this._token);
  }
  payload(accessToken: string): any {
    if (accessToken != null) {
      return JSON.parse(atob(accessToken.split('.')[1]));
    }
    return null;
  }
  isAuthenticated(): boolean {
    let payload = this.payload(this.token);
    if (payload != null && payload.user_name && payload.user_name.length > 0) {
        return true;
    }
    return false;
  }
  logout(): void {
    this._token = null;
    this._usuario = null;
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.clear();
  }

  hasRole(role: string): boolean {
    if (this.usuario.roles.includes(role)) {
      return true;
    }
    return false;
  }
}
