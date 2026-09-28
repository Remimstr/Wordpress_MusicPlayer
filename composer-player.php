<?php
/**
 * Plugin Name: Composer Player
 * Description: Floating music player for remimarchand.ca.
 * Version: 1.0.6
 * Author: Remi Marchand
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'COMPOSER_PLAYER_VERSION', '1.0.6' );

require_once __DIR__ . '/admin/class-composer-tracks.php';
require_once __DIR__ . '/admin/class-composer-track-reorder.php';
require_once __DIR__ . '/frontend/class-composer-player.php';
require_once __DIR__ . '/frontend/class-composer-rest-api.php';