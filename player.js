
// ======================== 全局配置 ========================
const MUSIC_API_BASE = 'http://musics.a2cd.cn/favorites/';
const DEFAULT_VOLUME = 0.35; // 默认音量 35%
const FALLBACK_SONGS = [
  {
    title: 'Somero',
    artist: 'Unknown',
    name: 'Somero.mp3',
  },
  {
    title: '谁能明白我',
    artist: '林子祥',
    name: '谁能明白我.mp3',
  },
  {
    title: '月亮翻过小山坡',
    artist: '王海颖&孙圳翰',
    name: '月亮翻过小山坡.flac',
  },
];

let songs = [];
let currentIndex = 0;
let playMode = 'order'; // order | single | random
let audio = $('#audio')[0]; // 播放器组件
let isDraggingVolumeBar = false; // 是否正在拖动音量条
let lastVolume = DEFAULT_VOLUME; // 记录上次非静音时的音量

// ======================== audio control ========================

$(audio).on('ended', () => {
  if (playMode === 'single') {
    audio.currentTime = 0;
    playSong();
  } else if (playMode === 'random') {
    playRandom();
  } else {
    var next = (currentIndex + 1) % songs.length;
    loadSong(next);
    playSong();
  }
  updatePlaylistActive();
});

$(audio).on('play pause ended', updatePlayButtonIcon);

$(audio).on('timeupdate', () => {
    var percent = audio.currentTime / audio.duration * 100;
    $('.progress-fill').css('width', percent + '%');
    $('.progress-thumb').css('left', percent + '%');
    $('#current-time').text(formatTime(audio.currentTime));
    $('#duration').text(formatTime(audio.duration));
});

$(audio).on('volumechange', () => {
  setVolumeBar(audio.volume);
});

// ======================== volume control ========================

function setVolumeBar(vol) {
  vol = Math.max(0, Math.min(1, vol));
  var percent = vol * 100;
  $('#volume-fill').css('width', percent + '%');
  $('#volume-thumb').css('left', percent + '%');

  // 自动切换音量图标
  if (vol === 0 || audio.muted) {
    $('.volume-on').hide();
    $('.volume-mute').show();
  } else {
    $('.volume-on').show();
    $('.volume-mute').hide();
  }
}

/**
 * 用于点击音量条
 */
$('#volume-bar').on('mousedown', (e) => {
  isDraggingVolumeBar = true;
  updateVolumeByEvent(e, e.currentTarget, true);
});
/**
 * 用于拖动音量条
 */
$('#volume-bar').on('mousemove', (e) => {
  // 必须要有mousedown事件才能说明在拖动
  if(isDraggingVolumeBar) {
    updateVolumeByEvent(e, e.currentTarget, true);
  }
});
/**
 * 用于离开音量条
 */
$('#volume-bar').on('mouseup', (_) => {
  isDraggingVolumeBar = false;
});


$('#volume-bar').on('wheel', (e) => {
  e.preventDefault();
  let delta = e.originalEvent.deltaY || e.originalEvent.wheelDelta;
  let step = 0.05;
  let newVolume = audio.volume;
  if (audio.muted) {
    audio.muted = false;
    newVolume = lastVolume > 0 ? lastVolume : 0.5;
  }
  if (delta > 0) {
    newVolume = Math.max(0, audio.volume - step);
  } else if (delta < 0) {
    newVolume = Math.min(1, audio.volume + step);
  }
  audio.volume = newVolume;
  setVolumeBar(audio.volume);
  showVolumeValue(Math.round(audio.volume * 100));
});


$('#volume-bar').on('mouseenter', (e) => {
  const percent = audio.volume;
  showVolumeValue(Math.round(percent * 100));
});

$('#volume-bar').on('mouseleave', () => {
  hideVolumeValueNow();
});

function updateVolumeByEvent(e, bar, showValue) {
  var rect = bar.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var percent = x / rect.width;
  percent = Math.max(0, Math.min(1, percent));
  audio.volume = percent;
  if (audio.volume > 0) {
    audio.muted = false;
    lastVolume = audio.volume;
  }
  setVolumeBar(audio.volume);
  updateVolumeIcon();
  if (showValue) {
    showVolumeValue(Math.round(percent * 100));
  }
}

function showVolumeValue(val) {
  const $val = $('#volume-value');
  $val.text(val);
  $val.css('opacity', 1).show();
}


function hideVolumeValueNow() {
  $('#volume-value').css('opacity', 0).fadeOut();
}


function updateVolumeIcon() {
  if (audio.muted || audio.volume === 0) {
    $('.volume-on').hide();
    $('.volume-mute').show();
  } else {
    $('.volume-on').show();
    $('.volume-mute').hide();
  }
}

$('#volume-icon').on('click', () => {
  if (audio.muted || audio.volume === 0) {
    audio.muted = false;
    audio.volume = lastVolume > 0 ? lastVolume : 0.8;
  } else {
    lastVolume = audio.volume;
    audio.muted = true;
    audio.volume = 0;
  }
  updateVolumeIcon();
});


