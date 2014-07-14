/*
Copyright 2014 Janne Härkönen
Distributed under the MIT License: http://opensource.org/licenses/MIT
*/

window.onload = function() {
  var editor;
  var loadEditor = function(data) {
    $('.editor').empty()
    editor = CodeMirror($('.editor')[0], {
      lineNumbers: true,
      value: data
    })
    $('.editor').append('<button class="save">Save</button>')
  }

  $('.navi-tree a').on('click', function(evt) {
    $.ajax({
        url: '/datafile',
        data: {path: evt.currentTarget.hash.substring(1)},
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
