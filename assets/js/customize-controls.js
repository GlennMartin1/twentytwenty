/* global backgroundColors, twentyTwentyColor, Color, jQuery, wp, _ */
/**
 * Customizer enhancements for a better user experience.
 *
 * Contains extra logic for our Customizer controls & settings.
 *
 * @since 1.0.0
 */

( function() {
	// Wait until the customizer has finished loading.
	wp.customize.bind( 'ready', function() {
		// Add a listener for accent-color changes.
		wp.customize( 'accent_hue', function( value ) {
			value.bind( function( to ) {
				// Update the value for our accessible colors for all areas.
				Object.keys( backgroundColors ).forEach( function( context ) {
					var backgroundColorValue;
					if ( backgroundColors[ context ].color ) {
						backgroundColorValue = backgroundColors[ context ].color;
					} else {
						backgroundColorValue = wp.customize( backgroundColors[ context ].setting ).get();
					}
					twentyTwentySetAccessibleColorsValue( context, backgroundColorValue, to );
				} );
			} );
		} );

		// Add a listener for background-color changes.
		Object.keys( backgroundColors ).forEach( function( context ) {
			wp.customize( backgroundColors[ context ].setting, function( value ) {
				value.bind( function( to ) {
					// Update the value for our accessible colors for this area.
					twentyTwentySetAccessibleColorsValue( context, to, wp.customize( 'accent_hue' ).get(), to );
				} );
			} );
		} );
	} );

	/**
	 * Updates the value of the "accent_accessible_colors" setting.
	 *
	 * @since 1.0.0
	 *
	 * @param {string} context The area for which we want to get colors. Can be for example "content", "header" etc.
	 * @param {string} backgroundColor The background color (HEX value).
	 * @param {number} accentHue Numeric representation of the selected hue (0 - 359).
	 *
	 * @return {void}
	 */
	function twentyTwentySetAccessibleColorsValue( context, backgroundColor, accentHue ) {
		var value, colors;

		// Get the current value for our accessible colors, and make sure it's an object.
		value = wp.customize( 'accent_accessible_colors' ).get();
		value = ( _.isObject( value ) && ! _.isArray( value ) ) ? value : {};

		// Get accessible colors for the defined background-color and hue.
		colors = twentyTwentyColor( backgroundColor, accentHue );

		// Sanity check.
		if ( colors.getAccentColor() && 'function' === typeof colors.getAccentColor().toCSS ) {
			// Update the value for this context.
			value[ context ] = {
				text: colors.getTextColor(),
				accent: colors.getAccentColor().toCSS(),
				background: backgroundColor,
			};

			// Get borders color.
			value[ context ].borders = Color( {
				h: colors.bgColorObj.h(),
				s: colors.bgColorObj.s() * 0.3922,
				l: colors.isDark ? colors.bgColorObj.l() + 9 : colors.bgColorObj.l() - 9,
			} ).toCSS();

			// Get secondary color.
			value[ context ].secondary = Color( {
				h: colors.bgColorObj.h(),
				s: colors.bgColorObj.s() / 2,
				l: ( colors.textColorObj.l() * 0.57 ) + ( colors.bgColorObj.l() * 0.43 ),
			} ).toCSS();
		}

		// Change the value.
		wp.customize( 'accent_accessible_colors' ).set( value );

		// Small hack to save the option.
		wp.customize( 'accent_accessible_colors' )._dirty = true;
	}
}( jQuery ) );
