import { MessageAudioElement, MessageElement, MessageImageElement, MessageTextElement, MessageVideoElement, MessageYoutubeElement, Post, PostData, PostMessage } from '../post.model';

export class PostMapper {
  map(data: PostData): Post {
    return {
      ...data,
      message: this.parseMessage(`${data.message} ${data.attachementUrl ? data.attachementUrl : ''}`)
    }
  }

  private parseMessage(message: string): PostMessage {
    // TODO rajouter png jpg et gif
    const pictureRegex = /http[s]?:\/\/\S+\.(jpeg|jpg|png|gif)/gmi;

     // TODO mp4,wmv,flv,avi
    const videoRegex = /http[s]?:\/\/\S+\.(mp4|wmv|flv|avi)/gmi;

     // TODO mp3,ogg,wav
    const audioRegex = /http[s]?:\/\/\S+\.(mp3|ogg|wav)/gmi;

    const youtubeRegex = /http[s]?:\/\/?www\.(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\/?\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/gmi;
    
    const urlRegex = /((http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-]))/gmi;

    const attachements: MessageElement[] = [];

    var mappedMessage = message
    const urlMatches = [...mappedMessage.matchAll(urlRegex)]
    urlMatches.forEach(urlMatche => {
      mappedMessage = mappedMessage.replace(urlMatche[0], `<a href="${urlMatche[0]}">${urlMatche[0]}</a>`)
    });
    

    const pictureMatches = [...message.matchAll(pictureRegex)]    
    pictureMatches.forEach(pictureMatche => {
      attachements.push(
        {
          type: "image",
          url: pictureMatche[0]
        }
      )
    });

    const videoMatches = [...message.matchAll(videoRegex)]
    videoMatches.forEach(videoMatche => {
      attachements.push(
        {
          type: "video",
          url: videoMatche[0]
        }
      )
    });

    const audioMatches = [...message.matchAll(audioRegex)]
    audioMatches.forEach(audioMatche => {
      attachements.push(
        {
          type: "audio",
          url: audioMatche[0],
        }
      )
    });

    const youtubeMatches = [...message.matchAll(youtubeRegex)]
    youtubeMatches.forEach(youtubeMatche => {
      attachements.push(
        {
          type: 'youtube',
          videoId: youtubeMatche[1]
        }
      )
    });

    return {
      text: {
        type: 'text',
        content: mappedMessage
      } as MessageTextElement,
      attachements
    };
  }
}
