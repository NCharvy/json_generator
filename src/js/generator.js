$(document).ready(function(){
    // Base form
    var $form = $("#form-generator");
    // Validation config
    var validation = [
        {
            elements: [
                "url",
                "screensaver.screensaver_items.item1",
                "screensaver.screensaver_items.item2",
                "screensaver.screensaver_items.item3"
            ],
            type: "url",
            pattern: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
        },
        {
            elements: [
                "reload_timeout",
                "screensaver.screensaver_timeout"
            ],
            type: "numberTimeout"
        },
        {
            elements: [
                "screensaver_delay"
            ],
            type: "numberDelay"
        },
        {
            elements: [
                "screen_orientation"
            ],
            type: "select",
            enum: [
                "landscape",
                "portrait"
            ]
        }
    ];

    // Triggered on form submit
    $form.on("submit", function(e){
        e.preventDefault();
        // get array of form data
        var data = $(this).serializeArray();
        // validation
        if(validateData(data, validation)){
            // send parsed json
            xhrJSON(parseData(data));
        }   
    });
});

/**
 * Send the JSON data to the PHP file
 * in an XHR request
 * 
 * @method  xhrJSON
 * @param  {Object} data JSON data
 */
function xhrJSON(data) {
    $.ajax({
       url : "src/php/execute.php",
       type : "POST",
       contentType : "application/json; charset=utf-8",
       dataType : "json",
       data: JSON.stringify({
            body: data
        }),
       success : function(code, status){
        console.log(code, status);
       },
       error : function(res, status, err){
        var data = {
            response: res,
            status: status,
            error: err
        };
        console.log(data);
       }
    });
}

/**
 * Parse the JSON data into the requested format
 *
 * @method  parseData
 * @param  {Object} data JSON data
 * @return {Object} Parsed data
 */
function parseData(data) {
    // prepared the parsed object
    var parsed = {};
    // iterate through the JSON attributes
    data.forEach(function(elem){
        // get the name splits
        var nameSplit = elem.name.split(".");
        // simply add the current attribute to the
        // object if the name was'nt hierarchized
        if(nameSplit.length == 1) {
            parsed[elem.name] = elem.value;
        }
        // else, iterate throught the sub elements to parse in the right format
        else {
            var screenSaver = parsed[nameSplit[0]] = (typeof parsed[nameSplit[0]] !== "undefined") ? parsed[nameSplit[0]] : {};
            if(nameSplit[1] == "screensaver_items") {
                screenSaver[nameSplit[1]] = (typeof screenSaver[nameSplit[1]] !== "undefined") ? screenSaver[nameSplit[1]] : [];
                var item = {
                    type: "image",
                    url: elem.value
                };

                screenSaver[nameSplit[1]].push(item);
            }
            else{
                screenSaver[nameSplit[1]] = elem.value;
            }
        }
    });

    return parsed;
}

/**
 * Validate all the data values using the 
 * validation config initialized before
 *
 * @method  validateData
 * @param  {Object} data        JSON data
 * @param  {Array} validation   Validation config
 * @return {Boolean}
 */
function validateData(data, validation) {
    // initialize errors array
    var errors = [];
    // iterate through validation config
    validation.forEach(function(validator){
        // the elements matching the current validator
        var elements = validator.elements;
        // iterate through those elements
        elements.forEach(function(elem, i){
            var test = true;
            var err = "";
            // find the input element if it matches with one of
            // the validator elements
            var inputElement = data.find(function(input){
                return input.name === elem;
            });
            // performs all the validations according to the input type
            if(typeof inputElement !== "undefined") {
                switch(validator.type){
                    case "url":
                        test = validator.pattern.test(inputElement.value);
                        err = `The submitted value of ${elem} is not an url`;
                        break;
                    case "numberTimeout":
                        test = (inputElement.value >= 0) && (inputElement.value <= 600);
                        err = `The ${elem} value can only be between 0 and 600`;
                        break;
                    case "numberDelay":
                        test = (inputElement.value >= 0) && (inputElement.value <= 60);
                        err = `The ${elem} value can only be between 0 and 60`;
                        break;
                    case "select":
                        test = validator.enum.find(function(elt){
                            return elt === inputElement.value;
                        });
                        test = (typeof test === "undefined") ? false : true;
                        err = `The ${elem} value can only be ${validator.enum[0]} or ${validator.enum[1]}`;
                        break;
                }
                if(!test && err.length > 0) {
                    errors.push(err);
                    err = "";
                }
            }
        });
    });

    // returns false if at least on of the elements
    // did not pass the validation
    if(errors.length > 0) {
        return false;
    }
    return true;
}