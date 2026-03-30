import pygame
import time

# 1. 初始化音频混合器
pygame.mixer.init()

# 2. 加载你的 mp3 文件
pygame.mixer.music.load("tips.mp3")

# 3. 开始播放
pygame.mixer.music.play()

# 4. 让程序保持运行，直到音乐播放完毕
while pygame.mixer.music.get_busy():
    time.sleep(1)