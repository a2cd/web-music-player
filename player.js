  // 自定义音量滑块逻辑
  function setCustomVolumeBar(vol) {
    vol = Math.max(0, Math.min(1, vol));
    var percent = vol * 100;
    $('#custom-volume-fill').css('width', percent + '%');
    $('#custom-volume-thumb').css('left', percent + '%');
  }
  // 初始化音量条
  setCustomVolumeBar(audio.volume || 0.6);

  // 拖动和点击自定义音量条
  var draggingVolume = false;
  $('#custom-volume-bar').on('mousedown', function(e) {
    draggingVolume = true;
    updateVolumeByEvent(e, this);
  });
  $(document).on('mousemove', function(e) {
    if (draggingVolume) {
      updateVolumeByEvent(e, $('#custom-volume-bar')[0]);
    }
  });
  $(document).on('mouseup', function() {
    draggingVolume = false;
  });
  function updateVolumeByEvent(e, bar) {
    var rect = bar.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var percent = x / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    audio.volume = percent;
    if (audio.volume > 0) {
      audio.muted = false;
      lastVolume = audio.volume;
    }
    setCustomVolumeBar(audio.volume);
    updateVolumeIcon();
  }
  // 音量变化时同步自定义滑块
  $(audio).on('volumechange', function() {
    setCustomVolumeBar(audio.volume);
  });
  // 一键静音/恢复
  var lastVolume = audio.volume;
  function updateVolumeIcon() {
    if (audio.muted || audio.volume === 0) {
      $('.volume-on').hide();
      $('.volume-mute').show();
    } else {
      $('.volume-on').show();
      $('.volume-mute').hide();
    }
  }
  $('#volume-icon').on('click', function () {
    if (audio.muted || audio.volume === 0) {
      audio.muted = false;
      audio.volume = lastVolume > 0 ? lastVolume : 0.8;
    // $('#volume-slider').val(audio.volume);
    } else {
      lastVolume = audio.volume;
      audio.muted = true;
      audio.volume = 0;
    // $('#volume-slider').val(0);
    }
    updateVolumeIcon();
  });
  // 拖动音量时自动恢复非静音
    // $('#volume-slider').on('input', function () {
    //   audio.volume = $(this).val();
    //   if (audio.volume > 0) {
    //     audio.muted = false;
    //     lastVolume = audio.volume;
    //   }
    //   updateVolumeIcon();
    // });
  // 初始化时同步音量图标
  updateVolumeIcon();
  // 拖动音量时自动恢复非静音
    // $('#volume-slider').on('input', function () {
    //   audio.volume = $(this).val();
    //   if (audio.volume > 0) {
    //     audio.muted = false;
    //     lastVolume = audio.volume;
    //   }
    // });
// jQuery 网页音乐播放器核心逻辑
$(document).ready(function () {
  // 预留API接口，实际可替换为远程请求
  function fetchSongs(callback) {
    // 示例：模拟异步请求
    setTimeout(function () {
      callback([
        {
          title: '晴天',
          artist: '周杰伦',
          src: 'music/qingtian.mp3',
          cover: 'cover1.jpg'
        },
        {
          title: '夜曲',
          artist: '周杰伦',
          src: 'music/yequ.mp3',
          cover: 'cover2.jpg'
        },
        {
          title: '稻香',
          artist: '周杰伦',
          src: 'music/daoxiang.mp3',
          cover: 'cover3.jpg'
        }
      ]);
    }, 200);
  }

  var songs = [];

  var currentIndex = 0;
  var playMode = 'order'; // order | single | random
  var audio = $('#audio')[0];
  var isDragging = false;

  // 渲染歌曲列表
  function renderPlaylist() {
    var $list = $('#playlist');
    $list.empty();
    $.each(songs, function (i, song) {
      var $li = $('<li></li>')
        .text(song.title + ' - ' + song.artist)
        .toggleClass('active', i === currentIndex)
        .click(function () {
          if (currentIndex !== i) {
            loadSong(i);
            playSong();
          }
        });
      $list.append($li);
    });
  }

  // 加载歌曲
  function loadSong(index) {
    currentIndex = index;
    var song = songs[index];
    audio.src = song.src;
    $('#cover').attr('src', song.cover);
    $('#song-title').text(song.title);
    $('#song-artist').text(song.artist);
    renderPlaylist();
  }

  // 播放
  function playSong() {
    audio.play();
    $('#play-btn').addClass('playing');
    // 切换为暂停图标
    $('#play-btn .play-icon').hide();
    $('#play-btn .pause-icon').show();
  }

  // 暂停
  function pauseSong() {
    audio.pause();
    $('#play-btn').removeClass('playing');
    // 切换为播放图标
    $('#play-btn .play-icon').show();
    $('#play-btn .pause-icon').hide();
  }

  // 保证初始状态为播放图标
  function updatePlayButtonIcon() {
    if (audio.paused) {
      $('#play-btn .play-icon').show();
      $('#play-btn .pause-icon').hide();
    } else {
      $('#play-btn .play-icon').hide();
      $('#play-btn .pause-icon').show();
    }
  }

  // 监听audio状态变化，保证图标同步
  $(audio).on('play pause ended', updatePlayButtonIcon);

  // 切换播放/暂停
  $('#play-btn').click(function () {
    if (audio.paused) {
      playSong();
    } else {
      pauseSong();
    }
  });

  // 上一首
  $('#prev-btn').click(function () {
    if (playMode === 'random') {
      playRandom();
    } else {
      var prev = (currentIndex - 1 + songs.length) % songs.length;
      loadSong(prev);
      playSong();
    }
  });

  // 下一首
  $('#next-btn').click(function () {
    if (playMode === 'random') {
      playRandom();
    } else {
      var next = (currentIndex + 1) % songs.length;
      loadSong(next);
      playSong();
    }
  });

  // 切换播放模式
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

  // 播放结束事件
  $(audio).on('ended', function () {
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
  });

  // 随机播放
  function playRandom() {
    var idx;
    do {
      idx = Math.floor(Math.random() * songs.length);
    } while (idx === currentIndex && songs.length > 1);
    loadSong(idx);
    playSong();
  }

  // 进度条更新
  $(audio).on('timeupdate', function () {
    if (!isDragging) {
      var percent = audio.currentTime / audio.duration * 100;
      $('.bar-fill').css('width', percent + '%');
      $('.bar-thumb').css('left', percent + '%');
      $('#current-time').text(formatTime(audio.currentTime));
      $('#duration').text(formatTime(audio.duration));
    }
  });

  // 进度条点击跳转
  $('.bar-bg').click(function (e) {
    var offset = $(this).offset();
    var x = e.pageX - offset.left;
    var percent = x / $(this).width();
    audio.currentTime = percent * audio.duration;
  });

  // 音量滑动控制
  $('#volume-slider').on('input', function () {
    audio.volume = $(this).val();
  });

  // 格式化时间
  function formatTime(sec) {
    if (isNaN(sec)) return '00:00';
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  // 初始化：请求歌曲列表
  fetchSongs(function (data) {
    songs = data;
    loadSong(currentIndex);
  // audio.volume = $('#volume-slider').val();
    // 初始化按钮图标
    $('#play-btn .play-icon').show();
    $('#play-btn .pause-icon').hide();
    $('#mode-btn .mode-order').show();
    $('#mode-btn .mode-single, #mode-btn .mode-random').hide();
  });
});
