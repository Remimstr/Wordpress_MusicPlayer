<?php

class Test_REST_API extends WP_UnitTestCase {

	private function create_audio_attachment( $filename ) {
		return self::factory()->post->create(
			array(
				'post_type'      => 'attachment',
				'post_status'    => 'inherit',
				'post_title'     => pathinfo( $filename, PATHINFO_FILENAME ),
				'post_mime_type' => 'audio/mpeg',
				'guid'           => 'http://example.org/wp-content/uploads/' . $filename,
			)
		);
	}

	public function test_endpoint_returns_published_tracks_only() {
		$audio_id = $this->create_audio_attachment( 'published.mp3' );

		$published_track = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => 'Published Track',
			)
		);

		self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'draft',
				'post_title'  => 'Draft Track',
			)
		);

		update_post_meta(
			$published_track,
			'_composer_track_style',
			'Cinematic'
		);

		update_post_meta(
			$published_track,
			'_composer_track_audio',
			$audio_id
		);

		update_post_meta(
			$published_track,
			'_composer_track_order',
			0
		);

		$request = new WP_REST_Request(
			'GET',
			'/composer-player/v1/tracks'
		);

		$response = rest_do_request( $request );
		$data     = $response->get_data();

		$this->assertCount( 1, $data );

		$this->assertSame(
			$published_track,
			$data[0]['id']
		);
	}

	public function test_endpoint_returns_expected_track_fields() {
		$audio_id = $this->create_audio_attachment( 'test-track.mp3' );

		$track_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => 'Test Track',
			)
		);

		update_post_meta(
			$track_id,
			'_composer_track_style',
			'Orchestral'
		);

		update_post_meta(
			$track_id,
			'_composer_track_audio',
			$audio_id
		);

		update_post_meta(
			$track_id,
			'_composer_track_order',
			0
		);

		$request = new WP_REST_Request(
			'GET',
			'/composer-player/v1/tracks'
		);

		$response = rest_do_request( $request );
		$data     = $response->get_data();

		$this->assertCount( 1, $data );

		$this->assertSame(
			array( 'id', 'title', 'style', 'url' ),
			array_keys( $data[0] )
		);

		$this->assertSame(
			$track_id,
			$data[0]['id']
		);

		$this->assertSame(
			'Test Track',
			$data[0]['title']
		);

		$this->assertSame(
			'Orchestral',
			$data[0]['style']
		);

		$this->assertSame(
			wp_get_attachment_url( $audio_id ),
			$data[0]['url']
		);
	}

	public function test_endpoint_returns_tracks_in_order() {
		$first_audio_id = $this->create_audio_attachment( 'first.mp3' );
		$second_audio_id = $this->create_audio_attachment( 'second.mp3' );

		$first_track = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => 'First Track',
			)
		);

		$second_track = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => 'Second Track',
			)
		);

		update_post_meta(
			$first_track,
			'_composer_track_order',
			0
		);

		update_post_meta(
			$second_track,
			'_composer_track_order',
			1
		);

		update_post_meta(
			$first_track,
			'_composer_track_audio',
			$first_audio_id
		);

		update_post_meta(
			$second_track,
			'_composer_track_audio',
			$second_audio_id
		);

		$request = new WP_REST_Request(
			'GET',
			'/composer-player/v1/tracks'
		);

		$response = rest_do_request( $request );
		$data     = $response->get_data();

		$this->assertSame(
			$first_track,
			$data[0]['id']
		);

		$this->assertSame(
			$second_track,
			$data[1]['id']
		);
	}

	public function test_endpoint_excludes_tracks_without_audio() {
		$audio_id = $this->create_audio_attachment( 'has-audio.mp3' );

		$without_audio = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => 'No Audio',
			)
		);

		$with_audio = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => 'Has Audio',
			)
		);

		update_post_meta(
			$without_audio,
			'_composer_track_order',
			0
		);

		update_post_meta(
			$with_audio,
			'_composer_track_order',
			1
		);

		update_post_meta(
			$with_audio,
			'_composer_track_audio',
			$audio_id
		);

		$request = new WP_REST_Request(
			'GET',
			'/composer-player/v1/tracks'
		);

		$response = rest_do_request( $request );
		$data     = $response->get_data();

		$this->assertCount( 1, $data );

		$this->assertSame(
			$with_audio,
			$data[0]['id']
		);
	}

	public function test_endpoint_returns_empty_array_when_no_tracks_are_available() {
		$request = new WP_REST_Request(
			'GET',
			'/composer-player/v1/tracks'
		);

		$response = rest_do_request( $request );
		$data     = $response->get_data();

		$this->assertSame(
			array(),
			$data
		);
	}
}
