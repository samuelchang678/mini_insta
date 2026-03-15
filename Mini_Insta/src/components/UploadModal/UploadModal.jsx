import { useState, useEffect, useCallback, useRef } from "react";
import { createPost } from "../../Util/miniInstagram-api";
import './UploadModal.scss'

export default function UploadModal({ onClose, onSuccess }) {

  const MAX_IMAGE_BYTES = 1 * 1024 * 1024;

  const [caption, setCaption] = useState("");
  const [author, setAuthor] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = useCallback((f) => {
    setError(null);
    if (!f) return;
    if (!f.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (f.size > MAX_IMAGE_BYTES) {
      setError(`Image is too large (${(f.size / 1024 / 1024).toFixed(2)} MB). Maximum allowed size is 1 MB.`);
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!file) { setError("Please select an image."); return; }
    setError(null); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      if (caption) fd.append("caption", caption);
      if (author) fd.append("author", author);
      const newPost = await createPost(fd);
      onSuccess(newPost?.post ?? newPost);
    } catch (e) {
      setError(e.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="panel-backdrop"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div className="upload-modal" role="dialog" aria-modal="true" aria-label="New post">
        <div className="modal-header">
          <span className="modal-title">New Post</span>
          <button className="close-btn" onClick={onClose} disabled={loading} aria-label="Close">×</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-banner">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Drop zone */}
          <div
            className={`drop-zone${dragging ? " drag-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {!file ? (
              <>
                <div className="drop-zone-icon">📷</div>
                <div className="drop-zone-text">Drag & drop or click to select</div>
                <div className="drop-zone-hint">Max 1 MB · JPG, PNG, GIF, WebP</div>
              </>
            ) : (
              <div className="drop-zone-preview" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                {preview && <img src={preview} alt="preview" />}
                <div className="drop-zone-preview-info">
                  <div className="drop-zone-preview-name">{file.name}</div>
                  <div className="drop-zone-preview-size">{(file.size / 1024).toFixed(0)} KB — click to change</div>
                </div>
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="field">
            <label>Author</label>
            <input
              type="text"
              placeholder="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={50}
            />
          </div>
          <div className="field">
            <label>Caption</label>
            <textarea
              rows={3}
              placeholder="Write a caption…"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={500}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !file}>
            {loading ? <><span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }} />Uploading…</> : "Share Post"}
          </button>
        </div>
      </div>
    </div>
  );
}