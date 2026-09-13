<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Composer_Player {

	public function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'wp_head', array( $this, 'render_config' ) );
		add_action( 'wp_footer', array( $this, 'render_player' ) );
		add_shortcode( 'composer_player', array( $this, 'render_shortcode' ) );
	}

	public function enqueue_assets() {
		$plugin_url = plugin_dir_url( __FILE__ );
		$version    = COMPOSER_PLAYER_VERSION;

		wp_enqueue_style(
			'composer-player',
			$plugin_url . 'player.css',
			array(),
			$version
		);

		wp_enqueue_script_module(
			'composer-player',
			$plugin_url . 'player.js',
			array(),
			$version
		);
	}

	public function render_config() {
		$plugin_url = plugin_dir_url( __FILE__ );

		$config = array(
			'tracksUrl' => rest_url( 'composer-player/v1/tracks' ),
			'icons'     => array(
				'play'        => $plugin_url . 'icons/play.svg',
				'pause'       => $plugin_url . 'icons/pause.svg',
				'skipBack'    => $plugin_url . 'icons/skip-back.svg',
				'skipForward' => $plugin_url . 'icons/skip-forward.svg',
			),
		);

		wp_print_inline_script_tag(
			'window.ComposerPlayer = ' . wp_json_encode( $config ) . ';'
		);
	}

	public function render_player() {
		?>
		<div id="composer-floating-player">
			<div class="composer-player-inner">

				<div class="composer-player-controls">
					<button
						class="composer-player-button composer-player-previous"
						type="button"
						aria-label="Previous track"
					>
						<img src="" alt="">
					</button>

					<button
						class="composer-player-button composer-player-play"
						type="button"
						aria-label="Play"
					>
						<img src="" alt="">
					</button>

					<button
						class="composer-player-button composer-player-next"
						type="button"
						aria-label="Next track"
					>
						<img src="" alt="">
					</button>
				</div>

				<div class="composer-player-main">
					<div class="composer-player-heading">
						<span class="composer-player-title"></span>
						<span class="composer-player-style"></span>
					</div>

					<div class="composer-player-progress-row">
						<input
							class="composer-player-progress"
							type="range"
							min="0"
							max="100"
							value="0"
							step="0.1"
							aria-label="Track progress"
						>

						<div class="composer-player-time">
							<span class="composer-player-current-time">0:00</span>
							<span>/</span>
							<span class="composer-player-duration">0:00</span>
						</div>
					</div>
				</div>

			</div>

			<audio
				class="composer-player-audio"
				preload="metadata"
			></audio>
		</div>
		<?php
	}

	public function render_shortcode() {
		return '<div class="composer-player"><div class="composer-tracklist" aria-label="Music"></div></div>';
	}
}

new Composer_Player();
