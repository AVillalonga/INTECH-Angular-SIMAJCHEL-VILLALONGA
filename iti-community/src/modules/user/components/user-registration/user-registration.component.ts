import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Observer } from 'rxjs';
import { UserQueries } from '../../services/user.queries';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.less']
})
export class UserRegistrationComponent implements OnInit {

  registrationForm: FormGroup;
  // model = new UserRegistrationFormModel();

  constructor(
    private router: Router,
    private userService: UserService,
    private userQueries: UserQueries,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      username: ['', [Validators.required], [this.userNameAsyncValidator]],
      password: ['', [Validators.required]],
      confirm_password: ['', [this.confirmPasswordValidator]]
    })
  }

  goToLogin(): void { this.router.navigate(["/splash/login"]); }

  confirmPasswordValidator = (control: FormControl) => {
    if (!control.value) return { required: true };
    if (control.value !== this.registrationForm.controls.password.value) return { confirm: true, error: true };
    return {};
  };

  usernameAlreadyUsed = async (control: FormControl) => {
    let r = {};
    if (!control.value) r = { required: true };
    if (await this.userQueries.exists(control.value)) r = { exist: true, error: true };
    console.log(r);
    return r;
  };

  userNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      setTimeout(async () => {
        if (await this.userQueries.exists(control.value)) observer.next({ error: true, duplicated: true });
        else observer.next(null);
        observer.complete();
      }, 1000);
    });

  async submit() {
    if (this.registrationForm.valid) {
      const username = this.registrationForm.controls.username.value;
      const password = this.registrationForm.controls.password.value;
      const response = await this.userQueries.exists(username);
      if (!response) {
        await this.userService.register(username, password);
        this.goToLogin()
      }
    }
  }

}