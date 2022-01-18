import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
import { Observable } from 'rxjs';
import { FeedStore } from '../../feed.store';
import { Post } from '../../post.model';
import { PostService } from '../../services/post.service';
import { FeedSocketService } from '../../services/feed.socket.service';
import { PageModel } from 'src/modules/common/Pagination';
@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.less']
})
export class FeedComponent implements OnInit {

  @ViewChild('feed') private bottomRef: ElementRef;
  
  roomId$: Observable<string | undefined>;
  pageModel: PageModel = { page: 0, perPage: 10000 };
  posts$: Observable<Post[]>;

  constructor(
    private postService: PostService,
    private store: FeedStore,
    private socketService: FeedSocketService
  ) {
    this.posts$ = this.store.get(s => s.posts);
    this.roomId$ = this.store.roomId$;
  }

  async ngOnInit() {
    this.store.onRoomIdChange(async roomId => {
      if (roomId) await this.postService.fetch(roomId, this.pageModel);
    });

    this.roomId$.subscribe(async roomId => {
      if (roomId) await this.socketService.onNewPost(roomId, this.onNewPost.bind(this, roomId));
    });
  }

  async onNewPost(roomId: string, post: Post) {
    this.store.appendPost(post);
  }

}
