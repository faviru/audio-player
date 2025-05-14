const audioContext = new AudioContext();
const audioElement = document.querySelector("audio");
const title = document.querySelector(".song-name");
const author = document.querySelector(".song-author");
const cover = document.querySelector(".cover");
const durationCurrent = document.querySelector(".duration__current");
const durationFull = document.querySelector(".duration__full");
const progressBar = document.querySelector(".progress-bar__container");
const progressContent = document.querySelector(".progress-bar__content");
const track = audioContext.createMediaElementSource(audioElement);
const gainNode = audioContext.createGain();
track.connect(gainNode).connect(audioContext.destination);
const playButton = document.querySelector(".play");
const prevButton = document.querySelector(".prev");
const nextButton = document.querySelector(".next");
const shuffleButton = document.querySelector(".shuffle");
const repeatButton = document.querySelector(".repeat");
const playIcon = document.querySelector(".play-icon");
const pauseIcon = document.querySelector(".pause-icon");


let songs = [{
  title: 'Flying Waters - Goblu',
  author: 'Lorien Testard & Alice Duport-Percier',
  src: './assets/audio/29. Flying Waters - Goblu.mp3',
  cover: './assets/img/Original.jpg'
}, {
  title: 'Gustave',
  author: 'Lorien Testard',
  src: './assets/audio/01. Gustave.mp3',
  cover: './assets/img/Gustave.jpg'
}, {
  title: 'Our Drafts Unite',
  author: 'Lorien Testard & Alice Duport-Percier',
  src: './assets/audio/02. Our Drafts Unite.mp3',
  cover: './assets/img/Reveal.jpg'
}]

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

let currentTrack = 0;

function songInit(data) {
  audioElement.src = data.src;
  title.innerHTML = data.title;
  author.innerHTML = data.author;
  cover.style.backgroundImage = `url('${data.cover}')`;
}

function togglePlayIcon() {
  if (playButton.dataset.playing === 'false') {
    playIcon.classList.remove('icon--hide')
    pauseIcon.classList.add('icon--hide')
  } else {
    playIcon.classList.add('icon--hide');
    pauseIcon.classList.remove('icon--hide');
  }
}

songInit(songs[currentTrack]);

playButton.addEventListener("click", () => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  if (playButton.dataset.playing === "false") {
    audioElement.play();
    playButton.dataset.playing = "true";
  } else if (playButton.dataset.playing === "true") {
    audioElement.pause();
    playButton.dataset.playing = "false";
  }
  togglePlayIcon();
}, false,);

prevButton.addEventListener("click", () => {
  let newTrackIndex = currentTrack - 1;
  currentTrack = newTrackIndex < 0 ? songs.length - 1 : newTrackIndex;
  songInit(songs[currentTrack]);
  audioElement.play();
  playButton.dataset.playing = "true";
  togglePlayIcon();
});

nextButton.addEventListener("click", () => {
  let newTrackIndex = currentTrack + 1;
  currentTrack = newTrackIndex > songs.length - 1 ? 0 : newTrackIndex;
  songInit(songs[currentTrack]);
  audioElement.play();
  playButton.dataset.playing = "true";
  togglePlayIcon();
});

shuffleButton.addEventListener("click", () => {
  songs = shuffle(songs);
  currentTrack = 0;
  songInit(songs[currentTrack]);
  audioElement.play();
  playButton.dataset.playing = "true";
  togglePlayIcon();
});

repeatButton.addEventListener("click", () => {
  repeatButton.dataset.repeating = repeatButton.dataset.repeating === 'false' ? 'true' : 'false';
});

audioElement.addEventListener("ended", () => {
  if (repeatButton.dataset.repeating === 'true') {
    audioElement.play();
    playButton.dataset.playing = "true";
    togglePlayIcon();
  } else {
    nextButton.click();
  }
}, false,);

const volumeControl = document.querySelector(".volume");

volumeControl.addEventListener("input", () => {
  gainNode.gain.value = volumeControl.value;
}, false,);

function setSongDuration(e) {
  let date = new Date(0);
  date.setSeconds(e.target.duration);
  durationFull.innerHTML = date.toISOString().substring(14, 19);
}

audioElement.addEventListener("loadedmetadata", setSongDuration);

function throttle(callee, timeout) {
  let timer = null;
  return function perform(...args) {
    if (timer) return;
    timer = setTimeout(() => {
      callee(...args);
      timer = null
    }, timeout)
  }
}

function updateProgress(e) {
  let date = new Date(0);
  date.setSeconds(e.target.currentTime);
  durationCurrent.innerHTML = date.toISOString().substring(14, 19);
  progressContent.style.width = e.target.currentTime / e.target.duration * 100 + '%';
}

const throttledUpdateProgress = throttle(updateProgress, 1000);

audioElement.addEventListener('timeupdate', throttledUpdateProgress);

function setProgress(e) {
  const width = progressBar.clientWidth;
  const clickPosition = e.offsetX;
  const duration = audioElement.duration;
  audioElement.currentTime = clickPosition / width * duration;

}

progressBar.addEventListener("click", setProgress)