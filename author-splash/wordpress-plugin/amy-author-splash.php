<?php
/**
 * Plugin Name: Michael D. Young Author Splash
 * Description: Engaging splash pages for Michael D. Young. Use [amy_splash] for the Beandom homepage and [amy_chess_splash] for The Chess Quest Series.
 * Version: 1.1.0
 * Author: Michael D. Young
 * Author URI: https://authormichaelyoung.com/
 * License: GPLv2 or later
 * Text Domain: amy-author-splash
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'AMY_SPLASH_DIR', plugin_dir_path( __FILE__ ) );
define( 'AMY_SPLASH_URL', plugin_dir_url( __FILE__ ) );
define( 'AMY_SPLASH_VER', '1.1.0' );

function amy_splash_post_has_shortcode() {
	if ( ! is_singular() ) {
		return false;
	}
	$post = get_post();
	return $post && (
		has_shortcode( $post->post_content, 'amy_splash' )
		|| has_shortcode( $post->post_content, 'amy_chess_splash' )
	);
}

add_action(
	'wp_enqueue_scripts',
	function () {
		if ( ! amy_splash_post_has_shortcode() ) {
			return;
		}
		wp_enqueue_style(
			'amy-splash-fonts',
			'https://fonts.googleapis.com/css2?family=Grenze:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:wght@400;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap',
			array(),
			null
		);
		wp_enqueue_style(
			'amy-splash',
			AMY_SPLASH_URL . 'assets/splash.css',
			array( 'amy-splash-fonts' ),
			AMY_SPLASH_VER
		);
	}
);

add_filter(
	'body_class',
	function ( $classes ) {
		if ( amy_splash_post_has_shortcode() ) {
			$classes[] = 'amy-splash-page';
		}
		return $classes;
	}
);

add_shortcode(
	'amy_splash',
	function () {
		$file = AMY_SPLASH_DIR . 'templates/splash-markup.html';
		if ( ! is_readable( $file ) ) {
			return '';
		}
		return file_get_contents( $file );
	}
);

add_shortcode(
	'amy_chess_splash',
	function () {
		$file = AMY_SPLASH_DIR . 'templates/chess-splash-markup.html';
		if ( ! is_readable( $file ) ) {
			return '';
		}
		return file_get_contents( $file );
	}
);
