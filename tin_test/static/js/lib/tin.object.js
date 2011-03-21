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
        } else if (this.elem.is("overlay")) {
            this.initOverlay();
        }
      }

      this.inited = true;
    },

    initList: function() {
      var self = this;

      $.get("/" + this.metadata._model, {}, function(data){
        self.elem.html(data.html);
        self.elem.find(".tin").tin();
      }, "json");
    },

    onFormSubmit: function(self, form) {

      form.find("div.error").remove();

      var values = form.serializeArray();
      var url = Urls.formSubmitUrl(self.metadata._model, self.metadata._id);
      $.post(url, values, function(data) {
        if(data.success) {
          if(self.metadata._on_success) {
            window[self.metadata._on_success](data);
          }
        } else {
          if(self.metadata._on_failure) {
            window[self.metadata._on_failure](data);
          } else {
            $.each(data.errors, function(field, errors){
              form.find('input[name=' + field + ']').addClass("error");

              $.each(errors, function(i, error) {
                var err_msg = $("<div>").addClass("error").html(error);
                form.prepend(err_msg);
              });
            });
          }
        }
      }, "json");

      return false;

    },

    //FIXME: remove all this inline form razzamatazz
    fetchForm: function(){
      var self = this;

      $.get("/_form/" + this.metadata._model, {}, function(data){
          self.elem.html(data.html);
          self.elem.submit(function(){
            return self.onformsubmit(self);
          });
      }, "json");
    },
    
    //FIXME: no longer used...
    replaceElemWith: function(elem) {
      this.elem.replaceWith(elem);
      this.elem = elem;
      this.attachMetadata(elem);
    },

    //FIXME: no longer used...
    attachMetadata: function(elem) {
        $.each(this.metadata, function(key, val){
          elem.attr(key, val);
        });
    },

    initAnchor: function() {
        var self = this;

        this.elem.attr('href', '#');

        this.elem.click(function() {
          $.post("/_method/" + self.metadata._model + "/" + self.metadata._method, self.metadata, function(data){
            if(self.metadata._on_success) {
              window[self.metadata._on_success](data);
            }
          }, "json");
        });
    },

    initOverlay: function() {
        var self = this;
        //TODO: move this somewhere better
        if($("#overlay").length == 0) {
            var overlay = $("<div>")
                .addClass("overlay")
                .attr("id", "overlay")
                .hide();
            var inner = $("<div>").addClass('inner');
            overlay.append(inner);
            $("body").append(overlay);
        }
        var link = this.elem.children("a");
        link.attr('href', '#').attr('rel', '#overlay');
        link.overlay({
            onBeforeLoad: function() {
                inner = this.getOverlay().find(".inner");
                $.get(Urls.formUrl(self.metadata._model, self.metadata._id), {}, function(data){
                    var form = $("<form>")
                        .html(data.html)
                        .submit(function(){
                            return self.onFormSubmit(self, $(this));
                        });

                    if(self.metadata._id != undefined) {
                        self.elem.attr("_id", self.metadata._id);
                    }

                    inner.html(form);
                }, "json");
            }
        });
    }
}
