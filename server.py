from flask import Flask, render_template, request, redirect
from random import sample

app = Flask(__name__)


@app.route('/')
def main():
    return render_template('main.html')


@app.route('/game')
def game():
    rows = int(request.args.get('rows'))
    cols = int(request.args.get('cols'))
    mines = int(request.args.get('mines'))

    mine_places = sample(range(0, rows * cols - 1), mines)

    return render_template('game.html',
                           rows=rows,
                           cols=cols,
                           mines=mines,
                           mine_places=mine_places)


if __name__ == '__main__':
    app.run()
