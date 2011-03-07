exports.ErrorDict = function() {
    this.errs = {}
}

exports.ErrorDict.prototype = {
    addError: function(field, err_text) {
        if(!this.errs[field]) {
            this.errs[field] = [];
        }
        this.errs[field].push(err_text);
    },

    hasErrors: function() {
        return Object.keys(this.errs).length > 0;
    },

    getErrors: function() {
        return this.errs;
    }
}
