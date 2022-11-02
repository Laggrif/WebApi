from flask import Flask, render_template, request, redirect, url_for
from flask_restful import Api
from waitress import serve

app = Flask(__name__)
api = Api(app)


@app.route('/')
def home():
    return render_template('Home.html')


@app.route('/lights')
def lights():
    return render_template('Lights.html')


@app.route('/lights', methods=['POST', 'GET'])
def lights_post():
    red = request.form['Red']
    return render_template(url_for('lights', red=red))


@app.route('/discord', methods=['POST', 'GET'])
def discord():
    return render_template('Discord.html', display_state='On')


@app.route('/discord')
def reboot():
    print('restarted')
    return redirect(url_for("discord"))


@app.route('/display')
def display():
    return redirect(url_for("discord"))


@app.route('/display-mode', methods=['GET', 'POST'])
def display_mode():
    mode = request.values['select-display']
    return redirect(url_for("discord"))


@app.route('/reload-api', methods=['GET', 'POST'])
def reload_api():
    print(request.form)
    api = request.form['API_KEY']
    print(api)
    return redirect(url_for("discord"))


if __name__ == '__main__':
    serve(app, host='127.0.0.1', port=5000)
