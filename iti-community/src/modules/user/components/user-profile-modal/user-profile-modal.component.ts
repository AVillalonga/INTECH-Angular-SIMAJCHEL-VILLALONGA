import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, ValidationErrors, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../user.model';
import { Observable, Observer } from 'rxjs';
import { UserQueries } from '../../services/user.queries';

export class UserProfileForm {
  id: string;
  username: string;
  photoUrl?: string;
  _file?: File;
  user: User;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.photoUrl = user.photoUrl;
    this.user = user;
  }

  get file() {
    return this._file;
  }

  set file(file: File | undefined) {
    this._file = file;
    if (file) {
      this.toBase64(file).then(s => {
        this.photoUrl = s;
      })
    }
  }

  toBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  hasChanged(): boolean {
    return !!this.file || this.username !== this.user.username
  }
}

@Component({
  selector: 'app-user-profile-modal',
  templateUrl: './user-profile-modal.component.html',
  styleUrls: ['./user-profile-modal.component.less']
})
export class UserProfileModalComponent implements OnInit {
  @Input()
  user: User;

  formProfileEdition: FormGroup;
  supportedTypes = "";
  isVisible: boolean = false;
  model: UserProfileForm;

  constructor(
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private userQueries: UserQueries
  ) { }

  ngOnInit(): void {
    this.model = new UserProfileForm(this.user);
    this.formProfileEdition = this.fb.group({
      username: ['', [Validators.required], [this.userNameAsyncValidator]]
    });
  }

  get photoUrl(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.model.photoUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/434px-Unknown_person.jpg");
  }
  
  userNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      setTimeout(async () => {
        if (await this.userQueries.exists(control.value)) observer.next({ error: true, duplicated: true });
        else observer.next(null);
        observer.complete();
      }, 1000);
    });

  async onOk() {
    if (this.formProfileEdition.valid) {
      if (this.model.hasChanged()) {
        this.userService.update({
          id: this.model.id,
          username: this.model.username,
          photo: this.model.file
        })
      }
      this.close();
    }
  }

  onFileUpload = (file: File) => {
    this.model.file = file;
    return false;
  }

  onCancel() {
    this.close();
  }

  open() {
    this.model = new UserProfileForm(this.user);
    this.formProfileEdition.reset();
    this.isVisible = true;
  }

  close() {
    this.isVisible = false;
  }
}
