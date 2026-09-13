<?php

class TestTrackValidation extends WP_UnitTestCase {

	public function test_new_track_with_blank_title_remains_draft_without_auto_draft_title() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'   => 'composer_track',
				'post_status' => 'auto-draft',
				'post_title'  => 'Auto Draft',
			)
		);

		$data = array(
			'post_type'   => 'composer_track',
			'post_title'  => '',
			'post_status' => 'auto-draft',
		);

		$postarr = array(
			'ID'          => $post_id,
			'post_type'   => 'composer_track',
			'post_title'  => '',
			'post_status' => 'auto-draft',
		);

		$result = apply_filters(
			'wp_insert_post_data',
			$data,
			$postarr
		);

		$this->assertSame( 'draft', $result['post_status'] );
		$this->assertSame( '', $result['post_title'] );
	}
}