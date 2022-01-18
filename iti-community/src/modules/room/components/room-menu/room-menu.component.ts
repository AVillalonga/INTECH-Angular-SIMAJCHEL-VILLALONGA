import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { FeedStore } from 'src/modules/feed/feed.store';
import { Room, RoomType } from '../../room.model';
import { RoomStore } from '../../room.store';
import { RoomQueries } from '../../services/room.queries';
import { RoomService } from '../../services/room.service';
import { RoomSocketService } from '../../services/room.socket.service';
import { RoomCreateModalComponent } from '../room-create-modal/room-create-modal.component';
@Component({
  selector: 'app-room-menu',
  templateUrl: './room-menu.component.html',
  styleUrls: ['./room-menu.component.less']
})
export class RoomMenuComponent implements OnInit {

  @ViewChild('modal') modal: RoomCreateModalComponent;

  roomId$: Observable<string | undefined>;
  rooms: Room[];

  constructor(
    private feedStore: FeedStore,
    private queries: RoomQueries,
    private roomSocketService: RoomSocketService,
    private router: Router
  ) {
    this.roomId$ = feedStore.roomId$;
    this.rooms = [];
  }

  async ngOnInit() {
    this.rooms = await this.queries.getAll();

    // Initialize events
    this.feedStore.onRoomIdChange(this.onRoomChange.bind(this));
    this.roomSocketService.onNewRoom(this.onNewRoom.bind(this));

    // Redirection
    if(this.lastestRoom.length == 0) {
      // First room
      this.roomId$.subscribe(async id => {
        if (typeof id === 'undefined') await this.router.navigate(['/', this.rooms[0].id]);
      });
    } else {
      // Last room visited
      this.router.navigate(['/', this.lastestRoom]);
    }
  }

  onNewRoom = (room: Room) => this.rooms.push(room);

  onRoomChange = (roomId: string | undefined) => {
    if (roomId) this.lastestRoom = roomId;
  }

  get lastestRoom(): string { return localStorage.getItem("iti.roomid") || ""; }
  set lastestRoom(roomId: string) { localStorage.setItem("iti.roomid", roomId); }
}
