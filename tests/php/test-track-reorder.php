<?php

class TestTrackReorder extends WP_UnitTestCase {

	private $reorderer;

	public function setUp(): void {
		parent::setUp();

		$user_id = self::factory()->user->create(
			array(
				'role' => 'administrator',
			)
		);

		wp_set_current_user( $user_id );

		$this->reorderer = new Composer_Track_Reorder();
	}

	private function create_track( $title ) {
		$track_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => $title,
			)
		);

		delete_post_meta(
			$track_id,
			'_composer_track_order'
		);

		return $track_id;
	}

	public function test_reorder_saves_submitted_order() {
		$track_a = $this->create_track( 'Track A' );
		$track_b = $this->create_track( 'Track B' );
		$track_c = $this->create_track( 'Track C' );

		$updated = $this->reorderer->reorder_tracks(
			array(
				(string) $track_c,
				(string) $track_a,
				(string) $track_b,
			)
		);

		$this->assertSame( 3, $updated );

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
		$track = $this->create_track( 'Track' );

		$invalid_track_id = PHP_INT_MAX;

		$this->assertNull(
			get_post( $invalid_track_id )
		);

		$updated = $this->reorderer->reorder_tracks(
			array(
				(string) $track,
				(string) $invalid_track_id,
			)
		);

		$this->assertSame( 1, $updated );

		$this->assertSame(
			0,
			(int) get_post_meta(
				$track,
				'_composer_track_order',
				true
			)
		);

		$this->assertSame(
			'',
			get_post_meta(
				$invalid_track_id,
				'_composer_track_order',
				true
			)
		);
	}

	public function test_reorder_ignores_non_composer_posts() {
		$track = $this->create_track( 'Track' );

		$regular_post = self::factory()->post->create(
			array(
				'post_type'   => 'post',
				'post_status' => 'publish',
				'post_title'  => 'Regular Post',
			)
		);

		delete_post_meta(
			$regular_post,
			'_composer_track_order'
		);

		$updated = $this->reorderer->reorder_tracks(
			array(
				(string) $regular_post,
				(string) $track,
			)
		);

		$this->assertSame( 1, $updated );

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