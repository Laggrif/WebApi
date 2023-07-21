import time
from multiprocessing import Process
from random import randrange, randint

from rpi_ws281x import *

import Strandtest

def stopProcess(func):
    def wrapper(*args):
        process = args[0].process
        if process[0] is not None:
            process[1].kill()
            args[0].process = [None, None]
        return func(*args)
    return wrapper


class LightStrip:
    # LED strip configuration:
    LED_COUNT      = 150      # Number of LED pixels.
    LED_PIN        = 18      # GPIO pin connected to the pixels (must support PWM!).
    LED_FREQ_HZ    = 800000  # LED signal frequency in hertz (usually 800khz)
    LED_DMA        = 10      # DMA channel to use for generating signal (try 10)
    LED_BRIGHTNESS = 255     # Set to 0 for darkest and 255 for brightest
    LED_INVERT     = False   # True to invert the signal (when using NPN transistor level shift)
    LED_CHANNEL    = 0
    #LED_STRIP      = ws.SK6812_STRIP_RGBW
    LED_STRIP      = ws.SK6812W_STRIP

    START_LED      = 68
    END_LED        = 151

    def __init__(self):
        self.strip = Adafruit_NeoPixel(self.LED_COUNT, self.LED_PIN, self.LED_FREQ_HZ, self.LED_DMA, self.LED_INVERT,
                                       self.LED_BRIGHTNESS, self.LED_CHANNEL, self.LED_STRIP)
        self.strip.begin()
        self.colors = {}
        self.is_uniform = True
        self.uniform = {'all': [0, 0, 0, 0]}
        for i in range(self.END_LED + 1):
            self.colors[str(i)] = [0, 0, 0, 0]

        self.process = [None, None]

    def get_color(self):
        if self.is_uniform:
            return self.colors['0']
        else:
            return None

    def setBrightness(self, alpha):
        self.LED_BRIGHTNESS = alpha
        if self.process == [None, None]:
            self.showAll(self.uniform if self.is_uniform else self.colors)

    def setPixelColor(self, index, color):
        color = [int(c * self.LED_BRIGHTNESS / 255 + 0.5) for c in color]
        self.strip.setPixelColor(index, Color(*color))

    @stopProcess
    def show(self, index, color):
        self.is_uniform = False
        self.setPixelColor(index, color)
        self.strip.show()
        self.colors[str(index)] = color

    @stopProcess
    def showAll(self, dict: dict):
        if 'all' in list(dict.keys()):
            value = dict['all']
            self.is_uniform = True
            self.colors = {x: value for x in self.colors}
            self.uniform['all'] = value
            [self.setPixelColor(i, value) for i in range(self.START_LED, self.END_LED)]
            self.strip.show()
        else:
            self.is_uniform = False
            for index, value in dict.items():
                self.colors[index] = value
                self.setPixelColor(int(index) + self.START_LED, value)
            self.strip.show()

    @stopProcess
    def showProgressive(self, color):
        self.is_uniform = True
        self.uniform['all'] = color
        m = 0.9
        for i in range(self.START_LED, self.END_LED):
            self.setPixelColor(i, color)
            self.strip.show()
            m = m ** 1.3
            time.sleep(m)

    def rainbow(self, speed):
        self.is_uniform = False
        if self.process[0] is not None:
            self.process[1].kill()
        def rb():
            while True:
                for j in range(256):
                    for i in range(self.START_LED, self.END_LED):
                        self.setPixelColor(i, Strandtest.wheel((i + j) & 255))
                    self.strip.show()
                    time.sleep(1/speed)
        self.process = ['rainbow', Process(target=rb)]
        self.process[1].start()

    def flash_rainbow(self, speed):
        self.is_uniform = False
        if self.process[0] is not None:
            self.process[1].kill()
        def fr():
            while True:
                col = (randint(0, 255), randint(0, 255), randint(0, 255), 0)
                for i in range(self.START_LED, self.END_LED):
                    self.setPixelColor(i, col)
                self.strip.show()
                time.sleep(1/speed * 10)
        self.process = ['flash_rb', Process(target=fr)]
        self.process[1].start()

    def strobe(self, speed):
        self.is_uniform = False
        if self.process[0] is not None:
            self.process[1].kill()
        def f():
            while True:
                for i in range(self.START_LED, self.END_LED):
                    self.setPixelColor(i, (60, 60, 140, 255))
                self.strip.show()
                time.sleep(1 / speed)
                for i in range(self.START_LED, self.END_LED):
                    self.setPixelColor(i, (0, 0, 0, 0))
                self.strip.show()
                time.sleep(1 / speed)
        self.process = ['strobe', Process(target=f)]
        self.process[1].start()
