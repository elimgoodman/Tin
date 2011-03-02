exports.authUser = function(config) {
  return function(req, res, next) {
    console.log("FOO");  
    next();
  }
}
