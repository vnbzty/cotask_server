from PIL import Image, ImageDraw
import face_recognition
import time
import numpy as np
import pickle
import sys

argv = sys.argv

for i in xrange(1, len(argv)):
    filename = argv[i]
    start = time.time()
    image = face_recognition.load_image_file(filename)
    face_landmarks_list = face_recognition.face_landmarks(image)

    # print("I found {} face(s) in this photograph.".format(len(face_landmarks_list)))

    for face_landmarks in face_landmarks_list:

        # for facial_feature in face_landmarks.keys():
        #     print("The {} in this face has the following points: {}".format(facial_feature, face_landmarks[facial_feature]))
        pil_image = Image.fromarray(image)
        d = ImageDraw.Draw(pil_image)
        for facial_feature in face_landmarks.keys():
            d.line(face_landmarks[facial_feature], width=5)

        # pil_image.show()
    done = time.time();
    elapse = done - start
    print elapse
sys.stdout.flush()
