import base64
import collections
import json
import multiprocessing
import os
import shutil
import time

import flask
from flask import Flask, render_template, send_file, request, redirect, url_for, jsonify
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

app = Flask(__name__)

api = Api(app)

bot = Discord_Bot.get_bot()

# process = start_bot('Test')
process = multiprocessing.Process(target=print, args=('Started server',))
process.start()

display = False


def get_dir_size(dir):
    size = 0
    for f in os.listdir(dir):
        size += 1
    return f'{size} items'


def sizeof_fmt(num, suffix="b"):
    for unit in ["", "K", "M", "G", "T", "P", "E", "Z"]:
        if abs(num) < 1000.0:
            return f"{num:3.1f}".rstrip('0').rstrip('.') + f" {unit}{suffix}"
        num /= 1000.0
    return f"{num:.1f}".removesuffix('0').removesuffix('.') + f"{suffix}"


def change_address(ip, user, keep_login):
    global users
    with open(path + '/assets/settings/saved_users.json', 'r') as fp:
        users = json.load(fp)
    users['ip_address'][ip] = {"user": user, "keep_login": keep_login}
    with open(path + '/assets/settings/saved_users.json', 'w') as fp:
        json.dump(users, fp, indent=4, separators=(',', ': '))


def start_bot(which):
    process = multiprocessing.Process(target=Discord_Bot.run, args=(which,))
    process.start()
    return process


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


@app.route('/file_explorer')
def file_explorer():
    return render_template('file_explorer.html')


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


class FilesExplorer(Resource):
    def get(self, dir: str):
        dir = base64.b64decode(dir.encode('ascii')).decode('ascii')
        files = {}
        for file in os.listdir(dir):
            path = dir + '/' + file
            if os.path.isfile(path):
                date = os.path.getmtime(path)
                date = time.strftime('%d.%m.%Y %H:%M:%S', time.strptime(time.ctime(date)))
                size = os.path.getsize(path)
                size = sizeof_fmt(size)
                files[file] = [date, size]
        return collections.OrderedDict(sorted(files.items(), key=lambda i: i[0].lower()))


class DirsExplorer(Resource):
    def get(self, dir: str):
        dir = base64.b64decode(dir.encode('ascii')).decode('ascii')
        dirs = {}
        for d in os.listdir(dir):
            path = dir + '/' + d
            if os.path.isdir(path):
                date = os.path.getmtime(path)
                date = time.strftime('%d.%m.%Y %H:%M:%S', time.strptime(time.ctime(date)))
                size = get_dir_size(path)
                dirs[d] = [date, size]
        return collections.OrderedDict(sorted(dirs.items(), key=lambda i: i[0].lower()))


class GetFile(Resource):
    def get(self, file: str):
        file = base64.b64decode(file.encode('ascii')).decode('ascii')
        path = os.path.split(file)
        name = path[1].removeprefix('.')
        return flask.send_from_directory(path[0], path[1], as_attachment=True, download_name=name)


class Copy(Resource):
    def get(self, copy, dest):
        copy = base64.b64decode(copy.encode('ascii')).decode('ascii')
        dest = base64.b64decode(dest.encode('ascii')).decode('ascii')
        copypart = copy.rpartition('/')
        dest_file = rename_if_exist(copypart[2], dest, os.path.isfile(copy))

        if os.path.isfile(copy):
            response = shutil.copy(copy, dest + '/' + dest_file)
        else:
            response = shutil.copytree(copy, dest + '/' + dest_file, symlinks=True, copy_function=shutil.copy)

        return jsonify(copy, response)


class Cut(Resource):
    def get(self, copy, dest):
        copy = base64.b64decode(copy.encode('ascii')).decode('ascii')
        dest = base64.b64decode(dest.encode('ascii')).decode('ascii')
        copypart = copy.rpartition('/')

        tmp_name = copypart[0] + copypart[1] + '*.123.3.whynot'
        os.rename(copy, tmp_name)

        dest_file = rename_if_exist(copypart[2], dest, os.path.isfile(copy))

        return jsonify(copy, shutil.move(tmp_name, dest + '/' + dest_file))


class Delete(Resource):
    def get(self, file):
        file = base64.b64decode(file.encode('ascii')).decode('ascii')
        if os.path.isfile(file):
            os.remove(file)
        else:
            shutil.rmtree(file)
        return file


def rename_if_exist(file, dest, isfile, first=True):
    def func(f):
        if isfile:
            d_file = file.rpartition('.')
            name = d_file[0]
            return os.path.isfile(f), d_file, name
        else:
            d_file = ('', '', file)
            name = ''
            return os.path.isdir(f), d_file, name
    f = func(dest + '/' + file)
    d_file = f[1]
    name = f[2]
    if f[0]:
        extension = d_file[1] + d_file[2]
        if len(name) <= 0:
            name = extension
            extension = ''
        if name[-1] == ')':
            isok = True
            lastpos = -2
            for i in range(len(name) - 2, 0, -1):
                char = name[i]
                if not char.isnumeric() and not char == '(':
                    isok = False
                    break
                if char == '(':
                    break
                lastpos = i
            if isok:
                name = name[:lastpos - 1] + ('' if first else '(' + str(int(name[lastpos:-1]) + 1) + ')')
                new_name = name + extension
            else:
                new_name = name + '(1)' + extension

        else:
            new_name = name + '(1)' + extension
        file = rename_if_exist(new_name, dest, isfile, False)
    return file


api.add_resource(Auth, '/api/login/auth', '/api/login/auth/<string:user>/<string:mp>/<string:keep>')
api.add_resource(Logout, '/api/login/logout')
api.add_resource(KeepLogin, '/api/login/keep_login')
api.add_resource(AddTime, '/api/time/add')
api.add_resource(SubTime, '/api/time/sub')
api.add_resource(Webcam, '/api/webcam')
api.add_resource(DiscordRestart, '/api/discord/restart')
api.add_resource(DiscordDisplay, '/api/discord/display')
api.add_resource(LightChangeColor, '/api/lights/update_color/<int:r>/<int:g>/<int:b>/<int:w>/<int:a>')
api.add_resource(FilesExplorer, '/api/file_explorer/files/<string:dir>')
api.add_resource(DirsExplorer, '/api/file_explorer/dirs/<string:dir>')
api.add_resource(GetFile, '/api/file_explorer/get_file/<string:file>')
api.add_resource(Copy, '/api/file_explorer/copy/<string:copy>/<string:dest>')
api.add_resource(Cut, '/api/file_explorer/cut/<string:copy>/<string:dest>')
api.add_resource(Delete, '/api/file_explorer/delete/<string:file>')

if __name__ == '__main__':
    serve(app, host='127.0.0.1', port=5000)
