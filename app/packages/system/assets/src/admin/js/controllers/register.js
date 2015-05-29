export default (app) => {

  function callListener(e, eventName) {
    // STOP default action
    e.preventDefault();
    e.stopImmediatePropagation();

    // Emit event
    console.log(`Emit: ${eventName}`);
    app.emit(eventName, this);
  }

  $('.deleteSetting').click(function(e) {
    callListener.call(this, e, 'deleteSetting');
  });

  $('#createSetting').submit(function(e) {
    callListener.call(this, e, 'createSetting');
  });

  $('#editSetting').submit(function(e) {
    callListener.call(this, e, 'editSetting');
  });

  return app;
}
