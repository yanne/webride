/*
Copyright 2014 Janne Härkönen
Distributed under the MIT License: http://opensource.org/licenses/MIT
*/

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  var Pos = CodeMirror.Pos;
  var suiteSettings = ['Suite Setup', 'Suite Teardown', 'Documentation',
    'Metadata', 'Library', 'Resource', 'Variables', 'Test Setup', 'Test Teardown',
    'Force Tags', 'Default Tags', 'Test Template', 'Test Timeout']

  function getCompletions(token, cursor, editorState) {
    var start = token.string.substring(token.start, cursor.ch).toLowerCase();
    if (editorState.isSettingsTable()) {
      return _.filter(suiteSettings, function (setting) {
        return setting.toLowerCase().substring(0, start.length) === start;
      });
    } else return [];
  }

  function robotHint(editor, options) {
    cursor = editor.getCursor();
    token = editor.getTokenAt(cursor);
    editorState = CodeMirror.innerMode(editor.getMode(), token.state).state
    return {list: getCompletions(token, cursor, editorState),
            from: Pos(cursor.line, token.start),
            to: Pos(cursor.line, token.end)};
  }

  CodeMirror.registerHelper("hint", "robot", robotHint);


});
