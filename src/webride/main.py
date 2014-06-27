import os
from flask import Flask, render_template, request
app = Flask(__name__)


@app.route("/")
def init():
    names = os.listdir('testdata')
    return render_template('main.html', suite_names=names)


@app.route("/datafile")
def fetch_datafile():
    fname = request.args.get('path')
    return open(os.path.join('testdata', fname)).read()


@app.route("/datafile/save", methods=['POST'])
def save_datafile():
    with open('output/test_suite2.txt', 'w') as outfile:
        outfile.write(request.form['value'])
    return ''


if __name__ == "__main__":
    app.run()
