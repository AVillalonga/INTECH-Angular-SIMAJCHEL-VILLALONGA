import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthenticationStore } from 'src/modules/authentication/authentication.store';
import { StateMutation } from 'src/modules/common/Store';
import { WebsocketConnection } from 'src/modules/common/WebsocketConnection';
import { AnyNotification, NewUserNotification, PostLikedNotification, RoomAddedNotification } from 'src/modules/notification/notification.model';
import { NotificationState } from 'src/modules/notification/notification.state';
import { NotificationStore } from 'src/modules/notification/notification.store';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { NotificationSocketService } from 'src/modules/notification/services/notification.socket.service';
import { FeedDatePipe } from 'src/modules/feed/pipe/feed-date.pipe';
import { UserService } from 'src/modules/user/services/user.service';
import { UserQueries } from 'src/modules/user/services/user.queries';
import { environment as envDev } from '../../../environments/environment';
import { Router } from '@angular/router';
import { PostService } from 'src/modules/feed/services/post.service';
import { PostQueries } from 'src/modules/feed/services/post.queries';


@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.less']
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  sub?: Subscription;
  notification$ = this.notificationStore.value$;
  showDrawer: boolean = false;

  constructor(
    private socket: WebsocketConnection,
    private notificationSocketSercice: NotificationSocketService,
    private authStore: AuthenticationStore,
    private notificationStore: NotificationStore,
    private notificationService: NotificationService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.sub = this.authStore.accessToken$.subscribe(accessToken => {
      if (accessToken) {
        this.socket.connect(accessToken);
      } else {
        this.socket.disconnect();
      }
    });

    this.notificationService.fetch();
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  onToggleNotifications() {
    this.showDrawer = !this.showDrawer;
    if (!this.showDrawer) this.notificationService.markAsViewed();
  }

  redirectByNotif(notif: AnyNotification) {
    console.log(notif);
    switch (notif.subject) {
      case 'new_user':
        // ne rien faire..
        break;

      case 'post_liked':
        // ne rien faire..
        break;

      case 'room_added':
        this.router.navigate(['/', (notif as RoomAddedNotification).payload.room.id]);
        this.onToggleNotifications();
        return;
    }

    this.notificationService.markAsViewed();
  }
}
