# Minigram

A minimal Instagram-like web app built as a frontend interview assignment. Browse posts, view details with comments, and share your own photos.

---

## Features

- **Post Feed** — Responsive grid of posts with hover overlays showing author, caption, and likes
- **Infinite Scroll** — Automatically loads more posts as you scroll down using cursor-based pagination
- **Pull to Refresh** — Swipe down on mobile to reload the feed
- **Post Detail** — Click any post to view the full image, caption, likes, and comments in a side panel
- **Upload Flow** — Create a new post with drag-and-drop image upload, caption, and author fields
- **1 MB Limit Enforcement** — Image size is validated client-side before upload with a clear error message
- **Skeleton Loading** — Shimmer placeholders while the feed is loading
- **Keyboard Accessible** — Modals close on Escape key

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/minigram.git
cd minigram/Mini_Insta

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be running at `http://localhost:5173`.

## Project Structure

```
Mini_Insta/
├── public/
│   ├── gram.png              # App icon
│   └── mingram.svg           # Favicon
├── src/
|   ├── Components/
│   │   ├── PostDetail
|   │   │   ├── PostDetail.jsx          # Post detail panel and comments
|   │   │   ├── PostDetail.scss
│   │   ├── UploadModal
|   │   │   ├── UploadModal.jsx         # New post upload modal
|   │   │   └── UploadModal.scss
│   ├── miniInstagramPage/
│   │   ├── MiniInstagram.jsx       # Main feed and app shell
│   │   ├── MiniInstagram.scss      # Global and shared styles
│   ├── Util/
│   │   └── miniInstagram-api.js    # API helper functions
│   ├── App.tsx
│   └── main.tsx
├── index.html
└── package.json
```
