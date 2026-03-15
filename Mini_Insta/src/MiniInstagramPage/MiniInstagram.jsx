import { useState, useEffect, useCallback, useRef } from "react";
import UploadModal from "../components/UploadModal/UploadModal";
import PostDetail from "../components/PostDetail/PostDetail";
import { fetchPosts } from "../Util/miniInstagram-api";

import "./MiniInstagram.scss"

const LIMIT = 12;


//Skeleton feed
function SkeletonFeed() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card" />
      ))}
    </div>
  );
}

//Post Card
function PostCard({ post, onClick }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="post-card" onClick={() => onClick(post)}>
      {post.imageUrl && !imgError ? (
        <img
          src={post.imageUrl}
          alt={post.caption || "Post"}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="post-card-img-placeholder">No image</div>
      )}
      <div className="post-card-overlay">
        <div className="post-card-top">
          {post.author && (
            <span className="post-card-author">{post.author}</span>
          )}
        </div>
        <div className="post-card-bottom">
          {post.caption ? (
            <p className="post-card-caption">{post.caption}</p>
          ) : (
            <p />
          )}
          {post.likes !== undefined && (
            <p className="post-card-likes">❤️ {post.likes}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MiniInstagram() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(null);
  const PULL_THRESHOLD = 80;

  // Sentinel ref for infinite scroll
  const sentinelRef = useRef(null);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setFeedError(null);
    setNextCursor(null);
    setHasMore(true);
    try {
      const d = await fetchPosts({ limit: LIMIT });
      setPosts(Array.isArray(d.items) ? d.items : []);
      setNextCursor(d.nextCursor ?? null);
      setHasMore(!!d.hasMore);
    } catch (e) {
      setFeedError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const d = await fetchPosts({ cursor: nextCursor, limit: LIMIT });
      setPosts((prev) => [...prev, ...(Array.isArray(d.items) ? d.items : [])]);
      setNextCursor(d.nextCursor ?? null);
      setHasMore(!!d.hasMore);
    } catch (e) {
      // silently fail — user can scroll up and back down to retry
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, nextCursor]);

  // Initial load
  useEffect(() => { loadFeed(); }, [loadFeed]);

  // Infinite scroll via IntersectionObserver on a sentinel div
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  // Pull-to-refresh (touch only)
  const onTouchStart = (e) => {
    if (window.scrollY === 0) touchStartY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e) => {
    if (touchStartY.current === null) return;
    const dist = e.touches[0].clientY - touchStartY.current;
    if (dist > 0) { setIsPulling(true); setPullDistance(Math.min(dist, PULL_THRESHOLD * 1.5)); }
  };
  const onTouchEnd = () => {
    if (pullDistance >= PULL_THRESHOLD) loadFeed();
    touchStartY.current = null;
    setIsPulling(false);
    setPullDistance(0);
  };

  // Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        if (showUpload) setShowUpload(false);
        else if (selectedPostId) setSelectedPostId(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showUpload, selectedPostId]);

  const handleUploadSuccess = (newPost) => {
    setShowUpload(false);
    if (newPost?.id) {
      setPosts((prev) => [newPost, ...prev]);
      setSelectedPostId(newPost.id);
    } else {
      loadFeed();
    }
  };

  const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <>
      <div
        className="app"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Pull-to-refresh indicator */}
        {isPulling && (
          <div
            className="pull-indicator"
            style={{
              opacity: pullProgress,
              transform: `translateY(${pullDistance * 0.4}px)`,
            }}
          >
            <span
              className="pull-icon"
              style={{ transform: `rotate(${pullProgress * 180}deg)` }}
            >
              ↓
            </span>
            <span>
              {pullProgress >= 1 ? "Release to refresh" : "Pull to refresh"}
            </span>
          </div>
        )}

        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-logo">
            <img src="/gram.png" alt="Minigram" className="topbar-logo-icon" />
            Mini<span>gram</span>
          </div>
          <div className="topbar-actions">
            {feedError && (
              <button className="btn btn-ghost" onClick={loadFeed}>
                Retry
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={() => setShowUpload(true)}
            >
              + New Post
            </button>
          </div>
        </header>

        {/* Feed */}
        <main className="feed-container">
          <div className="feed-header">
            <h1>Latest</h1>
            {!loading && !feedError && (
              <span className="feed-count">
                {posts.length} post{posts.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loading && <SkeletonFeed />}

          {feedError && !loading && (
            <div className="error-banner" style={{ marginTop: 12 }}>
              <span>⚠</span>
              <span>Couldn't load posts — {feedError}</span>
            </div>
          )}

          {!loading && !feedError && posts.length === 0 && (
            <p
              style={{
                color: "var(--muted)",
                fontStyle: "italic",
                fontSize: 15,
              }}
            >
              No posts yet. Be the first to share something!
            </p>
          )}

          {!loading && !feedError && posts.length > 0 && (
            <div className="post-grid">
              {posts.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  onClick={(post) => setSelectedPostId(post.id)}
                />
              ))}
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} style={{ height: 1 }} />

          {/* Load more indicator */}
          {loadingMore && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "24px 0",
              }}
            >
              <span className="spinner" />
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <p
              style={{
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 13,
                padding: "24px 0",
              }}
            >
              You've seen it all ✦
            </p>
          )}
        </main>

        {selectedPostId && (
          <PostDetail
            postId={selectedPostId}
            onClose={() => setSelectedPostId(null)}
          />
        )}
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onSuccess={handleUploadSuccess}
          />
        )}
      </div>
    </>
  );
}
