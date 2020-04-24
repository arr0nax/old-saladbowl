var messages = [];

$(function () {
  console.log('hello');
  var player_name = '';
  var player_id = localStorage.getItem('player_id3');

  if (!player_id || player_id === null) localStorage.setItem('player_id3', Math.floor(Math.random() * 100000));
  player_id = localStorage.getItem('player_id3');
  console.log(player_id);
  var socket = io();
  socket.emit('request_game', player_id);

  /////////////////add player logic
  $('#change_name_form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    player_name = $('#name').val();
    socket.emit('change_name', player_name, player_id);
    $('#player_name').text(player_name)
    $('#player_name2').text(player_name)
    $('#change_name_form').empty();
    showCluesForm();
  });

  ///////////////////////add clues logic
  $('#add_clues_form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('add_clues', [$('#clue1').val(), $('#clue2').val(), $('#clue3').val()], player_name);
    $('#add_clues_form').empty();
  });

  $('#start_game_form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('start_game');
  });

  $('#start_turn_form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('start_turn');
  });

  $('#next_player_form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('next_player');
  });

  $('#got_clue_form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('got_clue');
  });

  $('#skip_clue_form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('skip_clue');
  });

  socket.on('update_game_state', (game) => {
      console.log(game);
      $('#players1').empty();
      $('#players2').empty();
      game.team1.forEach(player => $('#players1').append(`<li id=${player.name} ${player.id === game.activePlayer.id ? 'style="background-color: green"' : 'style="background-color: white"'}>${player.name}: ${player.score}</li>`));
      game.team2.forEach(player => $('#players2').append(`<li id=${player.name} ${player.id === game.activePlayer.id ? 'style="background-color: green"' : 'style="background-color: white"'}>${player.name}: ${player.score}</li>`));
      //
      $('#round').text(`${game.round}: ${game.roundNames[game.round]}`)
      // $('#clues').empty();
      // game.clues.forEach(clue => $('#clues').append(`<li id=${clue.clue}${clue.player}>${clue.clue} (by ${clue.player})</li>`));

      $('#timer').text(game.secondsLeft);

      if (game.activePlayer.id === player_id) {
          // $('#player_name').css('background-color', 'green')
          $('#its_your_turn').css('display', 'block')
          if (game.timerRunning) {
              $('#clue').text(game.cluesLeft[game.activeClue].clue);
              $('#start_turn_form').css('display', 'none')
              $('#got_clue_form').css('display', 'block')
              $('#skip_clue_form').css('display', 'block')

          } else {
              $('#start_turn_form').css('display', 'block')
              $('#clue').text('');
              $('#got_clue_form').css('display', 'none')
              $('#skip_clue_form').css('display', 'none')
          }
      } else {
          // $('#player_name').css('background-color', 'white')
          $('#its_your_turn').css('display', 'none')
          $('#clue').text('');
          $('#start_turn_form').css('display', 'none')
          $('#got_clue_form').css('display', 'none')
          $('#skip_clue_form').css('display', 'none')
      }

      if (game.started) {
          $('#start_game_form').css('display', 'none')
      }

      if (game.round > 3) {
          $('#player_name').css('background-color', 'white')
          $('#clue').text('');
          $('#start_turn_form').css('display', 'none')
          $('#got_clue_form').css('display', 'none')
          $('#skip_clue_form').css('display', 'none')
      }
  })

  socket.on('end_game', game => {
      $('#team1score').text(game.team1score)
      $('#team2score').text(game.team2score)
  })
});

function showCluesForm() {
    console.log('lol');
    $('#add_clues_form').css('display', 'block')
}

function showGameFunctions() {
    console.log('lol');
    $('#game_functions').css('display', 'block')
}
