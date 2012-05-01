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
        try:
          d['author'] = comment.author._get_json_dict()
        except:
          d['author'] = {}
        d['body'] = comment.body
        d['body_html'] = comment.body_html
        d['created'] = comment.created
        d['created_utc'] = comment.created_utc
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
        try:
          d['author'] = submission.author._get_json_dict()
        except:
          d['author'] = {}
        d['created'] = submission.created
        d['created_utc'] = submission.created_utc
        d['downs'] = submission.downs
        d['ups'] = submission.ups
        d['title'] = submission.title
        time.sleep(2)
        d['subreddit'] = submission.subreddit._get_json_dict()
        d['num_comments'] = submission.num_comments
        d['over_18'] = submission.over_18
        d['score'] = submission.score
        d['permalink'] = submission.permalink
        d['short_link'] = submission.short_link
        d['text'] = submission.selftext
        d['text_html'] = submission.selftext_html
        return d
    
    #EX: http://localhost:5050/search?query=NSFL&limit=1
    @cherrypy.expose
    def search(self, query=None, subreddit=None, sort=None, limit=10):
        if query is None:
            raise HTTPError(status=500, message="Missing query parameter")
        submissions = list(self.api.search(query, subreddit, sort, int(limit)))
        submissions_json = map(self.jsonify_submission, submissions)
        cherrypy.response.headers['Content-Type'] = 'application/json'
        # self.writetofile(json.dumps(submissions_json), query)
        return json.dumps(submissions_json)
    
    @cherrypy.expose
    def json(self):
        r = {}
        r['nudity'] = {'title': 'nudity'}
        r['nudity']['boobies'] = {'title': 'boobies', 'children': self.search("boobies")}
        r['nudity']['dick'] = {'title': 'dick', 'children': self.search("dick")}
        r['nudity']['pussy'] = {'title': 'pussy', 'children': self.search("pussy")}
        r['profanity'] = {'title':'profanity'}
        r['profanity']['shit'] = {'title': 'shit', 'children': self.search("shit")}
        r['profanity']['fuck'] = {'title': 'fuck', 'children': self.search("fuck")}
        r['profanity']['ass'] = {'title': 'ass', 'children': self.search("ass")}   
        r['xenophobia'] = {'title': 'xenophobia'}
        r['xenophobia']['nigger'] = {'title': 'nigger', 'children': self.search("nigger")}
        r['xenophobia']['faggot'] = {'title': 'faggot', 'children': self.search("faggot")}  
        r['misogyny'] = {'title': 'misogyny'}
        r['misogyny']['cunt'] = {'title': 'cunt', 'children': self.search("cunt")}
        r['misogyny']['slut'] = {'title': 'slut', 'children': self.search("slut")}
        r['misogyny']['bitch'] = {'title': 'bitch', 'children': self.search("bitch")}    
        r['nsf'] = {'title': 'not safe for'}
        r['nsf']['nsfw'] = {'title': 'nsfw', 'children': self.search("NSFW")}
        r['nsf']['nsfl'] = {'title': 'nsfl', 'children': self.search("NSFL")} 
        self.writetofile(json.dumps(r))
        return "done"
        
    
    #this writes to a file. 
    def writetofile(self, data):
        fp = open("data.json", "w")
        fp.write(data)
        fp.close()

    #EX: http://localhost:5050/comments?num=2&submission_id=gws7c 
    @cherrypy.expose
    def comments(self, url=None, submission_id=None, num=5):
        if url is None and submission_id is None:
            raise HTTPError(status="500", message="Either url or submission_id parameter must be supplied")
        submission = ''
        if url is not None:
            submission = self.api.get_submission(url=url)
        elif submission_id is not None:
            submission = self.api.get_submission(submission_id=submission_id)
        else:
            return json.dumps({})
        comments = submission.all_comments
        cherrypy.response.headers['Content-Type'] = 'application/json'
        return json.dumps(map(self.jsonify_comment, comments[0:int(num)]))
    
    #EX: http://localhost:5050/hot?subreddit=uiuc&num=5
    @cherrypy.expose
    def hot(self, subreddit=None, num=10):
        if subreddit is None:
            raise HTTPError(status=500, message="Missing subreddit parameter")
        submissions = list(self.api.get_subreddit(subreddit).get_hot(int(num)))
        submissions_json = map(self.jsonify_submission, submissions)
        cherrypy.response.headers['Content-Type'] = 'application/json'
        return json.dumps(submissions_json)
    
    #EX: http://localhost:5050/top?subreddit=uiuc&num=5
    @cherrypy.expose
    def top(self, subreddit=None, num=10):
        if subreddit is None:
            raise HTTPError(status=500, message="Missing subreddit parameter")
        submissions = list(self.api.get_subreddit(subreddit).get_top(int(num)))
        submissions_json = map(self.jsonify_submission, submissions)
        cherrypy.response.headers['Content-Type'] = 'application/json'
        return json.dumps(submissions_json)
    
    #EX: http://localhost:5050/subreddit?subreddit=uiuc
    @cherrypy.expose
    def subreddit(self, subreddit=None):
        if subreddit is None:
            raise HTTPError(status=500, message="Missing subreddit parameter")
        cherrypy.response.headers['Content-Type'] = 'application/json'
        return json.dumps(self.api.get_subreddit(subreddit)._get_json_dict())
    
    #EX: http://localhost:5050/login?username=cemeyer2&password=notMyRealPassword
    @cherrypy.expose
    def login(self, username=None, password=None):
        if username is None or password is None:
            raise HTTPError(status=500, message="Missing username and/or password parameter(s)")
        if len(username) == 0 or len(password) == 0:
            raise HTTPError(status=500, message="Missing username and/or password parameter(s)")
        result = True
        try:
            self.api.login(username, password)
        except:
            result = False
        cherrypy.response.headers['Content-Type'] = 'application/json'
        return json.dumps({'result':result})
    
    @cherrypy.expose
    def upvote_submission(self, id=None):
        if id is None:
            raise HTTPError(status=500, message="Missing id parameter")
        result = True
        try:
            self.api.get_submission(submission_id=id).upvote()
        except:
            result = False
        cherrypy.response.headers['Content-Type'] = 'application/json'
        return json.dumps({'result':result})

    @cherrypy.expose
    def downvote_submission(self, id=None):
        if id is None:
            raise HTTPError(status=500, message="Missing id parameter")
        result = True
        try:
            self.api.get_submission(submission_id=id).downvote()
        except:
            result = False
        cherrypy.response.headers['Content-Type'] = 'application/json'
        return json.dumps({'result':result}) 
    
    @cherrypy.expose
    def clear_vote_submission(self, id=None):
        if id is None:
            raise HTTPError(status=500, message="Missing id parameter")
        result = True
        try:
            self.api.get_submission(submission_id=id).clear_vote()
        except:
            result = False
        cherrypy.response.headers['Content-Type'] = 'application/json'
        return json.dumps({'result':result})
    
    @cherrypy.expose
    def subreddit_search(self, query=None):
        if query is None:
            raise HTTPError(status=500, message="Missing query parameter")
        cherrypy.response.headers['Content-Type'] = 'application/json'
        return json.dumps(map(reddit.objects.Subreddit._get_json_dict, self.api.search_reddit_names('NS')))  
    
# Server configuration
SCRIPTS_DIR = os.path.join(os.path.abspath("."), u"scripts")
STYLE_DIR = os.path.join(os.path.abspath("."), u"css")
IMAGES_DIR = os.path.join(os.path.abspath("."), u"images")
DATA_DIR = os.path.join(os.path.abspath("."), u"data")
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
                  },
          '/data':
                  {
                  'tools.staticdir.on': True,
                  'tools.staticdir.dir': DATA_DIR,
                  }
}
cherrypy.config.update({
    'server.socket_port': 5050,
})
# Start the server
cherrypy.tree.mount(RedditViz(), '/', config)
cherrypy.engine.start()
