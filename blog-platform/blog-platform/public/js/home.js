const box = document.getElementById('posts');

function postCard(p) {
  return h('article', { class: 'card' },
    h('h2', {}, h('a', { href: `/post.html?id=${p._id}` }, p.title)),
    h('p', { class: 'desc' }, p.description),
    h('div', { class: 'meta' }, `By ${p.author?.name || 'Unknown'} on ${formatDate(p.createdAt)}`)
  );
}

(async () => {
  try {
    const posts = await api('/posts');
    if (!posts.length) {
      box.replaceChildren(h('p', { class: 'empty' }, 'No posts yet. ', h('a', { href: '/editor.html' }, 'Write the first one.')));
      return;
    }
    box.replaceChildren(...posts.map(postCard));
  } catch (err) {
    box.replaceChildren(h('p', { class: 'error' }, err.message));
  }
})();
