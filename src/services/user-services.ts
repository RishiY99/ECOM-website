import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { SignUpData, LoginData } from './types';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserServices {

  userlogininvalid = new EventEmitter<boolean>

  constructor(private http: HttpClient, private route: Router) { }

  createuser(data: SignUpData) {
    this.http.post('http://localhost:3000/Users', data, { observe: 'response' }).subscribe((res) => {
      if (res) {
        localStorage.setItem("user", JSON.stringify(res.body))
        this.route.navigate(["/"])
      }
    })
  }

  userauth() {
    if (localStorage.getItem("user")) {
      this.route.navigate(["/"])

    }
  }

  userlogin(data: LoginData) {
    this.http.get<SignUpData[]>(`http://localhost:3000/Users?email=${data.email}&password=${data.password}`, { observe: 'response' })
      .subscribe((res) => {
        if (res && res.body && res.body.length > 0) {
          localStorage.setItem("user", JSON.stringify(res.body[0]))
          this.userlogininvalid.emit(false)
          this.route.navigate(["/"])
        } else {
          this.userlogininvalid.emit(true)

        }
      })
  }
}
