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

			$gain_db = get_post_meta(
				$track->ID,
				'_composer_track_gain_db',
				true
			);

			if ( '' === $gain_db ) {
				$gain_db = 0.0;
			}

			$gain_db = (float) $gain_db;

			$image_attachment = get_post_meta(
				$track->ID,
				'_composer_track_image',
				true
			);

			$image = null;

			if ( $image_attachment ) {
				$image_url = wp_get_attachment_image_url(
					$image_attachment,
					'full'
				);

				if ( $image_url ) {
					$image = array(
						'url'     => $image_url,
						'alt'     => get_post_meta(
							$image_attachment,
							'_wp_attachment_image_alt',
							true
						),
						'caption' => get_post_meta(
							$track->ID,
							'_composer_track_image_caption',
							true
						),
					);
				}
			}

			$response[] = array(
				'id'    => $track->ID,
				'title' => $track->post_title,
				'style' => $style,
				'url'   => $audio_url,
				'gainDb'  => $gain_db,
				'image' => $image,
			);
		}

		return rest_ensure_response( $response );
	}
}

new Composer_REST_API();
