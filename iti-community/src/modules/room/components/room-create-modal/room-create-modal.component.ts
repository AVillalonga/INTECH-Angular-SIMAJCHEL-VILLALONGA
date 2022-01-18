import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { RoomType } from '../../room.model';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-room-create-modal',
  templateUrl: './room-create-modal.component.html',
  styleUrls: ['./room-create-modal.component.less']
})
export class RoomCreateModalComponent implements OnInit {

  roomCreationForm: FormGroup;
  isVisible: boolean = false;

  constructor(
    private roomService: RoomService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.roomCreationForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]]
    })
  }

  async submit() {
    if (this.roomCreationForm.valid) {
      this.roomService.create(this.roomCreationForm.controls.name.value, this.roomCreationForm.controls.type.value);
      this.close();
    } else {
      for (const key in this.roomCreationForm.controls) {
        const formElement = this.roomCreationForm.get(key);
        if (formElement instanceof FormControl) formElement.updateValueAndValidity();
        /* @TODO: FIX (Show error onsubmit()) */
      }
    }
  }

  open() { this.isVisible = true; }
  close() { this.isVisible = false; }
}
