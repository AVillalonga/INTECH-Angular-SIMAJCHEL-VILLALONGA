import { Injectable } from "@angular/core";
import { distinctUntilChanged } from "rxjs/operators";
import { AuthenticationStore } from "src/modules/authentication/authentication.store";
import { WebSocketTopic } from "src/modules/common/WebSocketTopic";
import { AnyNotification } from "../notification.model";
import { NotificationStore } from "../notification.store";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { WebNotificationService } from "./web-notification.service";
import { RoomSocketService } from "src/modules/room/services/room.socket.service";

@Injectable()
export class NotificationSocketService {
  private subscription?: [string, (notif: AnyNotification) => any];

  constructor(
    private socketTopic: WebSocketTopic,
    private authStore: AuthenticationStore,
    private notificationStore: NotificationStore,
    private nzNotificationService: NzNotificationService) {
    authStore.get(s => s ? s.userId : undefined)
      .pipe(distinctUntilChanged())
      .subscribe(userId => {
        if (!this.subscription) {
          return;
        }

        this.unsubscribe(this.subscription[0], this.subscription[1]);

        if (userId) {
          this.subscription[0] = userId;
          this.subscribe(this.subscription[0], this.subscription[1]);
        }
      });

    this.onNewNotification(this.appendNotification.bind(this));
  }




  onNewNotification(callback: (notif: AnyNotification) => any) {
    if (!this.authStore.value) {
      throw new Error("User should be authenticated before listening to its notifications");
    }

    if (this.subscription) {
      this.unsubscribe(this.subscription[0], this.subscription[1]);
    }
    
    const userId = this.authStore.value.userId;
    this.subscribe(userId, callback);
  }




  private appendNotification(notif: AnyNotification) {

    console.log(notif);

    this.notificationStore.appendNotification(notif);
    let title = notif.payload.user.username;
    let content = '';
    switch (notif.subject) {
      case 'new_user':
        title += ' viens de nous rejoindre';
        break;

      case 'post_liked':
        title += ' à liker l\'un de vos post';
        content = notif.payload.preview;
        break;

      case 'room_added':
        title += ' à ajouté la room ' + notif.payload.room.name;
        break;
    }

    this.nzNotificationService.info(title, content, {
      nzStyle: {
        width: '600px'
      }
    });
  }




  private subscribe(userId: string, callback: (notif: AnyNotification) => any) {
    this.subscription = [userId, callback];
    this.socketTopic.subscribe(`notifications_${userId}`, callback);
    this.socketTopic.subscribe(`notifications`, callback);
  }




  private unsubscribe(userId: string, callback: (notif: AnyNotification) => any) {
    this.socketTopic.unsubscribe(`notifications_${userId}`, callback);
    this.socketTopic.unsubscribe(`notifications`, callback);
  }
}
