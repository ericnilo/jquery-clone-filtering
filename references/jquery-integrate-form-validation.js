/**
 * Form Validation v 0.1.3.2
 *
 * Will handle form validation upon submission.
 * Simple form validation from Integr8
 *
 * @author: Jonathan Subion
 * @adviser: Dominic Canillo
 *
 *  Changelog:
 *      v 0.1.3.2
 *          - Optimized some codes
 *      v 0.1.3.1
 *          - Updated the documentations of codes based on http://usejsdoc.org/
 *      v 0.1.3
 *          - Added "contact_number" with extensions and formats (lorenz pereira)
 *      v 0.1.2
 *          - Added multiple email check support (split using ",")
 *          - Added comments
 *      v 0.1
 *          - initial release
 */
(function ($) {
    'use strict';

    /**
     * Configurations
     *
     * @param {Object} oConfig          Configuration settings
     * @param {Object} oDefaults        Default settings upon initialization.
     * @param {Object} oMethods         For future use, as of now, its no use.
     * @param {Object} oValidationRules Set of Validation Rules. Returns a message
     *                                  if 'correct':
     *                                      signifies that the value will pass through the check
     *                                  else:
     *                                      Error message will be thrown. The message will appear on the array return
     */
    var oConfig = {},
    oDefaults = {
        'min_length'     : 0,
        'max_length'     : 0,
        'data_validation': 'data-validation',
        'input_label'    : 'input-label'
    },
    oMethods = //for future use, as of now, its no use.
    {
        'destroy'    : function (param) {
            console.log("destroy");
        },
        'set_message': function (param) {
            console.log("set message");
        }
    },
    oValidationRules =
    {
        'numeric'       : // checks if value contains numerical numbers only.
            function (val, label) {
                var message = label + " is not numeric",
                    numericExpression = /^[0-9]+$/;

                if (val.match(numericExpression)) {
                    message = "correct";
                }

                return message;
            },
        'alpha'         : // checks if value contains alphabetical letters only
            function (val, label) {
                var message = label + " is not alphabetical",
                    alphaExp = /^[a-zA-Z]+$/;

                if (val.match(alphaExp)) {
                    message = "correct";
                }

                return message;
            },
        'alpha_numeric' : // checks if value contains alpha-numeric only
            function (val, label) {
                var message = label + " is not alphanumeric",
                    alphaNumExp = /^[0-9a-zA-Z]+$/;

                if (val.match(alphaNumExp)) {
                    message = "correct";
                }

                return message;
            },
        'email'         : // checks if an email is a valid email address
            function (val, label) {
                var message = label + " " + val + " is not a valid email address",
                    emailExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    iCountforSplit = 0,
                    myvalues = "",
                    splChars = ",";

                for (var i = 0; i < val.length; i++) {
                    if (splChars.indexOf(val.charAt(i)) != -1) //check if email has "," for split
                    {
                        iCountforSplit++;
                    }
                }

                if (iCountforSplit > 0) {
                    val = val.split(",");
                    $.each(val, function (k, v) {
                        if (!v.match(emailExp)) {
                            myvalues += v + " "; //error emails in one var @myvalues
                        }
                    });
                    if (myvalues != "") {
                        message = label + " " + myvalues + " is not a valid email address"; //error message adding all error emails
                    }
                    else {
                        message = "correct";
                    }
                }
                else {
                    if (val.match(emailExp)) {
                        message = "correct";
                    }
                }

                return message;
            },
        'required'      : // checks if value is not null
            function (val, label) {
                var message = "correct";

                if (val.length == 0) {
                    message = label + " is required";
                }

                return message;
            },
        'cellphone'     : // checks if value is a cellphone number, also workds with telephone number
            function (val, label) {
                var message = label + " is not a valid cellphone number ",
                    phoneno = /^\d{10}$/,
                    cellno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
                    intno = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/,
                    cellno_international = /^\+?([0-9]{1,3})\)?[-. ]?([0-9]{1,3})?[-. ]?([0-9]{1,4})?[-. ]?([0-9]{1,4})$/,
                    cellno_domestic = /^\(?([0-9]{3,4})\)?[-. ]?([0-9]{3,4})[-. ]?([0-9]{3,4})$/;

                if (val.match(phoneno) ||
                    val.match(cellno) ||
                    val.match(intno) ||
                    val.match(cellno_international) ||
                    val.match(cellno_domestic)
                ) {
                    message = "correct";
                }

                return message;
            },
        'isdecimal'     : // checks if value is a number with decimal
            function (val, label) {
                var message = label + " is not a decimal number ",
                    decimal = /^[0-9]+\.[0-9]+$/;

                if (val.match(decimal)) {
                    message = "correct";
                }

                return message;
            },
        'contact_number': function (val, label) {
            var message = label + " is not a valid contact number",
                contactExp = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i;

            // Allows
            // (+351) 282 43 50 50
            // 90191919908
            // 555-8909
            // 001 6867684
            // 001 6867684x1
            // 1 (234) 567-8901
            // 1-234-567-8901 x1234
            // 1-234-567-8901 ext1234
            // 1-234 567.89/01 ext.1234
            // 1(234)5678901x1234
            // (123)8575973
            // (0055)(123)8575973

            if (val.match(contactExp)) {
                message = "correct";
            }

            return message;
        }
    };

    /**
     *  Function for checking the length of the input value
     *
     *  @param {Number} iLength Integer containing the length of the value, (required)
     *  @param {Number} iMin    Integer for minimum length
     *  @param {Number} iMax    Integer for maximum length
     *
     *  @returns {Boolean} The boolean "check"
     */
    function lengthcheck(iLength, iMin, iMax) {
        var check = false;

        if (iMin == 0 && iMax == 0) //checks if max/min lengths are unset
        {
            check = true;
        }
        else if (iMin == 0 || iMax == 0) //checks if only one (min,max) is set
        {
            if (iMin == 0) {
                if (iMax >= iLength) {
                    check = true;
                }
            }
            else if (iMax == 0) {
                if (iMin <= iLength) {
                    check = true;
                }
            }
        }
        else {
            if (iMin <= iLength && iMax >= iLength) //checks when both (min,max) is set
            {
                check = true;
            }
        }

        return check;
    }

    /**
     *  Function for comparing the values
     *
     *  @param {String} value       1st value to be compared
     *  @param {String} sCompare    String name of the attribute to be compared
     *  @param {String} input_label String of the attribute from Configuration
     *
     *  @returns {Boolean} The boolean "check"
     */
    function comparevalues(value, sCompare, input_label) {
        var value2 = $("*[" + input_label + "='" + sCompare + "']").val();

        return (value == value2);
    }

    /**
     *  Function for XSS filtering
     *
     *  Removes tags like "<script></script>"
     *      ex. value -> "<script>alert('doomed~');</script>"
     *      The result will be "alert('doomed~')".
     *
     *  @param {String} text The value of the input text, $(this).val()
     *
     *  @returns {String} The "stripped" version of the input
     */
    function stripHTML(text) {
        var regex = /(<([^>]+)>)/ig;

        return text.replace(regex, "");
    }

    /**
     *  Function for running the form validation
     *
     *  @param {Object} uiElem  Contains the element of the formvalidation (usually form), inserted as $(this) from the main function
     *  @param {Number} param   Configuration of the user (not required)
     *
     *  @returns {Array} An array, will return a null value of array if validation is a success
     */
    function initialize(uiElem, param) {
        oConfig = $.extend(oDefaults, param);

        var result = [];

        uiElem.find("input, select, textarea").each(function () {
            var uiThis = $(this);

            if (uiThis.attr(oConfig.data_validation) !== undefined) // checks if data_validation attribute is present on the element
            {
                var arrRules = uiThis.attr(oConfig.data_validation), // data_validation values
                    mylabel = uiThis.attr(oConfig.input_label), // input_label value
                    value = stripHTML(uiThis.val()), // stripped version of the value
                    iMin = oConfig.min_length,
                    iMax = oConfig.max_length;

                if (oConfig[mylabel] !== undefined) // checks for specific rules
                {
                    if (oConfig[mylabel]['min_length'] !== undefined) {
                        iMin = oConfig[mylabel]['min_length'];
                    }
                    if (oConfig[mylabel]['max_length'] !== undefined) {
                        iMax = oConfig[mylabel]['max_length'];
                    }
                    if (oConfig[mylabel]['compare_input'] !== undefined) {
                        var sCompareInput = oConfig[mylabel]['compare_input'];
                        if (!comparevalues(value, sCompareInput, oConfig.input_label)) //comparevalues
                        {
                            result.push({'error_message': mylabel + " does not match with " + sCompareInput});
                        }
                    }
                }

                if (!lengthcheck(value.length, iMin, iMax)) // lengthcheck
                {
                    result.push({'error_message': mylabel + "'s length does not match with form's min-max value"});
                }

                arrRules = arrRules.split(" ");

                $.each(arrRules, function (k, v) {
                    if (typeof oValidationRules[v] === 'function') { // oValidationRules[v] is a function from oValidationRules,
                        var checkhold = oValidationRules[v](value, mylabel);
                        if (checkhold != 'correct') {
                            result.push({'error_message': checkhold});
                        }
                    }
                });
            }
        });

        return result;
    }

    /**
     *  Main function for cr8vformvalidation
     *  if:
     *      successful(no 'error_message') -> submit form
     *  else:
     *      fail - > stops the form on submission, then run the "onValidationError" function (if available) from param
     *
     *  @param {Number} param Configurations of the user
     */
    $.fn.cr8vformvalidation = function (param) {
        $(this).on("submit", function (e) {
            var result = initialize($(this), param);

            if (result.length <= 0) {//Successful
                if (typeof oConfig.onValidationSuccess === "function") {
                    oConfig.onValidationSuccess(e);
                }
            }
            else {//Fail
                e.preventDefault();
                if (typeof oConfig.onValidationError === "function") {
                    oConfig.onValidationError(result);
                }
            }
        });

    }
})(jQuery);

/**

 v 0.1.2 validation rules list
 numeric
 alpha
 alpha_numeric
 email
 required
 cellphone
 isdecimal

 ***sample usage

 <input type="text" datavalid="email required" labelinput="Email Add" name="myemail"/>

 $("#myform").integr8formvalidation({
    'data_validation' : 'datavalid',
    'input_label' : 'labelinput',
    'min_length': 2,
    'max_length': 20,
        'Password': 
        {
            'min_length': 4,
            'max_length': 15
        },
        'Username': {
            'min_length': 6,
            'max_length': 8
        },
        'Confirm Password':
        {
            'compare_input': 'Password'
        },
    'onValidationError': function(arrMessages) {
        alert(JSON.stringify(arrMessages)); //shows the errors
        },
    'onValidationSuccess': function() {
        alert("Success"); //function if you have something to do upon submission
        }
});

 */