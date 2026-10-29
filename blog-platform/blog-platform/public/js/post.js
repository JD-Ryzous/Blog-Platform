const id = new URLSearchParams(location.search).get('id');
const postBox = document.getElementById('post');
const commentsBox = document.getElementById('comments');
const user = Auth.user;

async function loadPost() {
  try {
    const post = await api(`/posts/${id}`);
    document.title = `${post.title} - BlogSpace`;
    const isOwner = user && post.author._id === user.id;

    postBox.replaceChildren(
      h('h1', {}, post.title),
      h('div', { class: 'meta' }, `By ${post.author?.name || 'Unknown'} on ${formatDate(post.createdAt)}`),
      isOwner && h('div', { class: 'actions' },
        h('a', { class: 'btn outline small', href: `/editor.html?id=${post._id}` }, 'Edit'),
        h('button', { class: 'btn danger small', onclick: () => deletePost(post._id) }, 'Delete')
      ),
      h('div', { class: 'article-body' }, post.content)
    );
    commentsBox.hidden = false;
    loadComments();
  } catch (err) {
    postBox.replaceChildren(h('p', { class: 'error' }, err.message), h('a', { href: '/' }, 'Back to home'));
  }
}

async function deletePost(postId) {
  if (!confirm('Delete this post and all its comments?')) return;
  try {
    await api(`/posts/${postId}`, { method: 'DELETE' });
    location.href = '/';
  } catch (err) {
    alert(err.message);
  }
}

async function loadComments() {
  const list = document.getElementById('comment-list');
  try {
    const comments = await api(`/posts/${id}/comments`);
    document.getElementById('comment-count').textContent = `Comments (${comments.length})`;
    if (!comments.length) {
      list.replaceChildren(h('p', { class: 'empty' }, 'No comments yet. Start the conversation.'));
      return;
    }
    list.replaceChildren(...comments.map((c) =>
      h('div', { class: 'comment' },
        h('div', { class: 'comment-head' },
          h('span', { class: 'meta' }, `${c.author?.name || 'Unknown'} on ${formatDate(c.createdAt)}`),
          user && c.author?._id === user.id &&
            h('button', { class: 'btn danger small', onclick: () => deleteComment(c._id) }, 'Delete')
        ),
        h('p', {}, c.text)
      )
    ));
  } catch (err) {
    list.replaceChildren(h('p', { class: 'error' }, err.message));
  }
}

async function deleteComment(commentId) {
  try {
    await api(`/comments/${commentId}`, { method: 'DELETE' });
    loadComments();
  } catch (err) {
    alert(err.message);
  }
}

// Comment form (logged-in users) or a login prompt
const formBox = document.getElementById('comment-form-box');
if (user) {
  const msg = h('div', { class: 'message error', hidden: '' });
  const textarea = h('textarea', { name: 'text', required: '', maxlength: '1000', placeholder: 'Write a comment...' });
  const button = h('button', { class: 'btn', type: 'submit' }, 'Post comment');
  const form = h('form', { class: 'comment-form' }, textarea, msg, button);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    button.disabled = true;
    msg.hidden = true;
    try {
      await api(`/posts/${id}/comments`, { method: 'POST', body: { text: textarea.value } });
      textarea.value = '';
      loadComments();
    } catch (err) {
      showMessage(msg, err.message);
    }
    button.disabled = false;
  });
  formBox.replaceChildren(form);
} else {
  const back = encodeURIComponent(location.pathname + location.search);
  formBox.replaceChildren(
    h('p', { class: 'message info' }, h('a', { href: `/login.html?redirect=${back}` }, 'Log in'), ' to join the discussion.')
  );
}

loadPost();
