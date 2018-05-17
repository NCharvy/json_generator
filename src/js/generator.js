$(document).ready(function(){
    var $form = $("#form-generator");
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
                "screensaver_orientation"
            ],
            type: "select",
            enum: [
                "landscape",
                "portrait"
            ]
        }
    ];

    $form.on("submit", function(e){
        e.preventDefault();
        var data = $(this).serializeArray();
        if(validateData(data, validation)){
            xhrJSON(parseData(data));
        }   
    });
});

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
       },


       complete : function(res, status){
        console.log("complete", res);
       }
    });
}

function parseData(data) {
    var parsed = {};
    data.forEach(function(elem){
        var nameSplit = elem.name.split(".");
        if(nameSplit.length == 1) {
            parsed[elem.name] = elem.value;
        }
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

function validateData(data, validation) {
    var errors = [];
    validation.forEach(function(validator){
        var elements = validator.elements;
        elements.forEach(function(elem, i){
            console.log(elem);
            var test = true;
            var err = "";
            var inputElement = data.find(function(input){
                return input.name === elem;
            })
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

    if(errors.length > 0) {
        console.log(errors);
        return false;
    }
    return true;
}