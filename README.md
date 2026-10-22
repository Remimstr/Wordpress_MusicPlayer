# Composer Player

A WordPress plugin providing a floating music player and WordPress-managed music library for a composer portfolio website.

## Features

- Floating music player available site-wide
- Play, pause, previous, and next controls
- Track progress and duration display
- Tracklist shortcode
- Music tracks managed through WordPress
- Audio files stored in the WordPress Media Library
- Custom track ordering
- REST API endpoint for frontend track data
- Frontend and admin code separated by responsibility

## Structure

```text
composer-player/
├── composer-player.php
│
├── admin/
│   ├── class-composer-tracks.php
│   ├── composer-tracks-admin.js
│   ├── composer-track-reorder.js
│   └── composer-track-reorder.css
│
├── frontend/
│   ├── class-composer-player.php
│   ├── class-composer-rest-api.php
│   ├── player.js
│   ├── player.css
│   └── icons/
│       ├── play.svg
│       ├── pause.svg
│       ├── skip-back.svg
│       └── skip-forward.svg
│
└── README.md
```

### `composer-player.php`

The plugin bootstrap. It defines the plugin version and loads the admin and frontend components.

### `admin/`

Everything required to manage music in WordPress.

The plugin registers a `composer_track` custom post type. Each track stores:

- Title
- Style
- Audio file
- Display order

The admin interface also provides a custom screen for reordering tracks.

### `frontend/`

Everything required to display and operate the player.

The frontend player loads track data from the plugin's REST API rather than from a static file.

## WordPress Data

Tracks are stored as the `composer_track` custom post type.

Track metadata:

| Meta key                | Purpose                 |
| ----------------------- | ----------------------- |
| `_composer_track_style` | Track style/genre       |
| `_composer_track_audio` | WordPress attachment ID |
| `_composer_track_order` | Tracklist order         |

Audio files are managed through the WordPress Media Library.

WordPress is therefore the source of truth for the music library. Track metadata and audio files do not need to be duplicated in the plugin repository.

## REST API

The frontend retrieves published tracks from:

```text
/wp-json/composer-player/v1/tracks
```

The endpoint returns tracks in their configured display order.

Example response:

```json
[
  {
    "id": 123,
    "title": "Example Track",
    "style": "Cinematic",
    "url": "https://example.com/wp-content/uploads/example-track.mp3"
  }
]
```

Tracks without a valid audio attachment are omitted from the response.

## Shortcode

The tracklist can be rendered with:

```text
[composer_player]
```

The floating player itself is automatically rendered in the site footer.

## Development

The plugin is developed locally using WordPress and Local by WP Engine.

The plugin repository can be linked into the local WordPress installation so that changes to the Git repository are immediately available to the local site.

### Formatting

The project uses Prettier for JavaScript and CSS formatting.

VS Code is configured to format files on save.

## Versioning

The plugin version is defined once in `composer-player.php`:

```php
define( 'COMPOSER_PLAYER_VERSION', '1.0.1' );
```

The same version is used when enqueueing frontend and admin assets. This provides cache busting when a new plugin version is released.

When releasing a new version, update the version in the plugin bootstrap and the plugin header.

## Deployment

GitHub is the source of truth for the plugin code.

Changes are committed and pushed to the repository. GitHub Actions deploys the plugin to the production WordPress installation via SFTP.

The WordPress database and Media Library are **not** stored in this repository. This means:

- Plugin code → Git/GitHub
- Track metadata → WordPress
- Audio files → WordPress Media Library
- Production deployment → GitHub Actions

## Architecture

The plugin is intentionally divided by responsibility:

```text
composer-player.php
        │
        ├── admin/
        │     └── Music management
        │
        └── frontend/
              ├── Player
              └── REST API
```

The root file acts only as the plugin bootstrap.

The REST API lives with the frontend because its primary consumer is the public player, while track management remains entirely within the admin component.

## Notes

The player is globally injected into the page footer. Normal full-page navigation will recreate the player and its `<audio>` element, so playback does not currently persist across full page loads.

Persistent playback across page navigation would require client-side navigation or another SPA-style approach.

## Squarespace / Standalone Usage

The player can run in a standalone, serverless environment such as Squarespace without WordPress or PHP:

### 1. Build Standalone Assets

```bash
npm run build:squarespace
```

This compiles:
- `dist/composer-player.js`: Bundled runtime (with embedded SVG icons and automatic DOM mounting).
- `dist/composer-player.css`: Bundled player styles.
- `dist/squarespace-code-block.html`: An all-in-one HTML snippet ready to paste directly into a Squarespace Code Block.

### 2. Configuration

Set `window.ComposerPlayerConfig` with your tracklist:

```html
<script>
window.ComposerPlayerConfig = {
  tracks: [
    {
      title: "Track Title",
      style: "Cinematic · Orchestral",
      gainDb: -2,
      url: "/s/track-filename.mp3",
      image: {
        url: "https://.../artwork.jpg",
        caption: "Soundtrack Title"
      }
    }
  ]
};
</script>
```

When tracks are provided inline, the player skips the REST API `fetch` call and initializes instantly.

