const API_BASE = "https://mini-instagram-api.mistcloud.workers.dev";
const API_KEY = "ivapikey123";

const headers = { "x-api-key": API_KEY };

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => response.statusText);
    throw new Error(msg || `Request failed (${response.status})`);
  }

  return response.json();
}

// API METHODS

export function fetchPosts() {
  return request(`${API_BASE}/api/posts`);
}

export function fetchPost(id) {
  return request(`${API_BASE}/api/posts/${id}`);
}

export function fetchComments(postId) {
  return request(`${API_BASE}/api/comments/${postId}`);
}

export function createPost(formData) {
  return request(`${API_BASE}/api/posts`, {
    method: "POST",
    body: formData,
  });
}