
/*
 * GET rtc page.
 */

exports.open = function(req, res){
  var ipstr = req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
  res.render('rtc', { title: 'Express' ,ip:ipstr});
};