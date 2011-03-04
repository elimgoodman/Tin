var Tin = function(elem) {
    this.elem = $(elem);
    this.metadata = $(elem).metadata({type:'attr', name:'tin'});
    this.inited = false;
}

Tin.prototype = {
    init: function() {
      if(!this.inited) {
        if(this.elem.is("ul")) {
          this.initList();
        } else if (this.elem.is("form")) {
          this.initForm();
        } else if (this.elem.is("a")) {
            this.initAnchor();
        }
      }

      this.inited = true;
    },

    initList: function() {
      var self = this;

      $.get("/" + this.metadata.type, {}, function(data){
        self.elem.html(data.html);
        self.elem.find(".tin").tin();
      }, "json");
    },

    initForm: function() {
      var self = this;

      this.elem.submit(function(){
        var values = self.elem.serializeArray();
        $.post("/" + self.metadata.type, values, function(data) {
          if(self.metadata.on_success) {
            window[self.metadata.on_success](data);
          }
        }, "json");

        return false;
      });

      $.get("/" + this.metadata.type + "/form", {}, function(data){
        self.elem.html(data.html);
      }, "json");
    },

    initAnchor: function() {
        var self = this;

        this.elem.attr('href', '#');
        
        this.elem.click(function() {
            $.post("/" + self.metadata.type + "/" + self.metadata.method, self.metadata, function(data){
              if(self.metadata.on_success) {
                window[self.metadata.on_success](data);
              }
            }, "json");
        });
    }
}
