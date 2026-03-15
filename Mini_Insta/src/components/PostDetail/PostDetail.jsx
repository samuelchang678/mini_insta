import { useState, useEffect } from "react";

import { fetchPost, fetchComments } from "../../Util/miniInstagram-api";
import './PostDetail.scss'

function Comments({ postId }) {
  const [comments, setComments] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetchComments(postId)
      .then((d) => active && setComments(Array.isArray(d) ? d : d.items ?? []))
      .catch((e) => active && setError(e.message));
    return () => { active = false; };
  }, [postId]);

  if (error) return <p className="comments-empty">Couldn't load comments.</p>;
  if (comments === null) return <div className="spinner" />;
  if (comments.length === 0) return <p className="comments-empty">No comments yet.</p>;

  return comments.map((c, i) => (
    <div key={c.id ?? i} className="comment-item">
      {c.author && <div className="comment-author">{c.author}</div>}
      <div className="comment-text">{c.text ?? ""}</div>
      {c.createdAt && <div className="comment-time">{timeAgo(c.createdAt)}</div>}
    </div>
  ));
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}


export default function PostDetail({ postId, onClose }) {
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let active = true;
    fetchPost(postId)
      .then((d) => 
        active && setPost(d)
      )
      .catch((e) => active && setError(e.message));
    return () => { active = false; };
  }, [postId]);

  return (
    <div
      className="panel-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="post-detail"
        role="dialog"
        aria-modal="true"
        aria-label="Post detail"
      >
        <div className="post-detail-image">
          {!post ? (
            <div
              className="skeleton"
              style={{ width: "100%", height: "100%" }}
            />
          ) : post.imageUrl && !imgError ? (
            <img
              src={post.imageUrl}
              alt={post.caption || "Post"}
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={{ color: "var(--muted)", fontSize: 13 }}>No image</div>
          )}
        </div>

        <div className="post-detail-sidebar">
          <div className="post-detail-header">
            <div>
              {post?.author && (
                <div className="post-detail-username">{post.author}</div>
              )}
              {post?.createdAt && (
                <div className="post-detail-time">
                  {timeAgo(post.createdAt)}
                </div>
              )}
              {!post && !error && (
                <div
                  className="skeleton"
                  style={{ width: 120, height: 14, borderRadius: 3 }}
                />
              )}
              {error && (
                <div style={{ color: "var(--accent)", fontSize: 13 }}>
                  Failed to load post.
                </div>
              )}
            </div>
            <div className="post-detail-header-right">
              {post?.likes !== undefined && (
                <div className="post-detail-likes">❤️ {post.likes}</div>
              )}
              <button
                className="close-btn"
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>

          {post?.caption && (
            <div className="post-detail-caption">{post.caption}</div>
          )}

          <div className="comments-section">
            <div className="comments-label">Comments</div>
            {post && <Comments postId={postId} />}
          </div>
        </div>
      </div>
    </div>
  );
}