import { Injectable, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { AnyNotification } from "../notification.model";
import { NotificationSocketService } from "./notification.socket.service";


@Injectable()
export class WebNotificationService {

    public hasPermission: boolean = false;

    private static STATUS = {
        GRANTED: "granted",
        DENIED: "denied",
        DEFAULT: "default"
    };

    constructor(
        private notificationSocketService: NotificationSocketService,
        private router: Router,
        private ngZone: NgZone) {
        if (this._isGranted()) {
            this.hasPermission = true;
        } else {
            if (this._isNotDenied()) {
                Notification.requestPermission(this._requirePermission.bind(this));
            } else {
                if (this._isDefault()) {
                    alert('DEFAULT NOTIFICATION');
                } else {
                    alert("WEB NOTIFICATION DISABLED");
                }
            }
        }
        this.notificationSocketService.onNewNotification(this.appendWebNotification.bind(this));
    }

    public appendWebNotification(notification: AnyNotification) {
        if (this.hasPermission && !this._isVisible()) {
            let title = notification.payload.user.username;
            let content = '';
            let imageUrl = '';
            let url: string[] = [];
            let postId = '';
            let roomId = '';
            
            switch (notification.subject) {
                case 'new_user':
                    title += ' viens de nous rejoindre';
                    imageUrl = '/assets/icons/new_user.png';
                    break;

                case 'post_liked':
                    title += ' à liker l\'un de vos post';
                    content = notification.payload.preview;
                    url = ['/', notification.payload.roomId];
                    imageUrl = '/assets/icons/like.png';
                    break;

                case 'room_added':
                    title += ' à ajouté la room ' + notification.payload.room.name;
                    imageUrl = '/assets/icons/add_room.png';
                    url = ['/', notification.payload.room.id];
                    break;
            }

            const webNotification = new Notification(title, { body: content, icon: imageUrl });
            if(url.length > 0) {
                webNotification.onclick = async () => {
                    console.log(url);
                    this.ngZone.run(() => { this.router.navigate(url); });
                };
            }
        }
    }

    private _requirePermission(permissionResult: NotificationPermission) {
        if (permissionResult === WebNotificationService.STATUS.GRANTED) {
            this.hasPermission = true;
        }
    }

    private _isGranted =
        (): boolean => (window.Notification && Notification.permission === WebNotificationService.STATUS.GRANTED);

    private _isNotDenied =
        (): boolean => (window.Notification && Notification.permission !== WebNotificationService.STATUS.DENIED);

    private _isDefault =
        (): boolean => (window.Notification && Notification.permission === WebNotificationService.STATUS.DEFAULT);

    private _isVisible =
        (): boolean => (document.visibilityState === 'visible')

}