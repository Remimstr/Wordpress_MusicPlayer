<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Composer_REST_API {

	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route(
			'composer-player/v1',
			'/tracks',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_tracks' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	public function get_tracks() {
		$tracks = get_posts(
			array(
				'post_type'      => 'composer_track',
				'post_status'    => 'publish',
				'posts_per_page' => -1,
				'meta_key'       => '_composer_track_order',
				'orderby'        => 'meta_value_num',
				'order'          => 'ASC',
			)
		);

		$response = array();

		foreach ( $tracks as $track ) {
			$style = get_post_meta(
				$track->ID,
				'_composer_track_style',
				true
			);

			$audio_attachment = get_post_meta(
				$track->ID,
				'_composer_track_audio',
				true
			);

			$audio_url = $audio_attachment
				? wp_get_attachment_url( $audio_attachment )
				: false;

			if ( ! $audio_url ) {
				continue;
			}

			$response[] = array(
				'id'    => $track->ID,
				'title' => $track->post_title,
				'style' => $style,
				'url'   => $audio_url,
			);
		}

		return rest_ensure_response( $response );
	}
}

new Composer_REST_API();