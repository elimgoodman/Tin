exports.methods = {

    _validate: function(self, db, errs, done) {
        if(self.content == "") {
            errs.addError("content", "Content can't be blank");
        }

        if(self.title == "") {
            errs.addError("title", "Title can't be blank");
        }
        
        done(errs);
    }

}
