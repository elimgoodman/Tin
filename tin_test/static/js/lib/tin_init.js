(function( $ ){
    
    var getTin = function(elem) {
        if(elem.data("tin") == undefined) {
            var tin_obj = new Tin(elem);
            tin_obj.init();
            console.log(tin_obj);
            elem.data("tin", tin_obj);
        }

        return elem.data("tin");
    }

    $.fn.tin = function(o) {

        if(this.lenth == 0) {
            return null;
        } else if (this.length == 1) {
            return getTin(this);
        } else {
            var tins = [];
            this.each(function(){
                tins.push(getTin($(this)));
            });
            return tins;
        }
    };
})( jQuery );


$(document).ready(function(){
    $(".tin").tin();
});
