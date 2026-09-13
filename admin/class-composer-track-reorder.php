<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Composer_Track_Reorder {

	/**
	 * Save the submitted track order.
	 *
	 * Invalid IDs, non-composer posts, and posts the current user
	 * cannot edit are ignored.
	 *
	 * @param array $order Track IDs in the desired order.
	 * @return int Number of tracks successfully reordered.
	 */
    public function reorder_tracks( $order ) {
        if ( ! is_array( $order ) ) {
            return 0;
        }

        $updated = 0;

        foreach ( $order as $position => $track_id ) {
            $track_id = absint( $track_id );

            if ( ! $track_id ) {
                continue;
            }

            if ( 'composer_track' !== get_post_type( $track_id ) ) {
                continue;
            }

            if ( ! current_user_can( 'edit_post', $track_id ) ) {
                continue;
            }

            update_post_meta(
                $track_id,
                '_composer_track_order',
                (int) $position
            );

            $updated++;
        }

        return $updated;
    }
}