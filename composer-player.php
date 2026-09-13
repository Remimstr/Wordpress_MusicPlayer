<?php
/**
 * Plugin Name: Composer Player
 * Description: Floating persistent music player for remimarchand.ca.
 * Version: 1.0.1
 * Author: Remi Marchand
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

require_once __DIR__ . '/includes/class-composer-tracks.php';
require_once __DIR__ . '/includes/class-composer-rest-api.php';

function composer_player_enqueue_assets() {
    $plugin_url = plugin_dir_url( __FILE__ );
    $version    = '1.0.0';

    wp_enqueue_style(
        'composer-player',
        $plugin_url . 'assets/player.css',
        array(),
        $version
    );

    wp_enqueue_script(
        'composer-player',
        $plugin_url . 'assets/player.js',
        array(),
        $version,
        true
    );

    wp_add_inline_script(
        'composer-player',
        'window.ComposerPlayer = ' . wp_json_encode(
            array(
       			'tracksUrl' => rest_url( 'composer-player/v1/tracks' ),
                'icons'     => array(
                    'play'       => $plugin_url . 'assets/icons/play.svg',
                    'pause'      => $plugin_url . 'assets/icons/pause.svg',
                    'skipBack'   => $plugin_url . 'assets/icons/skip-back.svg',
                    'skipForward'=> $plugin_url . 'assets/icons/skip-forward.svg',
                ),
            )
        ) . ';',
        'before'
    );
}
add_action( 'wp_enqueue_scripts', 'composer_player_enqueue_assets' );

function composer_player_markup() {
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

        <audio class="composer-player-audio" preload="metadata"></audio>
    </div>
    <?php
}
add_action( 'wp_footer', 'composer_player_markup' );

function composer_player_shortcode() {
    return '<div class="composer-player"><div class="composer-tracklist" aria-label="Music"></div></div>';
}
add_shortcode( 'composer_player', 'composer_player_shortcode' );
