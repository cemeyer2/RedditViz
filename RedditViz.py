import json
import os
import cherrypy
import reddit
from cherrypy._cperror import HTTPError
import time, logging

__author__ = "Charlie Meyer <cemeyer2@illinois.edu>"

log = logging.getLogger(__name__)

class RedditViz(object):

    def __init__(self):
        self.api = reddit.Reddit(user_agent='cs467_reddit_vis')

    @cherrypy.expose
    def index(self):
        return open("index.html").read()
    
    def jsonify_comment(self, comment):
        time.sleep(2)
        d = {}
        d['author'] = comment.author._get_json_dict()
        d['body'] = comment.body
        d['body_html'] = comment.body_html
        d['created'] = comment.created
        d['id'] = comment.id
        d['is_root'] = comment.is_root
        d['downs'] = comment.downs
        d['ups'] = comment.ups
        d['name'] = comment.name
        d['permalink'] = comment.permalink
        return d
    
    def jsonify_submission(self, submission):
        time.sleep(2)
        d = {}
        d['author'] = submission.author._get_json_dict()
        d['created'] = submission.created
        d['downs'] = submission.downs
        d['ups'] = submission.ups
        d['title'] = submission.title
        time.sleep(2)
        d['subreddit'] = submission.subreddit._get_json_dict()
        d['num_comments'] = submission.num_comments
#        time.sleep(2)
#        comments = submission.all_comments
#        d['comments'] = map(self.jsonify_comment, comments[0:num_comments])
        d['over_18'] = submission.over_18
        d['score'] = submission.score
        d['permalink'] = submission.permalink
        d['short_link'] = submission.short_link
        d['text'] = submission.selftext
        d['text_html'] = submission.selftext_html
        return d
    
    @cherrypy.expose
    def search(self, query, subreddit=None, sort=None, limit=10):
        submissions = list(self.api.search(query, subreddit, sort, int(limit)))
        submissions_json = map(self.jsonify_submission, submissions)
        cherrypy.response.headers['Content-Type'] = 'application/json'
        return json.dumps(submissions_json)

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