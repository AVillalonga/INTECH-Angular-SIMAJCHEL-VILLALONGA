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
    
    const urlRegex = /((http|ftp|https):\/\/(?:[\w_-]+(?:(?:(?::[0-9]{1,5})?(\.[\w_-]+)+)?))(?:[\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-]))/gmi;
    
    //const userTagRegex = /(?:\s|^)(@[a-zA-Z0-9](?:[._-](?![._-])|[a-zA-Z0-9]){1,18}[a-zA-Z0-9])(?:\s|[\b]|$)/gmi;
    const userTagRegex = /(?:\B)(@[a-zA-Z0-9](?:[._-](?![._-])|[a-zA-Z0-9]){1,18}[a-zA-Z0-9])/gmi;

    const attachements: MessageElement[] = [];

    var mappedMessage = message
    const urlMatches = [...mappedMessage.matchAll(urlRegex)]
    console.log(urlMatches);
    console.log(message);
    
    
    const uniqueUrlMatches = new Set(urlMatches.map(match => match[0]));
     
    uniqueUrlMatches.forEach(urlMatche => {
      mappedMessage = mappedMessage.replace(
        new RegExp(`${urlMatche}`, 'gim'), 
        `<a href="${urlMatche}" target="_blank">${urlMatche}</a>`)
    });

    
    const userTagMatches = [...mappedMessage.matchAll(userTagRegex)]
    const uniqueUserTagMatches = new Set(userTagMatches.map(match => match[1]));
    uniqueUserTagMatches.forEach(userTagMatche => {
      mappedMessage = mappedMessage.replace(
        new RegExp(`(?:\\B)${userTagMatche}`, 'gim'), 
        `<span class="user-tag">${userTagMatche}</span>`)
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
