//FIXME: reverse param order for consistency
var Permissioner = function(config, model) {
    this.model = model;
    this.config = config;
}

Permissioner.prototype = {
    
    OWNER_KEY: "owner_id",
    OWNER_PERM_TYPE: "owner",
    ANYONE_PERM_TYPE: "anyone",

    addOwner: function(doc, session) {

        if(!this.config.auth.enabled) {
            return doc;
        }

        if(this.model.permissions.owned) {
            doc[this.OWNER_KEY] = session.user._id;
            return doc;
        }
    }, 

    isViewable: function(doc, session) {
        return this._hasPerm(doc, session, 'viewable_by');
    },

    isEditable: function(doc, session) {
        return this._hasPerm(doc, session, 'editable_by');
    },

    _hasPerm: function(doc, session, perm) {
        if(doc == null) { return false; }

        if(!this.config.auth.enabled) {
            return true;
        }

        if(this.model.permissions[perm] == this.OWNER_PERM_TYPE) {
            
            if(doc[this.OWNER_KEY] == undefined) {
              return false;
            }

            if(session.user == undefined) {
                return false;
            }
            
            return doc[this.OWNER_KEY].equals(session.user._id);
        }

        return true;
    }
};

exports.Permissioner = Permissioner;
