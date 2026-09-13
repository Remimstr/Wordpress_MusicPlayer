<?php

class TestTrackReorder extends WP_UnitTestCase {

	public function setUp(): void {
		parent::setUp();

		$user_id = self::factory()->user->create(
			array(
				'role' => 'administrator',
			)
		);

		wp_set_current_user( $user_id );
	}

	public function tearDown(): void {
		unset( $_POST['nonce'] );
		unset( $_POST['order'] );

		parent::tearDown();
	}

	private function save_order( $order ) {
		$_POST['nonce'] = wp_create_nonce( 'composer_track_order' );
		$_POST['order'] = wp_json_encode( $order );

		try {
			do_action( 'wp_ajax_composer_save_track_order' );
		} catch ( WPAjaxDieStopException $exception ) {
			// Expected: wp_send_json_* ends the AJAX request.
		}
	}

	public function test_reorder_saves_submitted_order() {
		$track_a = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => 'Track A',
			)
		);

		$track_b = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => 'Track B',
			)
		);

		$track_c = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => 'Track C',
			)
		);

		$this->save_order(
			array(
				(string) $track_c,
				(string) $track_a,
				(string) $track_b,
			)
		);

		$this->assertSame(
			0,
			(int) get_post_meta(
				$track_c,
				'_composer_track_order',
				true
			)
		);

		$this->assertSame(
			1,
			(int) get_post_meta(
				$track_a,
				'_composer_track_order',
				true
			)
		);

		$this->assertSame(
			2,
			(int) get_post_meta(
				$track_b,
				'_composer_track_order',
				true
			)
		);
	}

	public function test_reorder_ignores_invalid_track_ids() {
		$track = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => 'Track',
			)
		);

		$this->save_order(
			array(
				(string) $track,
				'999999',
			)
		);

		$this->assertSame(
			0,
			(int) get_post_meta(
				$track,
				'_composer_track_order',
				true
			)
		);
	}

	public function test_reorder_ignores_non_composer_posts() {
		$track = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => 'Track',
			)
		);

		$regular_post = self::factory()->post->create(
			array(
				'post_type'   => 'post',
				'post_status' => 'publish',
				'post_title'  => 'Regular Post',
			)
		);

		$this->save_order(
			array(
				(string) $regular_post,
				(string) $track,
			)
		);

		$this->assertSame(
			'',
			get_post_meta(
				$regular_post,
				'_composer_track_order',
				true
			)
		);

		$this->assertSame(
			1,
			(int) get_post_meta(
				$track,
				'_composer_track_order',
				true
			)
		);
	}
}