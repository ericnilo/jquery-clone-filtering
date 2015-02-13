/**
 * $('#main_container')                             // Container of the load more, search, and sort
 *      .cloneFiltering({
 *          container: '#container',                // (REQUIRED) Container of the template to be inserted
 *          template: '#template',                  // (REQUIRED) Template to be cloned
 *          url: 'localhost/ajax/get_something',    // (OPTIONAL) URL of the data needed for the cloning and filtering
 *          data: oData,                            // (OPTIONAL) If from ajax success this is required
 *                                                                  if url is set do not use this
 *          limit: 10,                              // (OPTIONAL) Will be using in load more
 *          loadMore: 'button.load_more',           // (OPTIONAL) Selector of the load more button MUST BE A BUTTON
 *          sort: 'ul.sort',                        // (OPTIONAL) Selector of the sort
 *          search: {                               // (OPTIONAL) Selector of the search input MUST BE AN INPUT
 *              input: {
 *                  selector: 'input.search',
 *                  triggerBy: 'change'
 *              },
 *              button: {
 *                  selector: 'div.search_btn',
 *                  triggerBy: 'click'
 *              }
 *          },
 *      });
 *
 * @todo: No documentation yet.
 */
(function ($) {
    "use strict";

    /**
     * Error message container
     * @const
     */
    var ERROR_MSGS = {
        ui          : 'DOM not found or do not exists!',
        objectFormat: 'Format of the object is invalid'
    };

    /**
     * DOM main container of the cloning or filtering
     *
     * @param {Object} uiMainContainer jQuery object pertaining to the #main_container by default
     */
    var uiMainContainer;

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
        container: '#container',
        template : '#template'
    };

    var mainMethods = {
        /**
         * Initialization code of the plugin
         *
         * @param {Object} options
         */
        init: function (options) {
            config = $.extend(defaults, options);

            // find for the container and the template
            var uiContainer = uiMainContainer.find(config.container),
                uiTemplate = uiMainContainer.find(config.template);

            // this should be present so validate this
            if (!helper.isValidUI(uiContainer) && !helper.isValidUI(uiTemplate)) {
                return config.container + ' and ' + config.template + ' ' + ERROR_MSGS.ui; // stop if the two is not found
            }

            // if config.data is found or set process cloning immediately
            if(helper.lengthOf(config.data)) {
                this._processCloning(config.data);
            }
            // if url is defined then one of the following should also be defined:
            // config.sort, config.loadMore or config.search
            else if(config.url !== undefined) {

            }
        },

        _processCloning: function(oData) {
            if(!oData.hasOwnProperty('data') && oData.hasOwnProperty('total_rows')){
                return ERROR_MSGS.objectFormat; // stop if format of the object is invalid
            }

            var uiClonedTemplate;

            for (var key in oData.data) {
                if(oData.data.hasOwnProperty(key)) {
                    // clone the template
                    uiClonedTemplate = uiMainContainer.find(config.template).clone();

                    // set field value, text or class
                    this._setFieldValue(uiClonedTemplate, oData.data[key]);

                    // remove the custom attribute of the cloned template and append it to the container
                    uiClonedTemplate
                        .removeAttr('data-template')// TODO: This should be parsed because this is dynamic
                        .appendTo(uiMainContainer.find(config.container));
                }
            }
        },

        /**
         * Set field value, text, or class
         *
         * @param {Object} uiClonedTemplate
         * @param {Object} oInsertData
         * @private
         */
        _setFieldValue: function (uiClonedTemplate, oInsertData) {
            for (var key in oInsertData) {
                if (oInsertData.hasOwnProperty(key)) {
                    // set class of specific DOM
                    uiClonedTemplate.find('[data-class-field="' + key + '"]').addClass(oInsertData[key]);

                    // set text of view field
                    uiClonedTemplate.find('[data-view-field="' + key + '"]').text(oInsertData[key]);

                    // set value of input field
                    uiClonedTemplate.find('[data-input-field="' + key + '"]').val(oInsertData[key]);
                }
            }
        }
    };

    var helper = {
        /**
         * Helper to know the length of a specific object
         *
         * @param {Object} oObject
         *
         * @returns {number} Length of an oObject
         */
        lengthOf: function(oObject) {
            if(oObject === undefined) {
                return 0; // stop here if oObject is not defined
            }

            var size = 0, key;

            for (key in oObject) {
                if (oObject.hasOwnProperty(key)) size++;
            }

            return size;
        },

        /**
         * Validates ui if exist or not
         *
         * @param {Object} ui jQuery Object
         *
         * @returns {Boolean} True if found
         */
        isValidUI: function (ui) {
            return (ui !== undefined && ui.length > 0);
        }
    };

    /**
     * Extends jQuery
     *
     * @param {Object} options Options of the plugin
     *
     * @returns {$.fn}
     * @constructor
     */
    $.fn.cloneFiltering = function(options) {

        if (!this[0]) return this; // stop here if main container not found

        uiMainContainer = this; // put the main container to the private variable for whole scope availability

        mainMethods.init(options); // initialization

        return this; // for chaining of the jQuery
    };
}(jQuery));