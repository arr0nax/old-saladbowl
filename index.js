var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/favicon.ico', function(req, res){
    res.sendFile(__dirname + '/favicon.ico');
});

app.get('/scripts.js', function(req, res, next) {
    res.sendfile(__dirname + '/scripts.js');
});

app.get('/styles.css', function(req, res, next) {
    res.sendfile(__dirname + '/styles.css');
});

app.get('/styles.css', function(req, res, next) { res.sendfile(__dirname + '/styles.css'); });


var clues = []
var teams = [];
var game = null;
var timer = null;
var roundTime = 10;

class Player {
    constructor(name, id) {
        this.name = name;
        this.id = id;
        this.score = 0;
    }
}

class Clue {
    constructor(clue, player = null) {
        this.clue = clue;
        this.player = player;
    }
}

class Game {
    constructor() {
        this.clues = [new Clue('asdf'),new Clue('qert'),new Clue('oiuy'),new Clue('cidid'),new Clue('powec')];
        this.cluesLeft = [];
        this.activeClue = 0;
        this.players = [];
        this.team1 = [];
        this.team2 = [];
        this.timerRunning = false;
        this.secondsLeft = roundTime;
        this.round = 1;
        this.roundNames = ['', 'Taboo', 'Charades', 'One Word', 'GAME OVER']
        this.active1Player = 0;
        this.active2Player = 0;
        this.activePlayer = {};
        this.team1active = true;
        this.team1score = 0;
        this.team2score = 0;
        this.started = false;
    }

    addPlayer(player) {
        this.players.push(player);
        this.assignPlayer(player)
    }

    appendClues(newclues) {
        this.clues = this.clues.concat(newclues)
    }

    assignPlayer(player) {
        if (this.players.length % 2 ) {
            this.team2.push(player);
        } else {
            this.team1.push(player);
        }
    }

    startGame() {
        this.started = true;
        this.active1Player = 0;
        this.active2Player = 0;
        this.team1active = true;
        this.activePlayer = this.team1[0];
        io.emit('update_game_state', game);
        this.shuffleClues()
    }

    startTurn() {
        clearInterval(timer);
        timer = null;
        console.log('timer');
        timer = setInterval(this.tick, 1000, this)
        this.activeClue = Math.floor(Math.random() * this.cluesLeft.length)
        this.timerRunning = true;
    }

    tick(game) {
        game.secondsLeft -= 1;
        io.emit('update_game_state', game);
        if (game.secondsLeft <= 0) game.endTurn();
    }

    pauseTurn() {
        console.log('pausing');
        this.timerRunning = false;
        clearInterval(timer);
        timer = null;
    }

    endTurn() {
        this.secondsLeft = roundTime;
        this.timerRunning = false;
        clearInterval(timer);
        timer = null;
        this.nextPlayer();
    }

    nextPlayer() {
        console.log('going here');
        console.log(this.team1.length);
        console.log(this.team2.length);
        if (this.team1active) {
            this.active1Player += 1;
            if (this.active1Player >= this.team1.length) this.active1Player = 0
        } else {
            this.active2Player += 1;
            if (this.active2Player >= this.team2.length) this.active2Player = 0
        }
        this.team1active = !this.team1active;
        if (this.team1active) {
            this.activePlayer = this.team1[this.active1Player]
        } else {
            this.activePlayer = this.team2[this.active2Player]
        }
        io.emit('update_game_state', game);
    }

    shuffleClues() {
        function shuffle(array) {
            return array.sort(() => Math.random() - 0.5);
        }
        this.cluesLeft = shuffle(this.clues.slice());
    }

    gotClue() {
        if (this.team1active) {
            this.team1score += 1;
        } else {
            this.team2score += 1;
        }
        this.players.find(player => player.id === this.activePlayer.id).score += 1;
        this.cluesLeft.splice(this.activeClue, 1);
        if (this.cluesLeft.length === 0) {
            console.log('here');
            this.pauseTurn();
            this.nextRound();
        } else {
            this.activeClue = Math.floor(Math.random() * this.cluesLeft.length)
            io.emit('update_game_state', game);
        }

    }

    skipClue() {
        this.activeClue = Math.floor(Math.random() * this.cluesLeft.length)
        io.emit('update_game_state', game);

    }

    nextRound() {
        this.shuffleClues();
        this.round += 1;
        if (this.round > 3) this.gameOver();
        io.emit('update_game_state', game);
    }

    gameOver() {
        io.emit('end_game', game);
    }
}

game = new Game();

io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('new_game', function(teams) {
        game = new Game();
        io.emit('update_game_state', game);
    });
    // socket.on('add_player', function(player) {
    //     newPlayer = new Player(player)
    //     game.addPlayer(newPlayer)
    //     io.emit('update_game_state', game);
    //     console.log(game);
    // });
    socket.on('change_name', function(name, id) {
        index = game.players.findIndex(player => player.id === id);
        game.players[index].name = name;
        io.emit('update_game_state', game);
    });
    socket.on('add_clues', function(newclues, player) {
        game.appendClues(newclues.map(clue => new Clue(clue, player)))
        io.emit('update_game_state', game);
        console.log(game);
    });
    socket.on('request_game', function(player_id){
        console.log('hello');
        if (!game.players.find(player => player.id === player_id)) {
            newPlayer = new Player('default_user'+player_id, player_id)
            game.addPlayer(newPlayer)
        }
        io.emit('update_game_state', game);
        console.log(game);
    });
    socket.on('start_game', function(){
        console.log('hello start game');
        game.startGame();
        console.log(game);
    });
    socket.on('next_player', function(){
        game.nextPlayer();
        console.log(game);
    });
    socket.on('start_turn', function(){
        game.startTurn();
        console.log(game);
    });
    socket.on('got_clue', function(){
        game.gotClue();
        console.log(game);
    });
    socket.on('skip_clue', function(){
        game.skipClue();
        console.log(game);
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
