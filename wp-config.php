<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'divisite' );

/** MySQL database username */
define( 'DB_USER', 'root' );

/** MySQL database password */
define( 'DB_PASSWORD', '' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'dh`cqg~v%0-0B$(hCXI|VepR2ZRwt?R-m=Azhi?,7sd^rf-^!0cUqxvmY9<Jr3&p' );
define( 'SECURE_AUTH_KEY',  'xUq(.}3@U~Lg,1Y$^g16VG@0B7cwe.wb%mk 9{y^9!>*tT<NeYiPNEP|`TMmNDK#' );
define( 'LOGGED_IN_KEY',    'q[`r1`+_l|_9W9:$L;M|U#PwC#+v71I@#ACgVHY/1,qwm)THH{_RCC`El07~>1WE' );
define( 'NONCE_KEY',        'qxVHa?#3cz Ae{|lW}8`4|$|Us<5`692gH}XHuOU-kGAA)T%{m.:];YPyYbmZ%qc' );
define( 'AUTH_SALT',        ';1]974G,*QnVUX5l]hDNF}UrD)a-$ridIAbauplVc!+{-xgno dDQH+8W+ri>t-t' );
define( 'SECURE_AUTH_SALT', 'p^+2Y*UFiO1H!Q0mO+M%?v<H68BLFM7O0;(h/+Fyrx-fi)r$i<i~`:s/^2-9 Qd4' );
define( 'LOGGED_IN_SALT',   '1%loBXt@J(A!Us]l?T&]@Ho3t9 VOfaqM}PAm&RsB*6clew{dMHis0Z+-,s+e)y ' );
define( 'NONCE_SALT',       '}zCTv_M~b$x<?P[*g!uI~anZ<x|f2y@W4MosJc?5!uN]ZpeIfWK_B]}L}CDzL7K ' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
