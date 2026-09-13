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
		add_filter( 'wp_insert_post_data', array( $this, 'validate_track_title' ), 10, 2 );
		add_action( 'admin_notices', array( $this, 'show_validation_errors' ) );
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
				'public'           => false,
				'show_ui'          => true,
				'show_in_menu'     => true,
				'show_in_rest'     => true,
				'menu_icon'        => 'dashicons-format-audio',
				'supports'         => array( 'title' ),
				'capability_type' => 'post',
				'map_meta_cap'     => true,
				'has_archive'      => false,
				'rewrite'          => false,
				'query_var'        => false,
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
		$image_attachment = get_post_meta( $post->ID, '_composer_track_image', true );
	    $image_caption    = get_post_meta( $post->ID, '_composer_track_image_caption', true );

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

				<p>
			<label>
				<strong>Image</strong>
			</label>
		</p>

		<p>
			<input
				type="hidden"
				id="composer_track_image"
				name="composer_track_image"
				value="<?php echo esc_attr( $image_attachment ); ?>"
			>

			<button
				type="button"
				class="button composer-track-select-image"
			>
				Select Image
			</button>

			<button
				type="button"
				class="button composer-track-remove-image"
				<?php echo $image_attachment ? '' : 'hidden'; ?>
			>
				Remove
			</button>
		</p>

		<p
			id="composer-track-image-preview"
			<?php echo $image_attachment ? '' : 'hidden'; ?>
		>
			<?php
			if ( $image_attachment ) {
				echo wp_get_attachment_image(
					$image_attachment,
					'medium'
				);
			}
			?>
		</p>

		<p>
			<label for="composer_track_image_caption">
				<strong>Image Caption / Credits</strong>
			</label>
		</p>

		<p>
			<textarea
				id="composer_track_image_caption"
				name="composer_track_image_caption"
				class="widefat"
				rows="3"
				placeholder="Optional caption or credits. HTML links are supported."
			><?php echo esc_textarea( $image_caption ); ?></textarea>
		</p>

		<?php
	}

	/**
	 * Prevent an empty title from overwriting an existing title.
	 *
	 * Existing tracks retain their current title and status.
	 * New auto-draft tracks are saved as drafts.
	 */
	public function validate_track_title( $data, $postarr ) {
		if (
			! isset( $postarr['post_type'] )
			|| 'composer_track' !== $postarr['post_type']
		) {
			return $data;
		}

		if (
			! isset( $data['post_title'] )
			|| '' !== trim( $data['post_title'] )
		) {
			return $data;
		}

		$post_id = isset( $postarr['ID'] )
			? absint( $postarr['ID'] )
			: 0;

		/*
		 * WordPress creates new editor posts as "auto-draft" posts
		 * with the temporary title "Auto Draft". Treat these as new
		 * tracks rather than restoring that temporary title.
		 */
		$is_new_track = ! $post_id
			|| 'auto-draft' === get_post_status( $post_id );

		if ( ! $is_new_track ) {
			$existing_title = get_post_field(
				'post_title',
				$post_id
			);

			if ( '' !== trim( $existing_title ) ) {
				$data['post_title'] = $existing_title;
			}
		}

		if ( $is_new_track ) {
			$data['post_status'] = 'draft';
        }

		$this->add_validation_error(
			'Please enter a track title.'
		);

		return $data;
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

		$submitted_style = isset( $_POST['composer_track_style'] )
			? sanitize_text_field(
				wp_unslash( $_POST['composer_track_style'] )
			)
			: '';

		$submitted_audio = isset( $_POST['composer_track_audio'] )
			? absint( $_POST['composer_track_audio'] )
			: 0;

		$submitted_image = isset( $_POST['composer_track_image'] )
			? absint( $_POST['composer_track_image'] )
			: 0;

		$submitted_image_caption = isset( $_POST['composer_track_image_caption'] )
			? wp_kses_post(
				wp_unslash( $_POST['composer_track_image_caption'] )
			)
			: '';

		/*
		 * A missing audio file is invalid.
		 *
		 * Existing tracks keep their current metadata and status.
		 * New tracks are left as drafts.
		 */
		if ( ! $submitted_audio ) {
			$this->add_validation_error(
				'Please select an audio file before saving the track.'
			);

			if ( 'auto-draft' === get_post_status( $post_id ) ) {
				$this->set_track_to_draft( $post_id );
			}

			return;
		}

		/*
		 * Only update metadata after validation succeeds.
		 */
		update_post_meta(
			$post_id,
			'_composer_track_style',
			$submitted_style
		);

		update_post_meta(
			$post_id,
			'_composer_track_audio',
			$submitted_audio
		);

		update_post_meta(
			$post_id,
			'_composer_track_image',
			$submitted_image
		);

		update_post_meta(
			$post_id,
			'_composer_track_image_caption',
			$submitted_image_caption
		);

		$this->ensure_track_order( $post_id );
	}

	private function set_track_to_draft( $post_id ) {
		remove_action(
			'save_post_composer_track',
			array( $this, 'save_track' )
		);

		wp_update_post(
			array(
				'ID'          => $post_id,
				'post_status' => 'draft',
			)
		);

		add_action(
			'save_post_composer_track',
			array( $this, 'save_track' )
		);
	}

	private function add_validation_error( $message ) {
		$user_id = get_current_user_id();

		if ( ! $user_id ) {
			return;
		}

		$errors = get_transient(
			'composer_track_validation_' . $user_id
		);

		if ( ! is_array( $errors ) ) {
			$errors = array();
		}

		$errors[] = $message;

		set_transient(
			'composer_track_validation_' . $user_id,
			$errors,
			60
		);
	}

	public function show_validation_errors() {
		$user_id = get_current_user_id();

		if ( ! $user_id ) {
			return;
		}

		$errors = get_transient(
			'composer_track_validation_' . $user_id
		);

		if ( ! is_array( $errors ) || empty( $errors ) ) {
			return;
		}

		delete_transient(
			'composer_track_validation_' . $user_id
		);

		foreach ( $errors as $error ) {
			?>
			<div class="notice notice-error is-dismissible">
				<p>
					<?php echo esc_html( $error ); ?>
				</p>
			</div>
			<?php
		}
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

		$reorderer = new Composer_Track_Reorder();

		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_send_json_error(
				array(
					'message' => 'You do not have permission to reorder tracks.',
				),
				403
			);
		}

		$reorderer->reorder_tracks( $order );

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
				COMPOSER_PLAYER_VERSION,
				true
			);

			return;
		}

		if ( 'composer_track_page_composer-track-reorder' !== $hook ) {
			return;
		}

		wp_enqueue_script(
			'composer-track-reorder',
			plugin_dir_url( __FILE__ ) . 'composer-track-reorder.js',
			array( 'jquery', 'jquery-ui-sortable' ),
			COMPOSER_PLAYER_VERSION,
			true
		);

		wp_enqueue_style(
			'composer-track-reorder',
			plugin_dir_url( __FILE__ ) . 'composer-track-reorder.css',
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
