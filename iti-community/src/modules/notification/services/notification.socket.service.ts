import { Injectable } from "@angular/core";
import { distinctUntilChanged } from "rxjs/operators";
import { AuthenticationStore } from "src/modules/authentication/authentication.store";
import { WebSocketTopic } from "src/modules/common/WebSocketTopic";
import { AnyNotification } from "../notification.model";
import { NotificationStore } from "../notification.store";

@Injectable()
export class NotificationSocketService {
  private subscription?: [string, (notif: AnyNotification) => any];

  constructor(
    private socketTopic: WebSocketTopic,
    private authStore: AuthenticationStore,
    private notificationStore: NotificationStore) {
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
    this.notificationStore.appendNotification(notif);
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
