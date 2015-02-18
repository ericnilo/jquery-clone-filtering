/*jshint nonew:true, jquery:true, curly:true, noarg:true, forin:true, noempty:true, eqeqeq:true, strict:true, undef:true, bitwise:true, newcap:true, immed:true, onevar:true, browser:true, es3:true, devel:true, gcl:true */
/**
 * $('#main_container')                             // Container of the load more, search, and sort
 *      .cloneFiltering({
 *          container: '#container',                // (REQUIRED) Container of the template to be inserted
 *          template: '[data-template="template"]', // (REQUIRED) Template to be cloned
 *          ajax: {
 *              url: 'localhost/ajax/get_something',// (OPTIONAL) URL of the data needed for the cloning and filtering
 *              customAjax: function(oSettings){    // (OPTIONAL) Will override the default ajax in this plugin
 *                  myCustomAjax(oSettings)
 *              },
 *              csrfToken: {                        // (OPTIONAL) For security reason
 *                  value: 'x5925626lsd62',
 *                  name: 'my_token'
 *              },
 *          },
 *          data: oData,                            // (OPTIONAL) If from ajax success this is required
 *                                                                  if url is set do not use this
 *          limit: 10,                              // (OPTIONAL) Will be using in load more
 *          loadMore: '.load_more',                 // (OPTIONAL) Selector of the load more. For now it only support non input button
 *          search: {                               // (OPTIONAL) Selector of the search input MUST BE AN INPUT
 *              input: {
 *                  selector: 'input.search',
 *                  eventType: 'keypress'
 *              },
 *              btn: 'div.search_btn'
 *          },
 *          sort: {                                 // (OPTIONAL) Selector of the sort
 *              selector: 'ul.sort',                // if sort has been set this selector is required
 *              activeClass: 'active sorting'       // if not set the default active class would be the 'active sorting'
 *          },
 *          customFieldValue:                       // (OPTIONAL) Put the custom field in this code default setter is for class, text and value
 *              function (uiClonedTemplate, oInsertData, key) {
 *                  if(key === 'link_location') {
                        uiClonedTemplate.attr('onclick', oInsertData['link_location']);
 *                  }
 *              }
 *          }
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
                    '}',
        dataType    : 'Data type invalid'
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
        template : '[data-template="my_template"]',
        limit    : 10
    };

    /**
     * Storage of the active class
     *
     * @type {string}
     */
    var sActiveClass = '';

    var init = function (options) {
        config = $.extend(defaults, options);

        if (!(validateConfig('config.container', 'string') && validateConfig('config.template', 'string'))) {
            return ERROR_MSG.dataType;
        }
        // find for the container and the template
        var uiContainer = uiMainContainer.find(config.container),
            uiTemplate = uiMainContainer.find(config.template);

        // uiContainer && uiTemplate should be present so validate this
        if (!helper.isValid(uiContainer) && !helper.isValid(uiTemplate)) {
            return config.container + ' and ' + config.template + ' ' + ERROR_MSG.ui; // stop if the two is not found
        }

        // if config.data is found or set process cloning immediately
        if (validateConfig('config.data', 'object')) {
            _process.cloning(config.data);
        }

        // if url is defined then one of the following should also be defined:
        // config.sort, config.loadMore or config.search
        else if (validateConfig('config.ajax.url', 'string')) {
            // check if config has 'loadMore'
            if (validateConfig('config.loadMore', 'string')) {
                _process.attachEvent(config.loadMore, 'click', function () {
                    _process.loadMore();
                });
            }

            // check if config.sort has 'selector'
            if (validateConfig('config.sort.selector', 'string')) {
                _process.attachEvent(uiMainContainer.find(config.sort.selector).children(), 'click', function (e) {
                    _process.sort(e);
                });
            }


            // check first if config.search is an object and has at least one element in it
            if (validateConfig('config.search', 'object')) {

                // check if config.search has 'input' property and has at least one element in it
                if (validateConfig('config.search.input', 'object')) {

                    // check if config.search.input has 'selector'
                    if (validateConfig('config.search.input.selector', 'string')) {
                        var sEventType = (validateConfig('config.search.input.eventType', 'string')) ?
                                         config.search.input.eventType : 'keypress';

                        _process.attachEvent(config.search.input.selector, sEventType, function (e) {
                            if (sEventType === 'keypress' && e.keyCode === 13) {
                                _process.search();
                            }
                        });

                        // check if config.search has 'btn'
                        if (validateConfig('config.search.btn', 'string')) {
                            _process.attachEvent(config.search.btn, 'click', function () {
                                _process.search();
                            });
                        }
                    }
                }
            }
        }
    };

    /**
     * Main process of this plugin
     *
     * @private
     */
    var _process = {
        /**
         * For search functionality
         *
         */
        search: function () {
            var uiSearch = uiMainContainer.find(config.search.input.selector),
                oOrder = _process.getOrdering(),
                oData = {
                    'keyword' : uiMainContainer.find(config.search.input.selector).val(),
                    'order_by': oOrder.orderBy,
                    'order'   : oOrder.order
                };

            // Process ajax
            _process.ajax(config.ajax.url, oData, function () {
                uiSearch.attr('data-searched', uiSearch.val());
            }, function () {
                // remove the children of the container
                // also make sure the template is not remove
                _process.removeChildrenOfContainer();
            });
        },

        /**
         * For load more functionality
         *
         */
        loadMore: function () {
            var oOrder = _process.getOrdering(),
                oData = {
                    'keyword' : _process.getPrevSearched(),
                    'offset'  : _process.getOffset(),
                    'order_by': oOrder.orderBy,
                    'order'   : oOrder.order
                };

            // put previous searched value in the search input
            _process.setSearchValue();

            _process.ajax(config.ajax.url, oData, function (oRetData) {
                _process.loadMoreShowHide(oRetData.total_rows, helper.lengthOf(oRetData.data) + oData.offset);
            });
        },

        sort: function (e) {
            var uiTarget = uiMainContainer.find(e.target), oData, oOrder;

            sActiveClass = (validateConfig('config.sort.activeClass', 'string')) ?
                           config.sort.activeClass : 'active sorting';

            if (uiTarget.hasClass(sActiveClass)) {
                if (uiTarget.attr('data-sort') === 'asc') {
                    uiTarget.attr('data-sort', 'desc');
                } else {
                    uiTarget.attr('data-sort', 'asc');
                }
            } else {
                uiTarget
                    .addClass(sActiveClass)
                    .attr('data-sort', 'asc')
                    .siblings("li")
                    .removeClass(sActiveClass).removeAttr('data-sort');
            }

            // put previous searched value in the search input
            _process.setSearchValue();

            // get order
            oOrder = _process.getOrdering();

            // assign value in oData
            oData = {
                'keyword' : _process.getPrevSearched(),
                'order_by': oOrder.orderBy,
                'order'   : oOrder.order
            };

            _process.ajax(config.ajax.url, oData, function (oRetData) {
                _process.loadMoreShowHide(oRetData.total_rows, helper.lengthOf(oRetData.data) + oData.offset);
            }, function () {
                // remove the children of the container
                // also make sure the template is not remove
                _process.removeChildrenOfContainer();
            });
        },

        /**
         * Show or Hide the Load more button
         *
         * @param {Number} numTotalRows
         * @param {Number} numUIRows
         */
        loadMoreShowHide: function (numTotalRows, numUIRows) {
            if (validateConfig('config.loadMore', 'string')) {
                var uiLoadMore = uiMainContainer.find(config.loadMore);

                uiLoadMore.text('Load More'); // TODO: This should be check if it is a button or other tag because what if load more is an input then text will not be suitable for it.

                if (numTotalRows === numUIRows || numTotalRows <= config.limit || numUIRows > numTotalRows) {
                    uiLoadMore.hide();
                } else {
                    // show again the load more button if it is hidden
                    uiLoadMore.show();
                }
            }
        },

        /**
         * Remove the children of the container and also
         *  make sure the template is not remove if in case template is inside the container
         *
         */
        removeChildrenOfContainer: function () {
            uiMainContainer.find(config.container).children().not(config.template).remove();
        },

        /**
         * Check if oData has a valid format
         *
         * @param {Object} oData
         * @returns {boolean} If true oData has a valid format
         */
        isValidFormat: function (oData) {
            return (oData.hasOwnProperty('data') && oData.hasOwnProperty('total_rows'));
        },

        /**
         * Set field value, text, or class or via custom field using config.customFieldValue property
         *
         * @param {Object} uiClonedTemplate Cloned template that will be appended to the DOM container
         * @param {Object} oInsertData      Data that need to be passed to the cloned template
         *
         */
        setFieldValue: function (uiClonedTemplate, oInsertData) {
            for (var key in oInsertData) {
                if (oInsertData.hasOwnProperty(key)) {
                    // set class of specific DOM
                    uiClonedTemplate.find('[data-class-field="' + key + '"]').addClass(oInsertData[key]);

                    // set text of view field
                    uiClonedTemplate.find('[data-view-field="' + key + '"]').text(oInsertData[key]);

                    // set value of input field
                    uiClonedTemplate.find('[data-input-field="' + key + '"]').val(oInsertData[key]);

                    // set the custom field value of cloned template for extendability
                    if (helper.hasValidKey(config, 'customFieldValue') &&
                        typeof config.customFieldValue === "function"
                    ) {
                        config.customFieldValue(uiClonedTemplate, oInsertData, key);
                    }
                }
            }
        },

        /**
         * Clone the template and append it to container
         *
         * @param {Object} oData  Note: This should have a valid format. Pls refer to ERROR_MSG.objectFormat
         *
         * @returns {String|Null} If this function returns string, cloning failed
         * @private
         */
        cloning: function (oData) {
            if (!this.isValidFormat(oData)) {
                return ERROR_MSG.objectFormat; // stop if format of the object is invalid
            }

            var uiClonedTemplate;

            for (var key in oData.data) {
                if (oData.data.hasOwnProperty(key)) {
                    // clone the template
                    uiClonedTemplate = uiMainContainer.find(config.template).clone();

                    // set field value, text or class
                    this.setFieldValue(uiClonedTemplate, oData.data[key]);

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
         * @param {String}  sUrl                   URL destination
         * @param {Object}  oData                  Data to be sent to server
         * @param           [fnAdditionalCallback] Function that will be called after cloning
         * @param           [fnBeforeCloning]      Function that will be called before cloning
         *
         * @private
         */
        ajax: function (sUrl, oData, fnAdditionalCallback, fnBeforeCloning) {
            var oSettings;

            // check if csrf_token is set
            if (validateConfig('config.ajax.csrfToken', 'object')) {
                if (validateConfig('config.ajax.csrfToken.name', 'string') &&
                    validateConfig('config.ajax.csrfToken.value', 'string')
                ) {
                    oData[config.ajax.csrfToken.name] = config.ajax.csrfToken.value;
                }
            }

            oSettings = {
                url    : sUrl,
                type   : 'POST',
                data   : oData,
                success: function (sRetData) {
                    if (typeof sRetData === 'string' && sRetData.length) {
                        var oRetData = $.parseJSON(sRetData);

                        if (!_process.isValidFormat(oRetData)) {
                            return ERROR_MSG.objectFormat; // stop if format of the object is invalid
                        }

                        if (helper.lengthOf(oRetData.data)) {
                            if (typeof fnBeforeCloning === 'function') {
                                fnBeforeCloning(oRetData);
                            }

                            _process.cloning(oRetData);

                            if (typeof fnAdditionalCallback === 'function') {
                                fnAdditionalCallback(oRetData);
                            }
                        }
                        else {
                            _process.removeChildrenOfContainer();
                        }
                    }
                }
            };

            if (validateConfig('config.ajax.customAjax', 'function')) {
                config.ajax.customAjax(oSettings);
            } else {
                $.ajax(oSettings);
            }
        },

        /**
         * Attach an event to a specific selector
         *
         * @param {String} sSelector
         * @param {String} sEventType
         * @param fnCallback
         *
         * @private
         */
        attachEvent: function (sSelector, sEventType, fnCallback) {
            uiMainContainer.find(sSelector).on(sEventType, function (e) {
                e.stopPropagation();
                if (sEventType === 'click') {
                    e.preventDefault();
                }
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
         *
         * @private
         */
        getPrevSearched: function () {
            var sReturnVal = '';
            if (validateConfig('config.search.input.selector', 'string')) {
                var uiInputSearch = uiMainContainer.find(config.search.input.selector),
                    sSearchedKeyword = uiInputSearch.attr('data-searched');

                if (sSearchedKeyword !== undefined) {
                    sReturnVal = sSearchedKeyword.trim();
                }

                // set the value of search
                uiInputSearch.val(sReturnVal);

                return sReturnVal;
            }

            return sReturnVal;
        },

        /**
         * Get the ordering details
         *
         * @returns {{orderBy: *, order: *}}
         *
         * @private
         */
        getOrdering: function () {
            // cache DOM sort for better performance
            var sProcessedClass = helper.classBuilder(sActiveClass),
                uiSort = uiMainContainer.find(sProcessedClass);

            if (!helper.isValid(uiSort)) {
                // stop if sort DOM not found and return data
                return {orderBy: null, order: null};
            }

            return {
                orderBy: uiSort.attr('data-sort-field'),
                order  : uiSort.attr('data-sort')
            };
        },

        /**
         * Gets the length of shown children of the container
         *
         * @returns {Number} The number of shown children of the container
         *
         * @private
         * @todo Should put a selector in the children of the container for specificity and for more flexibity of the program
         */
        getOffset: function () {
            return uiMainContainer.find(config.container).children().not(config.template).length;
        },

        /**
         * Set the value of search input from the previous searched item.
         *
         * @private
         */
        setSearchValue: function () {
            if (validateConfig('config.search.input', 'object')) {
                var uiSearch = uiMainContainer.find(config.search.input),
                    sDataSearch = uiSearch.attr('data-searched');

                if (helper.isValid(sDataSearch)) {
                    // set the value of search input to it's data-searched (previous searched)
                    uiSearch.val(sDataSearch);
                }
            }
        }
    };

    /**
     * Validates configuration settings options
     *
     * @param {String} sConfig                     Configuration. Example config.search.input.selector
     * @param {String} sDataType                   Data type of the config
     * @param {String} [sVarConfigName = 'config'] Configuration variable name example 'config'
     *
     * @return {Boolean} True if config matches the valid data type
     */
    var validateConfig = function (sConfig, sDataType, sVarConfigName) {
        var arrConfig = sConfig.split('.'), key, sLastElementVal,
            oConfig = config;

        sVarConfigName = (sVarConfigName !== undefined) ? sVarConfigName : 'config';

        // if you want to use this in other project then add the comparing value to the parameter above
        if (arrConfig[0] === sVarConfigName) {
            arrConfig.shift(); // removes the first element if 'config' is found
        } else {
            return false; // stop here if the starting string is not 'config'
        }

        // get the last element of arrConfig
        sLastElementVal = arrConfig[arrConfig.length - 1];

        // if arrConfig has more than 2 elements then loop through it until sLastElementVal matches
        // then return true if it matches the supplied data type
        if (arrConfig.length > 1) {
            for (key in arrConfig) {
                if (arrConfig.hasOwnProperty(key)) {
                    if (arrConfig[key] === sLastElementVal) {
                        return (sDataType === 'object') ?
                               (helper.lengthOf(config[sLastElementVal]) > 0) : // if
                               typeof config[sLastElementVal] === sDataType;   // else
                    } else {
                        if (helper.hasValidKey(oConfig, arrConfig[key])) {
                            oConfig = oConfig[arrConfig[key]];
                        } else {
                            return false;
                        }
                    }
                }
            }
        }
        // if arrConfig has just one element then check immediately the data type of it
        else {
            return (sDataType === 'object') ? // if sDataType is 'object' then we should check it if it has more than 1 property or element on it
                   (helper.lengthOf(config[sLastElementVal]) > 0) :
                   typeof config[sLastElementVal] === sDataType;   // else
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
        lengthOf: function (oObject) {
            if (!helper._isValidObject(oObject)) {
                return 0; // stop here if oObject is not defined or not an object
            }

            var size = 0, key;

            for (key in oObject) {
                if (oObject.hasOwnProperty(key)) {
                    size++;
                }
            }

            return size;
        },

        /**
         * Build the class so that it will have a dot(.) sign in the beginning of each
         *
         * @param {String} sClasses Space Concatenated classes. Example 'active sorting'
         *
         * @returns {String} Returns a concatenated class. Example '.active.sorting'
         */
        classBuilder: function (sClasses) {
            var sReturnClass = '',
                arrClasses = [];

            if (sClasses !== undefined && sClasses.trim().length > 0) {
                arrClasses = sClasses.trim().split(' ');
                sReturnClass = '.' + arrClasses.join('.');
            }

            return sReturnClass;
        },

        /**
         * Validates data if exist or not
         *
         * @param data Mixed data type
         *
         * @returns {Boolean} True if found
         */
        isValid: function (data) {
            return (data !== undefined && data.length > 0);
        },

        /**
         * Check if the object has a proper or valid key
         *
         * @param {Object} oObject  Object to be validated
         * @param {String} sKey     Key of the object to find if available
         *
         * @returns {boolean}
         */
        hasValidKey: function (oObject, sKey) {
            return helper._isValidObject(oObject) && oObject.hasOwnProperty(sKey);
        },

        /**
         * Check if object is an object in defined
         *
         * @param oObject
         *
         * @returns {boolean}
         *
         * @private
         */
        _isValidObject: function (oObject) {
            return (oObject !== undefined && typeof oObject === 'object');
        }
    };

    /**
     * Extends jQuery
     *
     * @param {Object} options Options of the plugin
     *
     * @returns {jQuery}
     *
     * @constructor
     */
    $.fn.cloneFiltering = function (options) {

        if (!this[0]) {
            return this; // stop here if main container not found
        }

        uiMainContainer = this; // put the main container to the private variable for whole scope availability

        init(options); // initialization

        return this; // for chaining of the jQuery
    };
}(jQuery));