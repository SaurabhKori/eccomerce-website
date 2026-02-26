import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Login } from './features/auth/login/login';
// import { Register } from './features/auth/register/register';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'ecommerce-website';
}
