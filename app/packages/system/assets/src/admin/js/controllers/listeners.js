export default (app) => {

  function sendDataAjax(options) {
    $.ajax({
      url : options.formURL,
      type: options.method, // POST or PUT or PATCH
      data : options.postData,
      success:function(data, textStatus, jqXHR) {
        location.href = `${options.urlCallback}/${data._id}`;
      },
      error: function(jqXHR, textStatus, errorThrown) {
        // Show the errors to the setting
        options.$errorMessage.html(`${jqXHR.responseJSON[0].msg}.`);
        options.$error.removeClass('hidden');

        // Enable the submit form button
        options.$btn.removeClass('disabled');
      }
    });
  }

  app.on('appStarted', () => {
    console.log(`${app.config.name} started`);
  });

  app.on('createSetting', (form) => {

    const $createSettingError = $('#createSettingError');
    const $createSettingBtn = $('#createSettingBtn');
    const options = {
      formURL: $(form).attr('action'),
      method: $(form).attr('method'),
      postData: $(form).serialize(),
      urlCallback: '/admin/settings',
      $error: $createSettingError,
      $errorMessage: $('#createSettingError .message'),
      $btn: $createSettingBtn
    }

    // Clear the error message div
    $createSettingError.addClass('hidden');

    // Send Ajax
    sendDataAjax(options);

    // Disable the submit form button
    $createSettingBtn.addClass('disabled');

  });

  app.on('editSetting', (form) => {

    const $editSettingError = $('#editSettingError');
    const $editSettingBtn = $('#editSettingBtn');
    const options = {
      formURL: $(form).attr('action'),
      method: $(form).attr('method'),
      postData: $(form).serialize(),
      urlCallback: '/admin/settings',
      $error: $editSettingError,
      $errorMessage: $('#editSettingError .message'),
      $btn: $editSettingBtn
    }

    // Clear the error message div
    $editSettingError.addClass('hidden');

    // Send Ajax
    sendDataAjax(options);

    // Disable the submit form button
    $editSettingBtn.addClass('disabled');

  });

  app.on('deleteSetting', (btn) => {

    if(!confirm('Are you sure to want delete this setting?')) return false;

    const $btn = $(btn);

    const request = $.ajax({
      url: `/api/system/settings/${$btn.data('id')}`,
      beforeSend: function (request) {
        request.setRequestHeader('csrf-token', window.csrf);
      },
      method: 'DELETE'
    });

    request.done(function(msg) {
      if(window.urlreload) return location.href = window.urlreload;
      location.reload();
    });

    request.fail(function( jqXHR, textStatus ) {
      console.error(`Request failed: ${textStatus}`);
    });

  });

  return app;
}
