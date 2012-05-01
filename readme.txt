CS467 - Social Visualization
Spring 2012 Final Project Submission

brought to you by:
  Sarah D'Onofrio (donofri2)
  Charlie Meyer (cemeyer2)
  Paul Lambert (lamber10)

This project uses the open source Reddit API to analyze relative popularity of unsavory posts made to the website in relation to each other. Please see the attached *.pdf for our original proposal (though our implementation did change a bit since then).

In order to run this code, the user needs the following on its client:
1. Python 2.7
2. Cherrypy 3.2.2
3. Latest Reddit API (obtainable through apt-get and pypy)
4. A browser other than IE :)

Once all of those are obtained, the project can be launched by navigating to our source folder, .../RedditViz/ and launching "python RedditViz.py". Cherrypy will launch a local server for you to browse the visualization, visitable via localhost:5050

Currently, the project is in Presentation mode for fast load times. Due to the Reddit API restrictions (~2 seconds per request, with a quick timeout limit), we created a Presentation version to ensure that we could show how the data works during class without worrying about load times and the such. If you wish to draw in live data, change line 201 in index.html to "var presentation = true".

Thanks for a great semester! <3
