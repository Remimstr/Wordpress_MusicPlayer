<?php

class TestTrackValidation extends WP_UnitTestCase {
	public function setUp(): void {
		parent::setUp();

		$user_id = self::factory()->user->create(
			array(
				'role' => 'administrator',
			)
		);

		wp_set_current_user( $user_id );
	}

	public function test_new_track_with_blank_title_becomes_draft_without_auto_draft_title() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'auto-draft',
				'post_title'  => 'Auto Draft',
			)
		);

		$data = array(
			'post_type'    => 'composer_track',
			'post_title'   => '',
			'post_status'  => 'auto-draft',
			'post_content' => 'Some content',
			'post_excerpt' => 'Some excerpt',
			'menu_order'   => 7,
		);

		$postarr = array(
			'ID'           => $post_id,
			'post_type'    => 'composer_track',
			'post_title'   => '',
			'post_status'  => 'auto-draft',
			'post_content' => 'Some content',
			'post_excerpt' => 'Some excerpt',
			'menu_order'   => 7,
		);

		$result = apply_filters(
			'wp_insert_post_data',
			$data,
			$postarr
		);

		$this->assertSame( 'draft', $result['post_status'] );
		$this->assertSame( '', $result['post_title'] );
		$this->assertSame( 'Some content', $result['post_content'] );
		$this->assertSame( 'Some excerpt', $result['post_excerpt'] );
		$this->assertSame( 7, $result['menu_order'] );
	}

	public function test_new_track_with_title_is_unchanged() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'auto-draft',
			)
		);

		$data = array(
			'post_type'    => 'composer_track',
			'post_title'   => 'New Track',
			'post_status'  => 'draft',
			'post_content' => 'Some content',
			'post_excerpt' => 'Some excerpt',
			'menu_order'   => 7,
		);

		$postarr = array(
			'ID'           => $post_id,
			'post_type'    => 'composer_track',
			'post_title'   => 'New Track',
			'post_status'  => 'draft',
			'post_content' => 'Some content',
			'post_excerpt' => 'Some excerpt',
			'menu_order'   => 7,
		);

		$result = apply_filters(
			'wp_insert_post_data',
			$data,
			$postarr
		);

		$this->assertSame( $data, $result );
	}

	public function test_existing_published_track_with_blank_title_restores_title_and_preserves_data() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'    => 'composer_track',
				'post_status'  => 'publish',
				'post_title'   => 'Existing Track',
				'post_content' => 'Original content',
				'post_excerpt' => 'Original excerpt',
				'menu_order'   => 7,
			)
		);

		$data = array(
			'post_type'    => 'composer_track',
			'post_title'   => '',
			'post_status'  => 'publish',
			'post_content' => 'Updated content',
			'post_excerpt' => 'Updated excerpt',
			'menu_order'   => 9,
		);

		$postarr = array(
			'ID'           => $post_id,
			'post_type'    => 'composer_track',
			'post_title'   => '',
			'post_status'  => 'publish',
			'post_content' => 'Updated content',
			'post_excerpt' => 'Updated excerpt',
			'menu_order'   => 9,
		);

		$result = apply_filters(
			'wp_insert_post_data',
			$data,
			$postarr
		);

		$this->assertSame( 'Existing Track', $result['post_title'] );
		$this->assertSame( 'publish', $result['post_status'] );
		$this->assertSame( 'Updated content', $result['post_content'] );
		$this->assertSame( 'Updated excerpt', $result['post_excerpt'] );
		$this->assertSame( 9, $result['menu_order'] );
	}

	public function test_existing_draft_track_with_blank_title_restores_title_and_preserves_data() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'    => 'composer_track',
				'post_status'  => 'draft',
				'post_title'   => 'Existing Draft Track',
				'post_content' => 'Original content',
				'post_excerpt' => 'Original excerpt',
				'menu_order'   => 7,
			)
		);

		$data = array(
			'post_type'    => 'composer_track',
			'post_title'   => '',
			'post_status'  => 'draft',
			'post_content' => 'Updated content',
			'post_excerpt' => 'Updated excerpt',
			'menu_order'   => 9,
		);

		$postarr = array(
			'ID'           => $post_id,
			'post_type'    => 'composer_track',
			'post_title'   => '',
			'post_status'  => 'draft',
			'post_content' => 'Updated content',
			'post_excerpt' => 'Updated excerpt',
			'menu_order'   => 9,
		);

		$result = apply_filters(
			'wp_insert_post_data',
			$data,
			$postarr
		);

		$this->assertSame( 'Existing Draft Track', $result['post_title'] );
		$this->assertSame( 'draft', $result['post_status'] );
		$this->assertSame( 'Updated content', $result['post_content'] );
		$this->assertSame( 'Updated excerpt', $result['post_excerpt'] );
		$this->assertSame( 9, $result['menu_order'] );
	}

	public function test_existing_track_with_new_title_accepts_new_title_and_preserves_data() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'    => 'composer_track',
				'post_status'  => 'publish',
				'post_title'   => 'Original Track',
			)
		);

		$data = array(
			'post_type'    => 'composer_track',
			'post_title'   => 'Renamed Track',
			'post_status'  => 'publish',
			'post_content' => 'Updated content',
			'post_excerpt' => 'Updated excerpt',
			'menu_order'   => 9,
		);

		$postarr = array(
			'ID'           => $post_id,
			'post_type'    => 'composer_track',
			'post_title'   => 'Renamed Track',
			'post_status'  => 'publish',
			'post_content' => 'Updated content',
			'post_excerpt' => 'Updated excerpt',
			'menu_order'   => 9,
		);

		$result = apply_filters(
			'wp_insert_post_data',
			$data,
			$postarr
		);

		$this->assertSame( 'Renamed Track', $result['post_title'] );
		$this->assertSame( 'publish', $result['post_status'] );
		$this->assertSame( 'Updated content', $result['post_content'] );
		$this->assertSame( 'Updated excerpt', $result['post_excerpt'] );
		$this->assertSame( 9, $result['menu_order'] );
	}

	public function test_non_composer_track_with_blank_title_is_unchanged() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'post',
				'post_status' => 'publish',
				'post_title'  => 'Regular Post',
			)
		);

		$data = array(
			'post_type'    => 'post',
			'post_title'   => '',
			'post_status'  => 'publish',
		);

		$postarr = array(
			'ID'          => $post_id,
			'post_type'   => 'post',
			'post_title'  => '',
			'post_status' => 'publish',
		);

		$result = apply_filters(
			'wp_insert_post_data',
			$data,
			$postarr
		);

		$this->assertSame( $data, $result );
	}

	public function test_existing_track_with_blank_audio_preserves_existing_metadata() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => 'Existing Track',
			)
		);

		update_post_meta(
			$post_id,
			'_composer_track_style',
			'Original Style'
		);

		update_post_meta(
			$post_id,
			'_composer_track_audio',
			123
		);

		$_POST['composer_track_details_nonce'] = wp_create_nonce(
			'composer_track_details'
		);

		$_POST['composer_track_style'] = 'New Style';
		$_POST['composer_track_audio'] = '';

		do_action( 'save_post_composer_track', $post_id );

		$this->assertSame(
			'Original Style',
			get_post_meta(
				$post_id,
				'_composer_track_style',
				true
			)
		);

		$this->assertSame(
			'123',
			get_post_meta(
				$post_id,
				'_composer_track_audio',
				true
			)
		);

		$this->assertSame( 'publish', get_post_status( $post_id ) );

		unset( $_POST['composer_track_details_nonce'] );
		unset( $_POST['composer_track_style'] );
		unset( $_POST['composer_track_audio'] );
	}

	public function test_existing_track_with_valid_audio_updates_metadata() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'publish',
				'post_title'  => 'Existing Track',
			)
		);

		update_post_meta(
			$post_id,
			'_composer_track_style',
			'Original Style'
		);

		update_post_meta(
			$post_id,
			'_composer_track_audio',
			123
		);

		$_POST['composer_track_details_nonce'] = wp_create_nonce(
			'composer_track_details'
		);

		$_POST['composer_track_style'] = 'Updated Style';
		$_POST['composer_track_audio'] = '456';

		do_action( 'save_post_composer_track', $post_id );

		$this->assertSame(
			'Updated Style',
			get_post_meta(
				$post_id,
				'_composer_track_style',
				true
			)
		);

		$this->assertSame(
			'456',
			get_post_meta(
				$post_id,
				'_composer_track_audio',
				true
			)
		);

		$this->assertSame( 'publish', get_post_status( $post_id ) );

		unset( $_POST['composer_track_details_nonce'] );
		unset( $_POST['composer_track_style'] );
		unset( $_POST['composer_track_audio'] );
	}

	public function test_new_track_with_valid_audio_saves_metadata() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'draft',
				'post_title'  => 'New Track',
			)
		);

		$_POST['composer_track_details_nonce'] = wp_create_nonce(
			'composer_track_details'
		);

		$_POST['composer_track_style'] = 'Cinematic';
		$_POST['composer_track_audio'] = '789';

		do_action( 'save_post_composer_track', $post_id );

		$this->assertSame(
			'Cinematic',
			get_post_meta(
				$post_id,
				'_composer_track_style',
				true
			)
		);

		$this->assertSame(
			'789',
			get_post_meta(
				$post_id,
				'_composer_track_audio',
				true
			)
		);

		unset( $_POST['composer_track_details_nonce'] );
		unset( $_POST['composer_track_style'] );
		unset( $_POST['composer_track_audio'] );
	}

	public function test_invalid_audio_on_new_track_changes_status_to_draft() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'auto-draft',
				'post_title'  => 'Auto Draft',
			)
		);

		$_POST['composer_track_details_nonce'] = wp_create_nonce(
			'composer_track_details'
		);

		$_POST['composer_track_style'] = 'Cinematic';
		$_POST['composer_track_audio'] = '';

		do_action( 'save_post_composer_track', $post_id );

		$this->assertSame( 'draft', get_post_status( $post_id ) );

		$this->assertSame(
			'',
			get_post_meta(
				$post_id,
				'_composer_track_style',
				true
			)
		);

		$this->assertSame(
			'',
			get_post_meta(
				$post_id,
				'_composer_track_audio',
				true
			)
		);

		unset( $_POST['composer_track_details_nonce'] );
		unset( $_POST['composer_track_style'] );
		unset( $_POST['composer_track_audio'] );
	}

	public function test_new_track_with_valid_image_saves_image_metadata() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'draft',
				'post_title'  => 'New Track',
			)
		);

		$image_id = self::factory()->attachment->create(
			array(
				'post_mime_type' => 'image/jpeg',
				'post_title'     => 'Test Image',
			)
		);

		$_POST['composer_track_details_nonce'] = wp_create_nonce(
			'composer_track_details'
		);

		$_POST['composer_track_style'] = 'Cinematic';
		$_POST['composer_track_audio'] = '789';
		$_POST['composer_track_image'] = $image_id;
		$_POST['composer_track_image_caption'] = 'Artwork by Jane Doe';

		do_action( 'save_post_composer_track', $post_id );

		$this->assertSame(
			(string) $image_id,
			get_post_meta(
				$post_id,
				'_composer_track_image',
				true
			)
		);

		$this->assertSame(
			'Artwork by Jane Doe',
			get_post_meta(
				$post_id,
				'_composer_track_image_caption',
				true
			)
		);

		unset( $_POST['composer_track_details_nonce'] );
		unset( $_POST['composer_track_style'] );
		unset( $_POST['composer_track_audio'] );
		unset( $_POST['composer_track_image'] );
		unset( $_POST['composer_track_image_caption'] );
	}

	public function test_existing_track_can_remove_image_metadata() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'draft',
				'post_title'  => 'Existing Track',
			)
		);

		$image_id = self::factory()->attachment->create(
			array(
				'post_mime_type' => 'image/jpeg',
				'post_title'     => 'Test Image',
			)
		);

		update_post_meta(
			$post_id,
			'_composer_track_image',
			$image_id
		);

		update_post_meta(
			$post_id,
			'_composer_track_image_caption',
			'Old caption'
		);

		$_POST['composer_track_details_nonce'] = wp_create_nonce(
			'composer_track_details'
		);

		$_POST['composer_track_style'] = 'Cinematic';
		$_POST['composer_track_audio'] = '789';
		$_POST['composer_track_image'] = '';
		$_POST['composer_track_image_caption'] = '';

		do_action( 'save_post_composer_track', $post_id );

		$this->assertSame(
			'0',
			get_post_meta(
				$post_id,
				'_composer_track_image',
				true
			)
		);

		$this->assertSame(
			'',
			get_post_meta(
				$post_id,
				'_composer_track_image_caption',
				true
			)
		);

		unset( $_POST['composer_track_details_nonce'] );
		unset( $_POST['composer_track_style'] );
		unset( $_POST['composer_track_audio'] );
		unset( $_POST['composer_track_image'] );
		unset( $_POST['composer_track_image_caption'] );
	}

	public function test_image_caption_is_sanitized() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'draft',
				'post_title'  => 'New Track',
			)
		);

		$image_id = self::factory()->attachment->create(
			array(
				'post_mime_type' => 'image/jpeg',
				'post_title'     => 'Test Image',
			)
		);

		$_POST['composer_track_details_nonce'] = wp_create_nonce(
			'composer_track_details'
		);

		$_POST['composer_track_style'] = 'Cinematic';
		$_POST['composer_track_audio'] = '789';
		$_POST['composer_track_image'] = $image_id;
		$_POST['composer_track_image_caption'] =
			'Artwork by<script>alert("xss")</script> Jane';

		do_action( 'save_post_composer_track', $post_id );

		$this->assertSame(
			'Artwork by Jane',
			get_post_meta(
				$post_id,
				'_composer_track_image_caption',
				true
			)
		);

		unset( $_POST['composer_track_details_nonce'] );
		unset( $_POST['composer_track_style'] );
		unset( $_POST['composer_track_audio'] );
		unset( $_POST['composer_track_image'] );
		unset( $_POST['composer_track_image_caption'] );
	}

	public function test_track_gain_saves_valid_negative_value() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'draft',
				'post_title'  => 'New Track',
			)
		);

		$_POST['composer_track_details_nonce'] = wp_create_nonce(
			'composer_track_details'
		);

		$_POST['composer_track_style'] = 'Cinematic';
		$_POST['composer_track_audio'] = '789';
		$_POST['composer_track_gain_db'] = '-3.7';

		do_action( 'save_post_composer_track', $post_id );

		$this->assertSame(
			'-3.7',
			get_post_meta(
				$post_id,
				'_composer_track_gain_db',
				true
			)
		);

		unset( $_POST['composer_track_details_nonce'] );
		unset( $_POST['composer_track_style'] );
		unset( $_POST['composer_track_audio'] );
		unset( $_POST['composer_track_gain_db'] );
	}

	public function test_track_gain_clamps_positive_value_to_zero() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'draft',
				'post_title'  => 'New Track',
			)
		);

		$_POST['composer_track_details_nonce'] = wp_create_nonce(
			'composer_track_details'
		);

		$_POST['composer_track_style'] = 'Cinematic';
		$_POST['composer_track_audio'] = '789';
		$_POST['composer_track_gain_db'] = '4.5';

		do_action( 'save_post_composer_track', $post_id );

		$this->assertSame(
			'0',
			get_post_meta(
				$post_id,
				'_composer_track_gain_db',
				true
			)
		);

		unset( $_POST['composer_track_details_nonce'] );
		unset( $_POST['composer_track_style'] );
		unset( $_POST['composer_track_audio'] );
		unset( $_POST['composer_track_gain_db'] );
	}

	public function test_track_gain_is_clamped_to_zero_maximum() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'draft',
				'post_title'  => 'New Track',
			)
		);

		$_POST['composer_track_details_nonce'] = wp_create_nonce(
			'composer_track_details'
		);

		$_POST['composer_track_style'] = 'Cinematic';
		$_POST['composer_track_audio'] = '789';
		$_POST['composer_track_gain_db'] = '10';

		do_action( 'save_post_composer_track', $post_id );

		$this->assertSame(
			'0',
			get_post_meta(
				$post_id,
				'_composer_track_gain_db',
				true
			)
		);

		unset( $_POST['composer_track_details_nonce'] );
		unset( $_POST['composer_track_style'] );
		unset( $_POST['composer_track_audio'] );
		unset( $_POST['composer_track_gain_db'] );
	}

	public function test_track_gain_is_clamped_to_minimum() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'draft',
				'post_title'  => 'New Track',
			)
		);

		$_POST['composer_track_details_nonce'] = wp_create_nonce(
			'composer_track_details'
		);

		$_POST['composer_track_style'] = 'Cinematic';
		$_POST['composer_track_audio'] = '789';
		$_POST['composer_track_gain_db'] = '-20';

		do_action( 'save_post_composer_track', $post_id );

		$this->assertSame(
			'-12',
			get_post_meta(
				$post_id,
				'_composer_track_gain_db',
				true
			)
		);

		unset( $_POST['composer_track_details_nonce'] );
		unset( $_POST['composer_track_style'] );
		unset( $_POST['composer_track_audio'] );
		unset( $_POST['composer_track_gain_db'] );
	}

	public function test_track_gain_defaults_to_zero_when_not_submitted() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'draft',
				'post_title'  => 'New Track',
			)
		);

		$_POST['composer_track_details_nonce'] = wp_create_nonce(
			'composer_track_details'
		);

		$_POST['composer_track_style'] = 'Cinematic';
		$_POST['composer_track_audio'] = '789';

		do_action( 'save_post_composer_track', $post_id );

		$this->assertSame(
			'0',
			get_post_meta(
				$post_id,
				'_composer_track_gain_db',
				true
			)
		);

		unset( $_POST['composer_track_details_nonce'] );
		unset( $_POST['composer_track_style'] );
		unset( $_POST['composer_track_audio'] );
	}
}
