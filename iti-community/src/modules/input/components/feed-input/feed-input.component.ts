import { Component, EventEmitter, OnInit, Output, ViewChild, ViewChildren } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopoverComponent, NzPopoverDirective } from 'ng-zorro-antd/popover';
import { UserService } from 'src/modules/user/services/user.service';
import { User } from 'src/modules/user/user.model';
import { MessageSentEventPayload } from '../../input.model';

@Component({
  selector: 'app-feed-input',
  templateUrl: './feed-input.component.html',
  styleUrls: ['./feed-input.component.less']
})
export class FeedInputComponent {
  @Output()
  messageSent: EventEmitter<MessageSentEventPayload> = new EventEmitter();

  @ViewChild(NzPopoverDirective)
  inputPopover: NzPopoverDirective;

  /**
   * Hold the input message
   */
  message: string = "";

  users: User[] = [];

  /**
   * Staging file to upload
   */
  _file: File | null = null;
  set file(value: File | null) { this._file = value }
  get file() { return this._file; }

  currentMention?: RegExpMatchArray;

  supportedTypes = "image/png,image/jpeg,image/gif,image/bmp,image/bmp,video/mpeg,audio/mpeg,audio/x-wav,image/webp,video/mp4";

  constructor(
    private userService: UserService,
    private messageService: NzMessageService
  ) { }

  /**
   * Triggered when the user is selecting a mention in the list.
   * @param user The mentioned user
   */
  chooseMention(user: User) {
    if (this.currentMention) {
      this.message = this.message.substr(0, this.currentMention.index! + 1) + user.username + this.message.substr(this.currentMention.index! + this.currentMention[1].length + 1) + " ";
    }
    this.hideMentionList();
  }


  /**
   * Display the mention list
   * @param mentionMatch The mention regexp match
   */
  showMentionList(mentionMatch: RegExpMatchArray) {
    this.currentMention = mentionMatch;
    this.inputPopover.show();
  }

  /**
   * Hide the mention list
   */
  hideMentionList() {
    this.inputPopover.hide();
    this.currentMention = undefined;
  }


  /**
   * Message change event handler
   * @param message
   */
  onMessageChanged(message: string) {
    this.message = message;
  }

  /**
   * Close tag event handler. Trigger when the user wants to remove a file.
   */
  onCloseTag() { this.file = null; }

  /**
  * Event handler
  * @param file the file privded by the user
  */
  onFileUpload = (file: File) => {
    const type = this.supportedTypes.split(",").filter(sT => sT === file.type)[0] || undefined;

    if(type) {
      this.file = file;
    } else {
      this.messageService.error(`Impossible d'envoyer des '${file.name.split('.').pop()}'`);
    }

    return false;
  }

  /**
   * InputKeyDown event handler. Used to watch "Enter" key press
   * @param e
   */
  onInputKeyDown(e: KeyboardEvent) {
    // True if "Enter" is pressed without th shift or CTRL key pressed
    if (e.key.toLowerCase() === "enter" && !e.shiftKey && !e.ctrlKey) {
      e.stopImmediatePropagation();
      e.preventDefault();
      e.stopPropagation();

      this.send();
    }
  }

  /**
   * InputKeyUp event handler. Use to watch arrows key press to know when to show mention list
   * @param e
   */
  onInputKeyUp(e: KeyboardEvent) {}

  async searchMentionedUsers(search: string) {
    if (!search) {
      this.users = [];
    } else {
      this.users = await this.userService.search(search);
    }
  }

  /**
   * Send the input message
   */
  send() {
    if (!this.message && !this.file) return;
    this.fireMessageSent();
    this.clear();
  }

  /**
   * Emit the "messageSent" event
   */
  fireMessageSent() {
    this.messageSent.emit({ date: new Date(Date.now()), message: this.message, file: (this.file || undefined) });
  }

  /**
   * Clear the message to reset the input
   */
  clear() {
    this.message = "";
    this.file = null;
    this.inputPopover.hide();
  }
}
