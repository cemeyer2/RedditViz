import json
import os
import hashlib
import cherrypy
import reddit
from cherrypy._cperror import HTTPError

__author__ = "Charlie Meyer <cemeyer2@illinois.edu>"

class RedditViz(object):

    def __init__(self):
        self.api = None
        # Clear the cache
        cacheFiles = os.listdir('cache')
        for cacheFile in cacheFiles:
            os.remove('cache/' + cacheFile)


    @cherrypy.expose
    def index(self):
        return open("index.html").read()

# Server configuration
SCRIPTS_DIR = os.path.join(os.path.abspath("."), u"scripts")
STYLE_DIR = os.path.join(os.path.abspath("."), u"css")
IMAGES_DIR = os.path.join(os.path.abspath("."), u"images")
config = {'/scripts':
                  {
                  'tools.staticdir.on': True,
                  'tools.staticdir.dir': SCRIPTS_DIR,
                  },
          '/css':
                  {
                  'tools.staticdir.on': True,
                  'tools.staticdir.dir': STYLE_DIR,
                  },
          '/images':
                  {
                  'tools.staticdir.on': True,
                  'tools.staticdir.dir': IMAGES_DIR,
                  }
}
cherrypy.config.update({
    'server.socket_port': 5050,
})
# Start the server
cherrypy.tree.mount(RedditViz(), '/', config)
cherrypy.engine.start()