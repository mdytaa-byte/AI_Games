<?php
/**
 * Plugin Name: Brightbarrow Press Landing
 * Description: A simple homepage landing page for the Brightbarrow Press imprint. Use the shortcode [brightbarrow_press].
 * Version: 1.0.0
 * Author: Michael D. Young
 * Author URI: https://authormichaelyoung.com/
 * License: GPLv2 or later
 * Text Domain: brightbarrow-press
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'BBP_LANDING_DIR', plugin_dir_path( __FILE__ ) );
define( 'BBP_LANDING_URL', plugin_dir_url( __FILE__ ) );
define( 'BBP_LANDING_VER', '1.0.0' );

function bbp_landing_has_shortcode() {
	if ( ! is_singular() ) {
		return false;
	}
	$post = get_post();
	return $post && has_shortcode( $post->post_content, 'brightbarrow_press' );
}

add_action(
	'wp_enqueue_scripts',
	function () {
		if ( ! bbp_landing_has_shortcode() ) {
			return;
		}
		wp_enqueue_style(
			'bbp-landing-fonts',
			'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Source+Sans+3:wght@400;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap',
			array(),
			null
		);
		wp_enqueue_style(
			'bbp-landing',
			BBP_LANDING_URL . 'assets/landing.css',
			array( 'bbp-landing-fonts' ),
			BBP_LANDING_VER
		);
	}
);

add_filter(
	'body_class',
	function ( $classes ) {
		if ( bbp_landing_has_shortcode() ) {
			$classes[] = 'bbp-landing-page';
		}
		return $classes;
	}
);

add_shortcode(
	'brightbarrow_press',
	function () {
		$path = BBP_LANDING_DIR . 'templates/splash-markup.html';
		if ( ! is_readable( $path ) ) {
			return '';
		}
		return file_get_contents( $path );
	}
);