// ======================== player control ========================


/**
 * 用于点击进度条
 */
$('#progress-bar').on('mousedown', (e) => {
  updateProgressByEvent(e, e.currentTarget, true);
});


function updateProgressByEvent(e, bar, showTime) {
  var rect = bar.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var percent = x / rect.width;
  percent = Math.max(0, Math.min(1, percent));
  audio.currentTime = percent * audio.duration;
  if (showTime) {
    $('#current-time').text(formatTime(audio.currentTime));
  }
  var percent100 = percent * 100;
  $('.progress-fill').css('width', percent100 + '%');
  $('.progress-thumb').css('left', percent100 + '%');
}


function loadSong(index) {
  currentIndex = index;
  var song = songs[index];
  audio.src = song.src;
  $('#song-title').text(song.title);
  $('#song-artist').text(song.artist);
}


function playSong() {
  audio.play();
  $('#play-btn').addClass('playing');
  $('#play-btn .play-icon').hide();
  $('#play-btn .pause-icon').show();
}


function pauseSong() {
  audio.pause();
  $('#play-btn').removeClass('playing');
  $('#play-btn .play-icon').show();
  $('#play-btn .pause-icon').hide();
}


function updatePlayButtonIcon() {
  if (audio.paused) {
    $('#play-btn .play-icon').show();
    $('#play-btn .pause-icon').hide();
  } else {
    $('#play-btn .play-icon').hide();
    $('#play-btn .pause-icon').show();
  }
}


$('#play-btn').click(() => {
  if (audio.paused) {
    playSong();
  } else {
    pauseSong();
  }
});


$('#prev-btn').click(() => {
  if (playMode === 'random') {
    playRandom();
  } else {
    var prev = (currentIndex - 1 + songs.length) % songs.length;
    loadSong(prev);
    playSong();
  }
  updatePlaylistActive();
});


$('#next-btn').click(() => {
  if (playMode === 'random') {
    playRandom();
  } else {
    var next = (currentIndex + 1) % songs.length;
    loadSong(next);
    playSong();
  }
  updatePlaylistActive();
});


$('#mode-btn').click(function () {
  var $btn = $(this);
  $btn.find('.mode-svg').hide();
  if (playMode === 'order') {
    playMode = 'single';
    $btn.find('.mode-single').show();
    $btn.attr('title', '单曲循环');
  } else if (playMode === 'single') {
    playMode = 'random';
    $btn.find('.mode-random').show();
    $btn.attr('title', '随机播放');
  } else {
    playMode = 'order';
    $btn.find('.mode-order').show();
    $btn.attr('title', '顺序播放');
  }
});



function playRandom() {
  var idx;
  do {
    idx = Math.floor(Math.random() * songs.length);
  } while (idx === currentIndex && songs.length > 1);
  loadSong(idx);
  playSong();
}


function formatTime(sec) {
  if (isNaN(sec)) return '00:00';
  var m = Math.floor(sec / 60);
  var s = Math.floor(sec % 60);
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}


// ======================== 歌曲列表渲染 ========================
function renderPlaylist() {
  var $playlist = $('#playlist');
  $playlist.empty();
  songs.forEach(function(song, idx) {
    var li = $('<li></li>')
      .toggleClass('active', idx === currentIndex)
      .append($('<span class="song-id"></span>').text((idx+1)+'. '))
      .append('&nbsp;&nbsp;')
      .append($('<span class="song-title"></span>').text(song.title))
      .append($('<span class="song-artist"></span>').text(song.artist))
      .click(function() {
        if (currentIndex !== idx) {
          loadSong(idx);
          playSong();
          updatePlaylistActive();
        }
      });
    $playlist.append(li);
  });
}

/**
 * 点击歌曲标题时，滚动到当前播放的歌曲位置
 */
$('#song-title').on('click', function() {
  scrollToCurrent();
});

function updatePlaylistActive() {
  $('#playlist li').removeClass('active').eq(currentIndex).addClass('active');

  var currentPositionInfo = (songs.length ? (currentIndex+1) : 0) + '/' + songs.length;
  $('#playlist-info').text(currentPositionInfo);

  scrollToCurrent();
}

function scrollToCurrent() {
  var $cur = $('#playlist li');
  var height = $cur[0].offsetHeight;
  var $list = $('#playlist');
  // 滚动至
  $list.animate({scrollTop: height * currentIndex}, 300);
}


async function fetchSongs() {
  try {
    // const res = await fetch(MUSIC_API_BASE + 'songs.json');
    const res = await fetch('songs.json');
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return FALLBACK_SONGS;
  }
}

// ======================== 初始化 ========================

function main() {
  audio.volume = DEFAULT_VOLUME;
  setVolumeBar(DEFAULT_VOLUME);
  fetchSongs().then((data) => {
    songs = data.map(function(song) {
      return Object.assign({}, song, {
        src: MUSIC_API_BASE + song.name
      });
    });
    loadSong(currentIndex);
    renderPlaylist();
    updatePlaylistActive();
  });
}

main();
