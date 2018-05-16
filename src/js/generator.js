$(document).ready(function(){
    var $form = $("#form-generator");
    // var format = [
    //     {
    //         elements: [
    //             "url",
    //             "screen_saver.screensaver_items.item1",
    //             "screen_saver.screensaver_items.item2",
    //             "screen_saver.screensaver_items.item3"
    //         ],
    //         pattern: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
    //     },
    //     {
    //         elements: [
    //             "reload_timeout",
    //             "screensaver.screensaver_timeout"
    //         ],
            
    //     },
    //     {
    //         elements: [
    //         ],
    //         pattern: //
    //     }
    //     {
    //         type: "select",
    //         enum: [
    //             "landscape",
    //             "portrait"
    //         ]
    //     }
    // ]
    $form.on("submit", function(e){
        e.preventDefault();
        var data = $(this).serializeArray();
        
        xhrJSON(parseData(data));
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

function validateData(data) {
    
}