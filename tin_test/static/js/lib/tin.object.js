var Tin = function(elem) {
    this.elem = $(elem);
    this.metadata = $.getAttributes(elem);
    this.inited = false;
}

Tin.prototype = {
    init: function() {
      if(!this.inited) {
        if(this.elem.is("ul")) {
          this.initList();
        } else if (this.elem.is("form")) {
          this.fetchForm();
        } else if (this.elem.is("a")) {
            this.initAnchor();
        }
      }

      this.inited = true;
    },

    initList: function() {
      var self = this;

      $.get("/" + this.metadata._model, {}, function(data){
        self.elem.html(data.html);
        //var list = $(data.html);
        //self.replaceElemWith(list);
        self.elem.find(".tin").tin();
      }, "json");
    },

    onFormSubmit: function(self) {

      self.elem.find("div.error").remove();

      var values = self.elem.serializeArray();
      $.post("/" + self.metadata._model, values, function(data) {
        if(data.success) {
          if(self.metadata._on_success) {
            window[self.metadata._on_success](data);
          }
        } else {
          if(self.metadata._on_failure) {
            window[self.metadata._on_failure](data);
          } else {
            $.each(data.errors, function(field, errors){
              self.elem.find('input[name=' + field + ']').addClass("error");

              $.each(errors, function(i, error) {
                var err_msg = $("<div>").addClass("error").html(error);
                self.elem.prepend(err_msg);
              });
            });
          }
        }
      }, "json");

      return false;

    },

    fetchForm: function(){
      var self = this;

      $.get("/_forms/" + this.metadata._model, {}, function(data){
          self.elem.html(data.html);
          //var form = $(data.html);
          //self.replaceElemWith(form);
          self.elem.submit(function(){
            return self.onFormSubmit(self);
          });
      }, "json");
    },
    
    replaceElemWith: function(elem) {
      this.elem.replaceWith(elem);
      this.elem = elem;
      this.attachMetadata(elem);
    },


    attachMetadata: function(elem) {
        $.each(this.metadata, function(key, val){
          elem.attr(key, val);
        });
    },

    initAnchor: function() {
        var self = this;

        this.elem.attr('href', '#');

        this.elem.click(function() {
          $.post("/" + self.metadata._model + "/" + self.metadata._method, self.metadata, function(data){
            if(self.metadata._on_success) {
              window[self.metadata._on_success](data);
            }
          }, "json");
        });
    }
}
