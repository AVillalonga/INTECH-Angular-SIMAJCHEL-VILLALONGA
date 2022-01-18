import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Post } from '../../post.model';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.less']
})
export class PostComponent implements OnInit, AfterViewInit {
  @Input()
  post: Post;

  @ViewChild("anchor")
  anchor: ElementRef<HTMLDivElement>;

  get photo() {
    return this.post.createdBy.photoUrl != undefined
      ? { 'background-image': `url(${this.post.createdBy.photoUrl})` }
      : { 'background-image': `none` };
  }

  constructor(private postService: PostService) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.anchor.nativeElement.scrollIntoView();
  }

  like() {
    this.post.liked = true;
    this.postService.like(this.post);
  }
}
