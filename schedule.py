import time
import sys
import fcntl
import os

pidfile = 0

def ApplicationInstance():
    global pidfile
    pidfile = open(os.path.realpath(__file__), "r")
    try:
        fcntl.flock(pidfile, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except:
        print "another instance is running..."
        sys.exit(1)

def main():
    ApplicationInstance()
    print 'running...'
    time.sleep(5)

if __name__ == '__main__':
    main()
