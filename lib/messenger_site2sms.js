(function() {
  module.exports = function(to, messages, callback) {
    var unirest, url;
    unirest = require('unirest');
    url = "https://site2sms.p.mashape.com/index.php?msg= " + messages + "&phone=" + to + "&pwd=shakdwipeea&uid=8277564501";
    console.log(url);
    return unirest.get(url).header("X-Mashape-Key", "mIpJNN69V9mshQsuZoiAaCeAahrtp1kzyEmjsnbSeuE3eva5Lj").header("Accept", "application/json").end(function(result) {
      console.log(result.status, result.headers, result.body);
      if (JSON.parse(result.body).response === 'done\n') {
        return callback(false, null);
      } else {
        return callback(true, result.body);
      }
    });
  };

}).call(this);
