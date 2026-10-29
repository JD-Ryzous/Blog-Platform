const postId = new URLSearchParams(location.search).get('id');
const form = document.getElementById('post-form');
const msg = document.getElementById('msg');

// Only logged-in users can write
if (!Auth.token) {
  location.replace(`/login.html?redirect=${encodeURIComponent(location.pathname + location.search)}`);
}

// Edit mode: load the existing post into the form
if (postId) {
  document.getElementById('page-title').textContent = 'Edit blog post';
  document.getElementById('save-btn').textContent = 'Save changes';
  document.title = 'Edit Blog - BlogSpace';
  api(`/posts/${postId}`)
    .then((post) => {
      if (post.author._id !== Auth.user?.id) {
        showMessage(msg, 'You can only edit your own posts.');
        form.hidden = true;
        return;
      }
      form.elements.title.value = post.title;
      form.elements.description.value = post.description;
      form.elements.content.value = post.content;
    })
    .catch((err) => { showMessage(msg, err.message); form.hidden = true; });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const button = document.getElementById('save-btn');
  button.disabled = true;
  msg.hidden = true;
  const body = {
    title: form.elements.title.value,
    description: form.elements.description.value,
    content: form.elements.content.value
  };
  try {
    const post = postId
      ? await api(`/posts/${postId}`, { method: 'PUT', body })
      : await api('/posts', { method: 'POST', body });
    location.href = `/post.html?id=${post._id}`;
  } catch (err) {
    showMessage(msg, err.message);
    button.disabled = false;
  }
});
