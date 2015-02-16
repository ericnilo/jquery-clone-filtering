/**
 * $('#main_container')                             // Container of the load more, search, and sort
 *      .cloneFiltering({
 *          container: '#container',                // (REQUIRED) Container of the template to be inserted
 *          template: '#template',                  // (REQUIRED) Template to be cloned
 *          url: 'localhost/ajax/get_something',    // (OPTIONAL) URL of the data needed for the cloning and filtering
 *          csrf_token: {                           // (OPTIONAL) For security reason
 *              value: 'x5925626lsd62',
 *              name: 'my_token'
 *          }
 *          data: oData,                            // (OPTIONAL) If from ajax success this is required
 *                                                                  if url is set do not use this
 *          limit: 10,                              // (OPTIONAL) Will be using in load more
 *          loadMore: 'button.load_more',           // (OPTIONAL) Selector of the load more button MUST BE A BUTTON
 *          sort: 'ul.sort',                        // (OPTIONAL) Selector of the sort
 *          search: {                               // (OPTIONAL) Selector of the search input MUST BE AN INPUT
 *              input: {
 *                  selector: 'input.search',
 *                  eventType: 'keypress'
 *              },
 *              btn: 'div.search_btn'
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
    var ERROR_MSG = {
        ui          : 'DOM not found or do not exists!',
        objectFormat: 'Format of the object is invalid. Format should be:' +
                        '{ ' +
                            'data:' +
                                '{ 0:' +
                                    '{ any: "value" }' +
                                    '{ any: "value" }' +
                                    '...' +
                                '},' +
                                '...' +
                            'total_rows: 10' +
                        '}'
    };

    /**
     * DOM main container of the cloning or filtering
     *
     * @param {Object} uiMainContainer jQuery object referring to the main container. This will attach event to this DOM
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

    var init = function (options) {
        config = $.extend(defaults, options);

        // find for the container and the template
        var uiContainer = uiMainContainer.find(config.container),
            uiTemplate = uiMainContainer.find(config.template);

        // uiContainer && uiTemplate should be present so validate this
        if (!helper.isValidUI(uiContainer) && !helper.isValidUI(uiTemplate)) {
            return config.container + ' and ' + config.template + ' ' + ERROR_MSG.ui; // stop if the two is not found
        }

        // if config.data is found or set process cloning immediately
        if (helper.lengthOf(config.data)) {
            process._cloning(config.data);
        }

        // if url is defined then one of the following should also be defined:
        // config.sort, config.loadMore or config.search
        else if (config.url !== undefined) {

            // check first if config.search is an object and has at least one index
            if (helper.lengthOf(config.search)) {

                // check if config.search has 'input' property
                if (config.search.hasOwnProperty('input')) {

                    // check if config.search.input has 'selector'
                    if (config.search.input.hasOwnProperty('selector')) {
                        var sEventType = (config.search.input.eventType !== undefined) ?
                                         config.search.input.eventType : 'keypress';

                        process._attachEvent(config.search.input.selector, sEventType, function (e) {
                            if (sEventType === 'keypress' && e.keyCode === 13) {
                                process.search();
                            }
                        });
                    }

                    // check if config.search has 'btn'
                    if (config.search.hasOwnProperty('btn')) {
                        process._attachEvent(config.search.btn, 'click', function () {
                            process.search();
                        });
                    }

                    // check if config has 'loadMore'
                    if (config.hasOwnProperty('loadMore')) {
                        process._attachEvent(config.loadMore, 'click', function () {
                            // TODO: load more code here.
                        });
                    }

                }
            }
        }
    };

    var process = {
        /**
         * For search functionality
         *
         */
        search: function() {
            var uiSearch = uiMainContainer.find(config.search.input.selector),
                sOrder = process._getOrdering(),
                oData = {
                    keyword : uiMainContainer.find(config.search.input.selector).val(),
                    order_by: sOrder.order_by,
                    order   : sOrder.order
                };

            // remove the children of the container
            // also make sure the template is not remove
            uiMainContainer.find(config.container).children().not(config.template).remove();

            // Process ajax
            process._ajax(config.url, oData, function() {
                uiSearch.val(uiSearch.attr('data-searched'))
            });
        },

        loadMore: function() {
            // TODO: load more code here.
        },

        /**
         * Check if oData has a valid format
         *
         * @param {Object} oData
         * @returns {boolean} If true oData has a valid format
         * @private
         */
        _isValidFormat: function (oData) {
            return (oData.hasOwnProperty('data') && oData.hasOwnProperty('total_rows'));
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
        },

        /**
         * Clone the template and append it to container
         *
         * @param {Object} oData  Note: This should have a valid format. Pls refer to ERROR_MSG.objectFormat
         * @returns {String|Null} If string cloning is failed
         * @private
         */
        _cloning: function (oData) {
            if (!this._isValidFormat(oData)) {
                return ERROR_MSG.objectFormat; // stop if format of the object is invalid
            }

            var uiClonedTemplate;

            for (var key in oData.data) {
                if (oData.data.hasOwnProperty(key)) {
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
         * Ajax Processing function
         *
         * @param {String} sUrl
         * @param {Object} oData
         * @param [fnAdditionalCallback]
         * @private
         */
        _ajax: function(sUrl, oData, fnAdditionalCallback) {
            $.ajax(sUrl, {
                type: 'POST',
                data: oData,
                success: function(sRetData) {
                    if(typeof sRetData === 'string' && sRetData.length) {
                        var oRetData = $.parseJSON(sRetData);

                        if (!process._isValidFormat(oRetData)) {
                            return ERROR_MSG.objectFormat; // stop if format of the object is invalid
                        }

                        if (helper.lengthOf(oRetData.data)) {
                            process._cloning(oRetData);

                            if(typeof fnAdditionalCallback === 'function') {
                                fnAdditionalCallback();
                            }
                        }
                    }
                }
            })
        },

        /**
         * Attach an event to a specific selector
         *
         * @param {String} sSelector
         * @param {String} sEventType
         * @param fnCallback
         * @private
         */
        _attachEvent: function(sSelector, sEventType, fnCallback) {
            uiMainContainer.find(sSelector).on(sEventType, function(e) {
                e.stopPropagation();
                if (typeof fnCallback === 'function') {
                    fnCallback(e);
                }
            });
        },

        /**
         * Returns the value of Previous searched keyword
         * and additionally set the value of the input from the prev keyword
         *
         * @return String
         * @private
         */
        _getPrevSearched: function () {
            var uiInputSearch = uiMainContainer.find(config.search.input.selector),
                sSearchedKeyword = uiInputSearch.attr('data-searched'),
                sReturnVal = '';

            if (sSearchedKeyword !== undefined) {
                sReturnVal = sSearchedKeyword.trim();
            }

            // set the value of search
            uiInputSearch.val(sReturnVal);

            return sReturnVal;
        },

        /**
         * Get the ordering details
         *
         * @returns {{order_by: *, order: *}}
         * @private
         */
        _getOrdering: function() {
            // cache DOM sort for better performance
            var uiSort = uiMainContainer.find(config.sort);

            if (!helper.isValidUI(uiSort)) {
                // stop if sort DOM not found and return data
                return { 'order_by': null, 'order': null };
            }

            var uiSorter = uiSort.children('li.active');

            return {
                'order_by': uiSorter.attr('data-field'),
                'order'   : uiSorter.attr('data-sort')
            };
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
            if(oObject === undefined && typeof oObject !== 'object') {
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
     * @returns {jQuery}
     * @constructor
     */
    $.fn.cloneFiltering = function(options) {

        if (!this[0]) return this; // stop here if main container not found

        uiMainContainer = this; // put the main container to the private variable for whole scope availability

        init(options); // initialization

        return this; // for chaining of the jQuery
    };
}(jQuery));