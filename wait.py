import time
import sys
import pickle

def main():
    start = time.time()

    argv = sys.argv

    tmp = ''
    for i in xrange(1, len(argv)):
        tmp += argv[i]
    image_name = tmp[0:].split(',')

    with open('file_name', 'r') as f:
        file_name = pickle.load(f)
    with open('face_server', 'r') as f:
        processing_time = pickle.load(f)

    for name in image_name:
        index = file_name.index(name)
        sleep_time = processing_time[index]
        # print 'sleep time', sleep_time
        time.sleep(sleep_time)

    done = time.time();
    elapse = done - start

    print image_name, elapse
    sys.stdout.flush()

if __name__ == '__main__':
    main()
