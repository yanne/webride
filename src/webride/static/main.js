window.onload = function() {
  var editor;
  var loadEditor = function(data) {
    editor = CodeMirror(document.body, {
      lineNumbers: true,
      value: data
    })
    $(document.body).append('<button class="save">Save</button>')
  }

  $('.navi-tree a').on('click', function() {
    $.ajax({
        url: '/datafile',
        success: loadEditor,
        error: function(jqXHR, statusText, error) {console.log(error)}
    })
  })

  $(document.body).on('click', '.save', function() {
    $.ajax({
        type: 'POST',
        url: '/datafile/save',
        data: {value: editor.getValue()},
        success: function(data) {},
        error: function(jqXHR, statusText, error) {console.log(error)}
    })
  })
}
