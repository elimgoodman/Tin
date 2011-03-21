var Urls = Urls ? Urls : new Object();

Urls.formUrl = function(model, id) {
    var url = "/_form/" + model;
    if(id != undefined) {
        return url + "/" + id;
    } else {
        return url;
    }
}

Urls.formSubmitUrl = function(model, id) {
    var url = "/" + model;
    if(id != undefined) {
        return url + "/" + id;
    } else {
        return url;
    }
}
