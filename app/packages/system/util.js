function sendObjectAsHttpResponse(res, httpStatus, obj) {
  res.status(httpStatus).json(obj);
}
exports.sendObjectAsHttpResponse = sendObjectAsHttpResponse;

function sendErrorAsHttpResponse(res, httpStatus, obj) {
  if((typeof obj).toLowerCase() === 'object' && !obj.msg) {
    const msg = obj.message || 'Generic Error. Please contact the support';
    obj = [];
    obj.push({
      msg: msg
    });
  }
  res.status(httpStatus).json(obj);
}
exports.sendErrorAsHttpResponse = sendErrorAsHttpResponse;

function passNext(fn, err) {
  fn(err || null);
}
exports.passNext = passNext;
