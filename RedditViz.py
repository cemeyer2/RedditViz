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
        self.writetofile(json.dumps(submissions_json), query)
        return json.dumps(submissions_json)

    def json_search(self, query=None, subreddit=None, sort=None, limit=10):
        submissions = list(self.api.search(query, subreddit, sort, int(limit)))
        return map(self.jsonify_submission, submissions)
    
    @cherrypy.expose
    def json(self):
        nudity_children = []
        nudity_children.append({'title': 'boobies', 'children': self.json_search("boobies")})
        nudity_children.append({'title': 'dick', 'children': self.json_search("dick")})
        nudity_children.append({'title': 'pussy', 'children': self.json_search("pussy")})
        nudity = {'title': 'nudity', 'children': nudity_children}
       
        profanity_children = []
        profanity_children.append({'title': 'shit', 'children': self.json_search("shit")})
        profanity_children.append({'title': 'fuck', 'children': self.json_search("fuck")})
        profanity_children.append({'title': 'ass', 'children': self.json_search("ass")})
        profanity = {'title': 'profanity', 'children' : profanity_children}

        xenophobia_children = []
        xenophobia_children.append({'title': 'nigger', 'children': self.json_search("nigger")})
        xenophobia_children.append({'title': 'faggot', 'children': self.json_search("faggot")})
        xenophobia = {'title': 'xenophobia', 'children': xenophobia_children}
       
        misogyny_children = []
        misogyny_children.append({'title': 'cunt', 'children': self.json_search("cunt")})
        misogyny_children.append({'title': 'slut', 'children': self.json_search("slut")})
        misogyny_children.append({'title': 'bitch', 'children': self.json_search("bitch")})    
        misogyny = {'title': 'misogyny', 'children' : misogyny_children}

        nsf_children = []
        nsf_children.append({'title': 'nsfw', 'children': self.json_search("NSFW")})
        nsf_children.append({'title': 'nsfl', 'children': self.json_search("NSFL")}) 
        nsf = {'title': 'nsf', 'children' : nsf_children};

        data = []
        data.append(nudity)
        data.append(profanity)
        data.append(xenophobia)
        data.append(misogyny)
        data.append(nsf)
        
        r = {'title':'reddit data', 'children': data}
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
    'server.socket_host': '0.0.0.0',
})
# Start the server
cherrypy.tree.mount(RedditViz(), '/', config)
cherrypy.engine.start()
