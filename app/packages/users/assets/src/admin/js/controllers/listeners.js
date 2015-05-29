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
        // Show the errors to the user
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

  app.on('createUser', (form) => {

    const $createUserError = $('#createUserError');
    const $createUserBtn = $('#createUserBtn');
    const options = {
      formURL: $(form).attr('action'),
      method: $(form).attr('method'),
      postData: $(form).serialize(),
      urlCallback: '/admin/users',
      $error: $createUserError,
      $errorMessage: $('#createUserError .message'),
      $btn: $createUserBtn
    }

    // Clear the error message div
    $createUserError.addClass('hidden');

    // Send Ajax
    sendDataAjax(options);

    // Disable the submit form button
    $createUserBtn.addClass('disabled');

  });

  app.on('editUser', (form) => {

    const $editUserError = $('#editUserError');
    const $editUserBtn = $('#editUserBtn');
    const options = {
      formURL: $(form).attr('action'),
      method: $(form).attr('method'),
      postData: $(form).serialize(),
      urlCallback: '/admin/users',
      $error: $editUserError,
      $errorMessage: $('#editUserError .message'),
      $btn: $editUserBtn
    }

    // Clear the error message div
    $editUserError.addClass('hidden');

    // Send Ajax
    sendDataAjax(options);

    // Disable the submit form button
    $editUserBtn.addClass('disabled');

  });

  app.on('deleteUser', (btn) => {

    if(!confirm('Are you sure to want delete this user?')) return false;

    const $btn = $(btn);

    const request = $.ajax({
      url: `/api/users/${$btn.data('id')}`,
      beforeSend: function (request) {
        request.setRequestHeader('csrf-token', window.csrf);
      },
      method: 'DELETE'
    });

    request.done(function(msg) {
      if(window.urlreload) return location.href = window.urlreload;
    });

    request.fail(function( jqXHR, textStatus ) {
      console.error(`Request failed: ${textStatus}`);
    });

  });

  return app;
}
