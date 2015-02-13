
(function ($) {
    "use strict";

    /**
     * Configuration of the plugin
     *
     */
    var config = {};

    /**
     * Default value of the plugin
     *
     */
    var defaults = {
        url      : 'ajax/get_something',
        container: '#container',
        template : '#template',
        limit    : 10,
        loadMore : 'button.load_more',
        search   : 'input.search',
        sort     : 'ul.sort'
    };

    var methods = {
        /**
         * Initialization code of the plugin
         *
         * @param {Object} uiMainContainer jQuery object pertaining to the #main_container by default
         * @param {Object} options
         */
        init: function (uiMainContainer, options) {
            config = $.extend(defaults, options);


            // find for the container and the template
            var uiContainer = uiMainContainer.find(config.container),
                uiTemplate = uiMainContainer.find(config.template);

            if (this._validateUI(uiContainer) && this._validateUI(uiTemplate)) {
                return;
            }
        },

        /**
         * Validates ui if exist or not
         *
         * @param {Object} ui jQuery Object
         * @returns {Boolean}
         * @private
         */
        _validateUI: function (ui) {
            return (ui !== undefined && ui.length > 0);
        }
    };

    /**
     * Extends jQuery
     *
     * @param {Object} options Options of the plugin
     *
     * @returns {$.fn}
     */
    $.fn.cloneFiltering = function(options) {
        methods.init(this, options);

        // for chaining of the jQuery
        return this;
    };
}(jQuery));

/**
 * $('#main_container')                             // Container of the load more, search, and sort
 *      .cloneFiltering({
 *          url: 'localhost/ajax/get_something',    // (REQUIRED) URL of the data needed for the cloning and filtering
 *          container: '#container'                 // (REQUIRED) Container of the template to be inserted
 *          template: '#template'                   // (REQUIRED) Template to be cloned
 *          limit: 10,                              // (OPTIONAL) Will be using in load more
 *          loadMore: 'button.load_more',           // (OPTIONAL) Selector of the load more button MUST BE A BUTTON
 *          search: 'input.search',                 // (OPTIONAL) Selector of the search input MUST BE AN INPUT
 *          sort: 'ul.sort'                         // (OPTIONAL) Selector of the sort
 *      })
 */