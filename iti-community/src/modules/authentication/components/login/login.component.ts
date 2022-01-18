import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from "ng-zorro-antd/message";
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private nzMessageService: NzMessageService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      error: ['']
    });
  }

  goToRegistration(): void { this.router.navigate(["/splash/register"]); }

  submit() {
    this.login();
  }

  async login() {
    if (this.loginForm.valid) {
      try {
        const response = await this.authService.authenticate(
          this.loginForm.controls.username.value,
          this.loginForm.controls.password.value
        );
        
        if (response) {
          response.success
            ? await this.router.navigate(['/'])
            : this.nzMessageService.error("Nom d'utilisateur ou mot de passe incorrect");
        } else {
          this.nzMessageService.error("Une erreur est survenue. Veuillez réessayer plus tard");
        }

      } catch (exception) {
        this.nzMessageService.error("Une erreur est survenue. Veuillez réessayer plus tard");
      }
    }
  }
}
