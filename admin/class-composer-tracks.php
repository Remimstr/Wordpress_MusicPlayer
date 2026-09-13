<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Composer_Tracks {

	public function __construct() {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ) );
		add_action( 'save_post_composer_track', array( $this, 'save_track' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
		add_action( 'admin_menu', array( $this, 'add_reorder_page' ) );
		add_action( 'wp_ajax_save_track_order', array( $this, 'save_track_order' ) );
	}

	public function register_post_type() {
		register_post_type(
			'composer_track',
			array(

                'labels' => array(
                    'name'          => 'Tracks',
                    'singular_name' => 'Track',
                    'add_new'       => 'Add Track',
                    'add_new_item'  => 'Add Track',
                    'edit_item'     => 'Edit Track',
                    'new_item'      => 'New Track',
                    'view_item'     => 'View Track',
                    'search_items'  => 'Search Tracks',
                    'not_found'     => 'No tracks found',
                    'menu_name'     => 'Composer Music',
                ),
				'public'          => false,
				'show_ui'         => true,
				'show_in_menu'   => true,
				'show_in_rest'   => true,
				'menu_icon'      => 'dashicons-format-audio',
				'supports'       => array( 'title' ),
				'capability_type' => 'post',
				'map_meta_cap'    => true,
				'has_archive'     => false,
				'rewrite'        => false,
				'query_var'      => false,
			)
		);
	}

	public function add_meta_boxes() {
		add_meta_box(
			'composer_track_details',
			'Track Details',
			array( $this, 'render_track_details' ),
			'composer_track',
			'normal',
			'high'
		);
	}

	public function render_track_details( $post ) {
		$style            = get_post_meta( $post->ID, '_composer_track_style', true );
		$audio_attachment = get_post_meta( $post->ID, '_composer_track_audio', true );

		wp_nonce_field(
			'composer_track_details',
			'composer_track_details_nonce'
		);
		?>

		<p>
			<label for="composer_track_style">
				<strong>Style</strong>
			</label>
		</p>

		<p>
			<input
				type="text"
				id="composer_track_style"
				name="composer_track_style"
				value="<?php echo esc_attr( $style ); ?>"
				class="widefat"
				placeholder="e.g. Orchestral, Electronic, Ambient"
			>
		</p>

		<p>
			<label>
				<strong>Audio File</strong>
			</label>
		</p>

		<p>
			<input
				type="hidden"
				id="composer_track_audio"
				name="composer_track_audio"
				value="<?php echo esc_attr( $audio_attachment ); ?>"
			>

			<button
				type="button"
				class="button composer-track-select-audio"
			>
				Select Audio File
			</button>

			<button
				type="button"
				class="button composer-track-remove-audio"
				<?php echo $audio_attachment ? '' : 'hidden'; ?>
			>
				Remove
			</button>
		</p>

		<p
			id="composer-track-audio-name"
			<?php echo $audio_attachment ? '' : 'hidden'; ?>
		>
			<?php
			if ( $audio_attachment ) {
				echo esc_html(
					get_the_title( $audio_attachment )
				);
			}
			?>
		</p>

		<?php
	}

	public function save_track( $post_id ) {
		if (
			! isset( $_POST['composer_track_details_nonce'] )
			|| ! wp_verify_nonce(
				sanitize_text_field(
					wp_unslash(
						$_POST['composer_track_details_nonce']
					)
				),
				'composer_track_details'
			)
		) {
			return;
		}

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		$style = isset( $_POST['composer_track_style'] )
			? sanitize_text_field(
				wp_unslash( $_POST['composer_track_style'] )
			)
			: '';

		$audio_attachment = isset( $_POST['composer_track_audio'] )
			? absint( $_POST['composer_track_audio'] )
			: 0;

		update_post_meta(
			$post_id,
			'_composer_track_style',
			$style
		);

		update_post_meta(
			$post_id,
			'_composer_track_audio',
			$audio_attachment
		);

		$this->ensure_track_order( $post_id );
	}

	private function ensure_track_order( $post_id ) {
		$current_order = get_post_meta(
			$post_id,
			'_composer_track_order',
			true
		);

		if ( '' !== $current_order ) {
			return;
		}

		$tracks = get_posts(
			array(
				'post_type'      => 'composer_track',
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'meta_key'       => '_composer_track_order',
				'orderby'        => 'meta_value_num',
				'order'          => 'DESC',
				'fields'         => 'ids',
			)
		);

		$next_order = 0;

		foreach ( $tracks as $track_id ) {
			if ( $track_id === $post_id ) {
				continue;
			}

			$order = get_post_meta(
				$track_id,
				'_composer_track_order',
				true
			);

			if ( '' !== $order ) {
				$next_order = max(
					$next_order,
					(int) $order + 1
				);
			}
		}

		update_post_meta(
			$post_id,
			'_composer_track_order',
			$next_order
		);
	}

	public function add_reorder_page() {
		add_submenu_page(
			'edit.php?post_type=composer_track',
			'Reorder Tracks',
			'Reorder Tracks',
			'edit_posts',
			'composer-track-reorder',
			array( $this, 'render_reorder_page' )
		);
	}

	public function render_reorder_page() {
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
		?>

		<div class="wrap composer-track-reorder-page">
			<h1>Reorder Tracks</h1>

			<p>
				Drag tracks into the order you want them to appear.
			</p>

			<ul
				id="composer-track-order-list"
				class="composer-track-order-list"
			>
				<?php foreach ( $tracks as $track ) : ?>
                    <li
                        class="composer-track-order-item"
                        data-track-id="<?php echo esc_attr( $track->ID ); ?>"
                        draggable="true"
                    >
                        <span
                            class="composer-track-drag-handle"
                            aria-hidden="true"
                        >
                            ☰
                        </span>

                        <span class="composer-track-order-title">
                            <?php echo esc_html( $track->post_title ); ?>
                        </span>

                        <a
                            class="composer-track-order-edit"
                            href="<?php echo esc_url( get_edit_post_link( $track->ID ) ); ?>"
                        >
                            Edit
                        </a>
                    </li>
				<?php endforeach; ?>
			</ul>

			<?php if ( empty( $tracks ) ) : ?>
				<p>No composer tracks have been added yet.</p>
			<?php else : ?>
				<p>
					<button
						type="button"
						id="composer-track-save-order"
						class="button button-primary"
					>
						Save Order
					</button>

					<span
						id="composer-track-order-status"
						class="composer-track-order-status"
						aria-live="polite"
					></span>
				</p>
			<?php endif; ?>
		</div>

		<?php
	}

	public function save_track_order() {
		check_ajax_referer(
			'composer_track_order',
			'nonce'
		);

		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_send_json_error(
				array(
					'message' => 'You do not have permission to reorder tracks.',
				),
				403
			);
		}

		$order = isset( $_POST['order'] )
			? json_decode(
				wp_unslash( $_POST['order'] ),
				true
			)
			: array();

		if ( ! is_array( $order ) ) {
			wp_send_json_error(
				array(
					'message' => 'Invalid track order.',
				),
				400
			);
		}

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
				$position
			);
		}

		wp_send_json_success(
			array(
				'message' => 'Track order saved.',
			)
		);
	}

	public function enqueue_admin_assets( $hook ) {
		global $post_type;

		if (
			( 'post.php' === $hook || 'post-new.php' === $hook )
			&& 'composer_track' === $post_type
		) {
			wp_enqueue_media();

			wp_enqueue_script(
				'composer-tracks-admin',
				plugin_dir_url( __FILE__ ) . 'composer-tracks-admin.js',
				array(),
				'1.0.0',
				true
			);

			return;
		}

		if ( 'composer_track_page_composer-track-reorder' !== $hook ) {
			return;
		}

		wp_enqueue_script(
			'composer-track-reorder',
			plugin_dir_url( __FILE__ ) . '../admin/composer-track-reorder.js',
			array(),
			COMPOSER_PLAYER_VERSION,
			true
		);

		wp_enqueue_style(
			'composer-track-reorder',
			plugin_dir_url( __FILE__ ) . '../admin/composer-track-reorder.css',
			array(),
			COMPOSER_PLAYER_VERSION
		);

		wp_add_inline_script(
			'composer-track-reorder',
			'window.ComposerTrackOrder = ' . wp_json_encode(
				array(
					'ajaxUrl' => admin_url( 'admin-ajax.php' ),
					'nonce'   => wp_create_nonce( 'composer_track_order' ),
				)
			) . ';',
			'before'
		);
	}
}

new Composer_Tracks();
