import {Socket} from "phoenix"

let socket = new Socket("/socket", {params: {token: window.userToken}})

socket.connect()

const createSocket = topicId => {
  let channel = socket.channel(`comments:${topicId}`, {});

  channel.join()
    .receive("ok", resp => {
      console.log(resp);
      document.querySelector('.collection').innerHTML = renderComments(resp.comments).join('');
      })
    .receive("error", resp => { console.log("Unable to join", resp) })

    channel.on(`comments:${topicId}:new`, renderComment);

    document.querySelector('button').addEventListener('click', () => {
      const content = document.querySelector('textarea').value;
      if (content.length > 0) {
        channel.push('comment:add', {content: escapeHtml(content)});
        document.querySelector('textarea').value = '';
      }
    });
}

const commentTemplate = comment => {
  let email = 'Anonymous';
  if (comment.user) {
    email = comment.user.email;
  }
  return(`<li class="collection-item">${(comment.content)}<div class="secondary-content">${email}</div></li>`);

};

const renderComments = comments => comments.map(comment => commentTemplate(comment));

const renderComment = event => {
  document.querySelector('.collection').innerHTML += commentTemplate(event.comment);
}

const escapeHtml = unsafe => unsafe
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

window.createSocket = createSocket;
