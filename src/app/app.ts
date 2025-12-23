import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Home } from './home/home';
import { SellerAuth } from './seller-auth/seller-auth';
import { ReactiveFormsModule } from '@angular/forms';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, ReactiveFormsModule, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ecom-project');
}
