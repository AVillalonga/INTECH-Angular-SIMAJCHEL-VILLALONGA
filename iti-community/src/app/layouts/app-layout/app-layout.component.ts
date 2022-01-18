import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthenticationStore } from 'src/modules/authentication/authentication.store';
import { StateMutation } from 'src/modules/common/Store';
import { WebsocketConnection } from 'src/modules/common/WebsocketConnection';
import { AnyNotification } from 'src/modules/notification/notification.model';
import { NotificationState } from 'src/modules/notification/notification.state';
import { NotificationStore } from 'src/modules/notification/notification.store';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { NotificationSocketService } from 'src/modules/notification/services/notification.socket.service';

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
    private authStore: AuthenticationStore,
    private notificationStore: NotificationStore,
    private notificationService: NotificationSocketService) {
  }

  ngOnInit(): void {
    this.sub = this.authStore.accessToken$.subscribe(accessToken => {
      if (accessToken) {
        this.socket.connect(accessToken);
      } else {
        this.socket.disconnect();
      }
    });

    this.notification$.subscribe(o => {
      console.log('notifications :', o.notifications.map(p => p.payload));
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
  
  onToggleNotifications() {
    this.showDrawer = !this.showDrawer
  }

}
