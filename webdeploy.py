from flask import Flask,render_template,request
import subprocess
import os
app = Flask (__name__,template_folder='templates')
@app.route("/",methods=['GET'])
def submit():
    if request.method == 'GET':
          return exec(open(r'https://github.com/ShlokKaushik23/ieeeadgitmweb.github.io/facemask.py').read())
if __name__ == '__main__':
	app.run(debug= True,port=5001)
