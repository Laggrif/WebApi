import json
import multiprocessing
import os

from flask import Flask, render_template, send_file, jsonify, request, redirect, url_for, send_from_directory
from flask_restful import Api, Resource
from waitress import serve
from Discord_Bot_Laggrif import Discord_Bot
from sk_6812_rgbw_laggrif import Colors

path = os.path.dirname(os.path.realpath(__file__))

timer = {}


# logged_in of the form {ip: user, ...}
logged_in = {}
with open(path + '/assets/settings/saved_users.json', 'r') as fp:
    users = json.load(fp)
    for ip in users['ip_address'].keys():
        if users['ip_address'][ip]['keep_login']:
            logged_in[ip] = users['ip_address'][ip]['user']


def change_address(ip, user, keep_login):
    global users
    with open(path + '/assets/settings/saved_users.json', 'r') as fp:
        users = json.load(fp)
    users['ip_address'][ip] = {"user": user, "keep_login": keep_login}
    with open(path + '/assets/settings/saved_users.json', 'w') as fp:
        json.dump(users, fp, indent=4, separators=(',', ': '))


app = Flask(__name__)

api = Api(app)

bot = Discord_Bot.get_bot()


def start_bot(which):
    process = multiprocessing.Process(target=Discord_Bot.run, args=(which,))
    process.start()
    return process


# process = start_bot('Test')
process = multiprocessing.Process(target=print, args=('Started server',))
process.start()

display = False


@app.route('/login')
@app.route('/login/<string:endpoint>')
def login(endpoint='/'):
    return render_template('login.html', endpoint=endpoint)


@app.route('/')
def home():
    ip = request.remote_addr
    if ip not in list(timer.keys()):
        timer[ip] = 0
    return render_template('home.html', connect_time=timer[ip])


@app.route('/discord')
def discord():
    return render_template('discord.html')


@app.route('/lights')
def lights():
    return render_template('lights.html')


@app.route('/techapart')
def techapart():
    return render_template('techapart.html')


@app.route('/favicon.ico')
def favicon():
    return redirect(url_for('static', filename='/images/favicon.ico'))


@app.before_request
def redirection():
    ip = request.remote_addr
    if request.endpoint != 'login' \
            and ip not in list(logged_in.keys()) \
            and '/static/' not in request.path \
            and '/api/' not in request.path:
        return render_template(f'login.html', endpoint=request.path)


class Auth(Resource):
    def get(self, user: str, mp, keep):
        user = user.rstrip()
        if user in users['users'].keys() and users['users'][user] == mp:
            logged_in[request.remote_addr] = user
            change_address(request.remote_addr, user, (keep == '1'))
            return True
        else:
            return False


class Logout(Resource):
    def get(self):
        logged_in.pop(request.remote_addr)
        print(logged_in)


class KeepLogin(Resource):
    def get(self):
        if not request.remote_addr in users['ip_address']:
            return False
        return users['ip_address'][request.remote_addr]['keep_login']


class AddTime(Resource):
    def get(self):
        ip = request.remote_addr
        timer[ip] += 1
        return timer[ip]


class SubTime(Resource):
    def get(self):
        ip = request.remote_addr
        timer[ip] -= 1
        return timer[ip]


class Webcam(Resource):
    def get(self):
        # TODO get cam img
        url = path + '/static/images/webcam0.jpeg'
        return send_file(url)


class DiscordRestart(Resource):
    def get(self):
        global process
        process.kill()
        process = start_bot('Test')


class DiscordDisplay(Resource):
    def get(self):
        global display
        display = not display
        return 'enabled' if display else 'disabled'


class LightChangeColor(Resource):
    def put(self, r, g, b, w, a):
        Colors.run([0,
                    ', '.join([str(r), str(g), str(b), str(w)]),
                    str(a)])
        print([r, g, b, w, a])
        return [r, g, b, w, a]


api.add_resource(Auth, '/api/login/auth', '/api/login/auth/<string:user>/<string:mp>/<string:keep>')
api.add_resource(Logout, '/api/login/logout')
api.add_resource(KeepLogin, '/api/login/keep_login')
api.add_resource(AddTime, '/api/time/add')
api.add_resource(SubTime, '/api/time/sub')
api.add_resource(Webcam, '/api/webcam')
api.add_resource(DiscordRestart, '/api/discord/restart')
api.add_resource(DiscordDisplay, '/api/discord/display')
api.add_resource(LightChangeColor, '/api/lights/update_color/<int:r>/<int:g>/<int:b>/<int:w>/<int:a>')

if __name__ == '__main__':
    serve(app, host='127.0.0.1', port=5000)
