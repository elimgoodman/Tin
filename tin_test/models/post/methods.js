exports.methods = {

    _validate: function(self, db, errs, done) {
        if(self.content == "") {
            errs.addError("content", "Content can't be blank");
        }

        if(self.title == "") {
            errs.addError("title", "Title can't be blank");
        }
        
        done(errs);
    },

    changeTitle: function(params, db, done) {
      db.findById(params._id, function(result){
        result.title = "CHANGED";
        db.save(result, function(){
            db.close();
            done({success: true});
        });
      })
    }

}
