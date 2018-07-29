import time
import sys
import pickle

def main():
    start = time.time()

    argv = sys.argv
    image_name = argv[1]
    mobile_number = argv[2]

    with open('file_name', 'rb') as f:
        file_name = pickle.load(f)
    with open('face_server', 'rb') as f:
        processing_time = pickle.load(f)

    index = file_name.index(image_name)
    sleep_time = processing_time[index]
    print 'sleep time', sleep_time
    time.sleep(sleep_time)

    done = time.time();
    elapse = done - start

    print mobile_number, image_name,elapse
    sys.stdout.flush()

if __name__ == '__main__':
    main()
