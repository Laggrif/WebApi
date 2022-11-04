import multiprocessing
import os
import threading

from flask import Flask, render_template, url_for, send_file, jsonify
from flask_restful import Api, Resource
from flask_login import LoginManager
from waitress import serve
import Discord.src.Discord_Bot_Laggrif.Discord_Bot as dBot
import Discord.src.Discord_Bot_Laggrif.cogs.Display as dDisplay
import cv2

path = os.path.dirname(os.path.realpath(__file__))


app = Flask(__name__)
api = Api(app)
login_manager = LoginManager()
login_manager.init_app(app)


bot = dBot.get_bot()


def start_bot(which):
    process = multiprocessing.Process(target=dBot.run, args=(which, ))
    process.start()
    return process


process = start_bot('Test')


connected_time = 0

display = False


@app.route('/')
def home():
    return render_template('home.html', connect_time='0')


@app.route('/discord')
def discord():
    return render_template('discord.html')


class AddTime(Resource):
    def get(self):
        global connected_time
        connected_time += 1
        return connected_time


class SubTime(Resource):
    def get(self):
        global connected_time
        connected_time -= 1
        return connected_time


class Webcam(Resource):
    def get(self):
        # TODO get cam img
        url = path + '/static/webcam0.jpeg'
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


api.add_resource(AddTime, '/api/time/add')
api.add_resource(SubTime, '/api/time/sub')
api.add_resource(Webcam, '/api/webcam')
api.add_resource(DiscordRestart, '/api/discord/restart')
api.add_resource(DiscordDisplay, '/api/discord/display')


if __name__ == '__main__':
    serve(app, host='127.0.0.1', port=5000)
