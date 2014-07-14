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

  CodeMirror.defineMode("robot", function(config, parserConfig) {
    function eatCellContents(stream, state) {
    // gobble up characters until the end of the line or we find a separator

    var ch;

    while ((ch = stream.next()) != null) {
      if (ch === "\\") {
            // escaped character; gobble up the following character
            stream.next();
          } else if (ch == " ") {
            // whitespace followed by pipe, then whitespace or EOL
            // This signals the end of a cell in a row
            if (stream.match(/\s*\|(\s+|$)/, false)) {
              stream.backUp(1);
              break;
            } else {
              // at least two consecutive whitespaces
              match = stream.match(/(\s+)/);
              if (match) {
                stream.backUp(match[0].length + 1);
                break;
              }
            }
          }
        }
        return (stream.current().length > 0);
      }

      function canonicalTableName(name) {
      // This returns the canonical name for a table, which will be
      // one of "settings", "test_cases", "keywords", or "variables"
      //
      // This function may return null if name isn't one of the
      // strings supported by robot

      name = name.trim().toLowerCase();
      if (name.match("settings?|metadata")) {return "settings"; }
      if (name.match("(test )?cases?"))     {return "test_cases"; }
      if (name.match("(user )?keywords?"))  {return "keywords"; }
      if (name.match("variables?"))         {return "variables"; }
      return null;
    }

    function isHeading(stream, state) {
      // this matches things like "*** Test Cases ***", "*** Keywors ***", etc
      // It tries to strictly follow the robot specification, which implies you
      // can have more than one asterisk, and trailing asterisks are optional,
      // and the table names must be one of the recognized table names

      if (stream.sol()) {
        var match = stream.match(/^\s*\*+\s*(settings?|metadata|variables?|test( cases?)?|(user )?keywords?)[ *]*$/i);
        if (match !== null) {
          state.table_name = canonicalTableName(match[1]);
          stream.skipToEnd();
          return true;
        }
      }
      return false;
    }

    function isContinuation(stream, state) {
      // Return true if the stream is currently in a
      // continuation cell

      return (state.column === 1 && stream.current().trim() === "...");
    }

    function isSeparator(stream, state) {
      // Return true if the stream is currently in a separator
      var match = stream.match(/(^|\s+)\|(\s+|$)|\s{2,}/)
      return match;
    }

    function isSetting(stream, state) {
      // Return true if the stream is in a settings table and the
      // token is a valid setting

      if (state.isSettingsTable() && state.column === 0) {
        var s = stream.current().trim().toLowerCase();
        if (s.match("^(library|resource|variables|documentation|metadata|" +
          "suite setup|suite teardown|suite precondition|" +
          "suite postcondition|force tags|default tags|test setup|" +
          "test teardown|test precondition|test postcondition|" +
          "test template|test timeout)$")) {
          return true;
      }
    }
    return false;
  }

  function isLocalSetting(stream, state) {
    // Return true if next token is test case or user keyword setting

    var s = stream.current().trim().toLowerCase();
    if (state.isTestCasesTable()) {
      if (s.match("\\[(documentation|tags|setup|teardown|precondition|postcondition|template|timeout)\\]")) {
        return true;
      }
    } else if (state.isKeywordsTable()) {
      if (s.match("\\[(documentation|arguments|return|timeout)\\]")) {
        return true;
      }
    }
    return false;
  }

  function isName(stream, state) {
      // Return true if this is column 0 in a test case or keyword table

      if (state.column === 0 && (state.isTestCasesTable() || state.isKeywordsTable())) {
        state.tc_or_kw_name = stream.current();
        return true;
      }
      return false;
    }

  function isComment(stream, state) {
    // Return true if a cell begins with a hash (and optional leading whitespace)

    if (stream.current().match("^\s*#")) {
      return true;
    }
    return false;
  }

  return {
    startState: function() {
      return {
        table_name: null,
        tc_or_kw_name: null,
        column: 0,
        isSettingsTable: function() {return (this.table_name === "settings"); },
        isVariablesTable: function() {return (this.table_name === "variables"); },
        isTestCasesTable: function() {return (this.table_name === "test_cases"); },
        isKeywordsTable: function() {return (this.table_name === "keywords"); },
      };
    },
    token: function(stream, state) {
        // comments at the start of a line
        if (stream.sol()) {
          state.column = 0;
          if (stream.match(/\s*#/)) {
            stream.skipToEnd();
            return "comment";
          }
        }

        // table headings (eg: *** Test Cases ***)
        if (isHeading(stream, state)) {
          return "header";
        }

        if (isSeparator(stream, state)) {
          state.column += 1;
            // this is a custom class (cm-cell-separator)
            // defined in editor.css
            return "cell-separator";
          }

          var c;
          if ((c=eatCellContents(stream, state))) {
            // a table cell; it may be one of several flavors
            if (isContinuation(stream, state)) {return "meta"; }
            if (isComment(stream, state))      {return "comment"; }
            if (isLocalSetting(stream, state)) {return "builtin"; }
            if (isSetting(stream, state))      {return "attribute"; }
            if (isName(stream, state))         {return "keyword"; }
          }
          return null;
        }
      };
    });
});
