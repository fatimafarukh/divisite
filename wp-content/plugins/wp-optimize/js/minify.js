 (function ($) {
	var wp_optimize = window.wp_optimize || {};
	var send_command = wp_optimize.send_command;
	var refresh_frequency = wpoptimize.refresh_frequency || 30000;

	if (!send_command) {
		console.error('WP-Optimize Minify: wp_optimize.send_command is required.');
		return;
	}

	var minify = {};

	/**
	 * Initializing the minify feature and events
	 */
	minify.init = function () {
		
		var minify = this;
		this.enabled = false;

		$(document).on('wp-optimize/minify/toggle-status', function(e, params) {
			if (params.hasOwnProperty('enabled')) {
				$('[data-whichpage="wpo_minify"]').toggleClass('is-enabled', params.enabled)
				minify.enabled = params.enabled;
				if (minify.enabled) minify.getFiles();
			}
		});

		/**
		 * The standard handler for clearing the cache. Safe to use
		 */
		$('.purge_minify_cache').on('click', function(e) {
			e.preventDefault();
			$.blockUI();
			send_command('purge_minify_cache', null, function(response) {
				minify.updateFilesLists(response.files);
				minify.updateStats(response.files);
			}).always(function() {
				$.unblockUI();
			});
		});

		/**
		 * Removes the entire cache dir.
		 * Use with caution, as cached html may still reference those files.
		 */
		$('.purge_all_minify_cache').on('click', function() {
			$.blockUI();
			send_command('purge_all_minify_cache', null, function(response) {
				minify.updateFilesLists(response.files);
				minify.updateStats(response.files);
			}).always(function() {
				$.unblockUI();
			});
		});

		/**
		 * Forces minifiy to create a new cache, safe to use
		 */
		$('.minify_increment_cache').on('click', function() {
			$.blockUI();
			send_command('minify_increment_cache', null, function(response) {
				if (response.hasOwnProperty('files')) {
					minify.updateFilesLists(response.files);
					minify.updateStats(response.files);
				}
				console.log(response)
			}).always(function() {
				$.unblockUI();
			});
		});
		

		// ======= SLIDERS ========
		// Generic slider save
		$('#wp-optimize-nav-tab-wpo_minify-status-contents form :input, #wp-optimize-nav-tab-wpo_minify-js-contents form :input, #wp-optimize-nav-tab-wpo_minify-css-contents form :input, #wp-optimize-nav-tab-wpo_minify-font-contents form :input, #wp-optimize-nav-tab-wpo_minify-settings-contents form :input, #wp-optimize-nav-tab-wpo_minify-advanced-contents form :input').on('change', function() {
			var elementId = $(this).prop('id');
			if ('wpo_min_enable_minify_debug' !== elementId && 'wpo_min_edit_default_exclutions' !== elementId) {
				$(this).closest('form').data('need_saving', true);
			}
		});
		
		$('input[type=checkbox].wpo-save-setting').on('change', function(e) {
			$('.wp-optimize-save-minify-settings').first().trigger('click');
		});

		// Slider enable minify
		$('#wpo_min_enable_minify').on('wp-optimize/minify/saved_setting', function() {
			this.enabled = $(this).prop('checked');
			$(document).trigger('wp-optimize/minify/toggle-status', {enabled: this.enabled});
		});
		
		// Toggle wpo-feature-is-disabled class
		$('#wpo_min_enable_minify').on('wp-optimize/minify/saved_setting', function() {
			
			$(this).closest('.wpo_section').toggleClass('wpo-feature-is-disabled', !$(this).is(':checked'));
		});

		// Toggle wpo-feature-is-disabled class
		$('#wpo_min_enable_minify_css, #wpo_min_enable_minify_js')
			// Set value on status change
			.on('wp-optimize/minify/saved_setting', function() {
				$('#wp-optimize-nav-tab-wrapper__wpo_minify a[data-tab="' + $(this).data('tabname') + '"] span.disabled').toggleClass('hidden', $(this).is(':checked'));
			})
			// Set value on page load
			.each(function() {
				$('#wp-optimize-nav-tab-wrapper__wpo_minify a[data-tab="' + $(this).data('tabname') + '"] span.disabled').toggleClass('hidden', $(this).is(':checked'));
			});

		// slider enable Debug mode
		$('#wpo_min_enable_minify_debug').on('wp-optimize/minify/saved_setting', function() {
			// Refresh the page as it's needed to show the extra options
			$.blockUI({message: '<h1>'+wpoptimize.page_refresh+'</h1>'});
			location.href = $('#wp-optimize-nav-tab-wpo_minify-advanced').prop('href');
		});

		// Edit default exclusions
		$('#wpo_min_edit_default_exclutions').on('wp-optimize/minify/saved_setting', function() {
			// Show exclusions section
			$('.wpo-minify-default-exclusions').toggleClass('hidden', !$(this).prop('checked'));
		});

		// Save settings
		$('.wp-optimize-save-minify-settings').on('click', function(e) {
			e.preventDefault();
			var btn = $(this),
				spinner = btn.next(),
				success_icon = spinner.next(),
				$need_refresh_btn = null;
			
			spinner.show();
			$.blockUI();

			var data = {};

			var tabs = $('[data-whichpage="wpo_minify"] .wp-optimize-nav-tab-contents form');
			tabs.each(function() {
				var tab = $(this);
				if (true === tab.data('need_saving')) {
					data = Object.assign(data, gather_data(tab));
					tab.data('need_saving', false);
	
				}
			});

			/**
			 * Gather data from the given form
			 *
			 * @param {HTMLFormElement} form
			 *
			 * @returns {Array} Array of collected data from the form
			 */
			function gather_data(form) {
				var data = $(form).serializeArray().reduce(form_serialize_reduce_cb, {});
				$(form).find('input[type="checkbox"]').each(function (i) {
					if ($(this).hasClass('wpo-save-setting') && null === $need_refresh_btn) {
						$need_refresh_btn = $(this);
					}
					var name = $(this).prop("name");
					if (name.includes('[]')) {
						if (!$(this).is(':checked')) return;
						var newName = name.replace('[]', '');
						if (!data[newName]) data[newName] = [];
						data[newName].push($(this).val());
					} else {
						data[name] = $(this).is(':checked') ? 'true' : 'false';
					}
				});
				return data;
			}
			
			/**
			 * Reduces the form elements array into an object
			 *
			 * @param {Object} collection An empty object
			 * @param {*} item form input element as array element
			 *
			 * @returns {Object} collection An object of form data
			 */
			function form_serialize_reduce_cb(collection, item) {
				// Ignore items containing [], which we expect to be returned as arrays
				if (item.name.includes('[]')) return collection;
				collection[item.name] = item.value;
				return collection;
			}
			send_command('save_minify_settings', data, function(response) {
				if (response.hasOwnProperty('error')) {
					// show error
					console.log(response.error);
					$('.wpo-error__enabling-cache').removeClass('wpo_hidden').find('p').text(response.error.message);
				} else {
					$('.wpo-error__enabling-cache').addClass('wpo_hidden').find('p').text('');
				}
				
				if (response.success && $need_refresh_btn) {
					$need_refresh_btn.trigger('wp-optimize/minify/saved_setting');
				}

				if (response.hasOwnProperty('files')) {
					minify.updateFilesLists(response.files);
					minify.updateStats(response.files);
				}

				spinner.hide();
				success_icon.show();
				setTimeout(function() {
					success_icon.fadeOut('slow', function() {
						success_icon.hide();
					});
				}, 5000);
			}).always(function() {
				$.unblockUI();
			});
		})

		// Dismiss information notice
		$('.wp-optimize-minify-status-information-notice').on('click', '.notice-dismiss', function(e) {
			e.preventDefault();
			send_command('hide_minify_notice');
		});

		// Show logs
		$('#wpo_min_jsprocessed, #wpo_min_cssprocessed').on('click', '.log', function(e) {
			e.preventDefault();
			$(this).nextAll('.wpo_min_log').slideToggle('fast');
		});

		// Set the initial `enabled` value
		this.enabled = $('#wpo_min_enable_minify').prop('checked');
		$(document).trigger('wp-optimize/minify/toggle-status', {enabled: this.enabled});
		
		// When loading the page and minify is disabled, make sure that the status tab is active.
		if (!this.enabled && !$('#wp-optimize-nav-tab-wrapper__wpo_minify a[data-tab="status"]').is('.nav-tab-active')) {
			$('#wp-optimize-nav-tab-wrapper__wpo_minify a[data-tab="status"]').trigger('click');
		}

		// Enable / disable defer_jquery
		function check_defer_status( e ) {
			$('input[name="enable_defer_js"]').each(function(index, element) {
				$(element).closest('fieldset').removeClass('selected').find('.defer-js-settings').slideUp('fast');
			});
			$('input[name="enable_defer_js"]:checked').closest('fieldset').addClass('selected').find('.defer-js-settings').slideDown('fast');
		}

		$('input[name="enable_defer_js"]').on('change', check_defer_status);
		
		check_defer_status();

		return this;
	}

	/**
	 * Get the list of files generated by Minify and update the markup.
	 */
	minify.getFiles = function() {
		// Only run if the feature is enabled
		if (!this.enabled) return;

		var data = {
			stamp: new Date().getTime()
		};

		send_command('get_minify_cached_files', data, function(response) {

			minify.updateFilesLists(response);
			minify.updateStats(response);

		});

		if (refresh_frequency) setTimeout(minify.getFiles.bind(this), refresh_frequency);
	}

	minify.updateFilesLists = function(data) {
		// reset
		var wpominarr = [];

		// js
		if (data.js.length > 0) {
			$(data.js).each(function () {
				wpominarr.push(this.uid);
				if ($('#'+this.uid).length == 0) {
					$('#wpo_min_jsprocessed ul.processed').append('\
					<li id="'+this.uid+'">\
						<span class="filename"><a href="'+this.file_url+'" target="_blank">'+this.filename+'</a> ('+this.fsize+')</span>\
						<a href="#" class="log">' + wpoptimize.toggle_info + '</a>\
						<div class="hidden wpo_min_log">'+this.log+'</div>\
					</li>\
				');
				}
			});
		}

		$('#wpo_min_jsprocessed ul.processed .no-files-yet').toggle(!data.js.length);

		// css
		if (data.css.length > 0) {
			$(data.css).each(function () {
				wpominarr.push(this.uid);
				if ($('#'+this.uid).length == 0) {
					$('#wpo_min_cssprocessed ul.processed').append('\
					<li id="'+this.uid+'">\
						<span class="filename"><a href="'+this.file_url+'" target="_blank">'+this.filename+'</a> ('+this.fsize+')</span>\
						<a href="#" class="log">' + wpoptimize.toggle_info + '</a>\
						<div class="hidden wpo_min_log">'+this.log+'</div>\
					</li>\
				');
				}
			});
		}

		$('#wpo_min_cssprocessed ul.processed .no-files-yet').toggle(!data.css.length);

		// Remove <li> if it's not in the files array
		$('#wpo_min_jsprocessed ul.processed > li, #wpo_min_cssprocessed ul.processed > li').each(function () {
			if (-1 == jQuery.inArray($(this).attr('id'), wpominarr)) {
				if (!$(this).is('.no-files-yet')) {
					$(this).remove();
				}
			}
		});
	};

	minify.updateStats = function(data) {
		if (data.cachesize.length > 0) {
			$("#wpo_min_cache_size").html(data.cachesize);
			$("#wpo_min_cache_total_size").html(data.total_cache_size);
			$("#wpo_min_cache_time").html(data.cacheTime);
			$("#wpo_min_cache_path").html(data.cachePath);
		}
	};

	wp_optimize.minify = minify;

})(jQuery);