import json
import multiprocessing
import os

from flask import Flask, render_template, send_file, jsonify, request, redirect, url_for, send_from_directory
from flask_restful import Api, Resource
from waitress import serve
from Discord_Bot_Laggrif import Discord_Bot

path = os.path.dirname(os.path.realpath(__file__))

timer = {}

logged_in = {}
with open(path + '/assets/settings/saved_users.json', 'r') as fp:
    users = json.load(fp)
    for user in users.keys():
        for ip, keep_login in list(users[user]['ip_addresses'].items()):
            if keep_login:
                logged_in[ip] = users


def change_address(user, ip, keep_login):
    with open(path + '/assets/settings/saved_users.json', 'r') as fp:
        users = json.load(fp)
    users[user]['ip_addresses'][ip] = keep_login
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


class Auth(Resource):
    def get(self, user, mp, keep):
        if user in users.keys() and users[user]['password'] == mp:
            logged_in[request.remote_addr] = user
            change_address(user, request.remote_addr, (keep == '1'))
            return True
        else:
            return False


class Logout(Resource):
    def get(self):
        logged_in.pop(request.remote_addr)
        print(logged_in)


class KeepLogin(Resource):
    def get(self):
        #TODO change users structure so we can get user by ip
        ip = request.remote_addr
        user = logged_in[ip]
        return users[user]['ip_addresses'][request.remote_addr]


api.add_resource(AddTime, '/api/time/add')
api.add_resource(SubTime, '/api/time/sub')
api.add_resource(Webcam, '/api/webcam')
api.add_resource(DiscordRestart, '/api/discord/restart')
api.add_resource(DiscordDisplay, '/api/discord/display')
api.add_resource(Auth, '/api/login/auth', '/api/login/auth/<string:user>/<string:mp>/<string:keep>')
api.add_resource(Logout, '/api/login/logout')
api.add_resource(KeepLogin, '/api/login/keep_login')

if __name__ == '__main__':
    serve(app, host='127.0.0.1', port=5000)
