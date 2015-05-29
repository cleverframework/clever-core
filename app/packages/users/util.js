function sendObjectAsHttpResponse(res, httpStatus, obj) {
  res.status(httpStatus).json(obj);
}
exports.sendObjectAsHttpResponse = sendObjectAsHttpResponse;

function passNext(fn, err) {
  fn(err || null);
}
exports.passNext = passNext;
