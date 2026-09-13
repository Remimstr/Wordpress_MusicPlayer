<?php

class TestTrackOrder extends WP_UnitTestCase {

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
		unset( $_POST['composer_track_details_nonce'] );
		unset( $_POST['composer_track_style'] );
		unset( $_POST['composer_track_audio'] );

		parent::tearDown();
	}

	private function save_track( $post_id ) {
		$_POST['composer_track_details_nonce'] = wp_create_nonce(
			'composer_track_details'
		);

		$_POST['composer_track_style'] = 'Cinematic';
		$_POST['composer_track_audio'] = '123';

		do_action( 'save_post_composer_track', $post_id );
	}

	public function test_new_track_gets_order_zero_when_no_tracks_have_order() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => 'First Track',
			)
		);

		$this->save_track( $post_id );

		$this->assertSame(
			'0',
			get_post_meta(
				$post_id,
				'_composer_track_order',
				true
			)
		);
	}

	public function test_new_track_gets_next_order_after_existing_tracks() {
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

		$new_track = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => 'Third Track',
			)
		);

		$this->save_track( $new_track );

		$this->assertSame(
			'2',
			get_post_meta(
				$new_track,
				'_composer_track_order',
				true
			)
		);
	}

	public function test_new_track_gets_one_more_than_highest_existing_order() {
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
			5
		);

		$new_track = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => 'New Track',
			)
		);

		$this->save_track( $new_track );

		$this->assertSame(
			'6',
			get_post_meta(
				$new_track,
				'_composer_track_order',
				true
			)
		);
	}

	public function test_existing_track_order_is_not_changed_when_saved_again() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => 'Existing Track',
			)
		);

		update_post_meta(
			$post_id,
			'_composer_track_order',
			3
		);

		$this->save_track( $post_id );

		$this->assertSame(
			'3',
			get_post_meta(
				$post_id,
				'_composer_track_order',
				true
			)
		);
	}
}