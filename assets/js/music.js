
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const heading = $('header h2');
const cd = $('.cd');
const audio = document.querySelector('audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const reloadBtn = $('.fa-arrow-rotate-right');
const progress = $('#progress');
const preBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.fa-shuffle');
const repeatBtn = $('.fa-repeat');


const PLAYER_STORAGE_KEY = 'hihi';

const playlist = $('.playlist');

const app = {
      currentIndex: 1,
      isPlaying: false, 
      isRandom: false,
      isRepeat: false,
      config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {}
      ,
      songs: [
            {
                  name: 'Luar',
                  singer: 'Lancelot',
                  path: './music/LUAR - LANCELOT x FYU - RioX.mp3', 
                  image: './image/luar.png'
            },
            {
                  name: 'Mi Respirar',
                  singer: 'bxkq',
                  path: './music/MI RESPIRAR (Sped Up) - bxkq.mp3', 
                  image: './image/mirespirar_speedup.png'
            },
            {
                  name: 'Struct',
                  singer: 'UdieNnx',
                  path: './music/STRUCT (Slowed) - UdieNnx.mp3', 
                  image: './image/struct.png'
            },
            {
                  name: 'Estou Livre',
                  singer: 'CHASHKAKEFIRA',
                  path: './music/ESTOU LIVRE - CHASHKAKEFIRA.mp3', 
                  image: './image/estoulirve.png'
            },
            {
                  name: 'Link',
                  singer: 'RXTKY',
                  path: './music/LINK! (feat. RXTKY) - Codet.mp3', 
                  image: './image/link.png'
            },
      ],
      setConfig: function(key, value){
            this.config[key] = value;
            localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
      }
      ,
      render(){
            const htmls = this.songs.map((song, index) =>{
                  return `
                        <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                              <div class="musicImage" style="background-image: url('${song.image}');">
                              </div>
                              <div class="body">
                                    <h3 class="title">${song.name}</h3>
                                    <p class="author">${song.singer}</p>
                              </div>
                              <div class="delete-btn btn">
                                    <i class="fa-solid fa-trash"></i>
                              </div>
                        </div>
                  `
            });
            playlist.innerHTML = htmls.join('');
      },
      defineProperties: function() {
            Object.defineProperty(this, 'currentSong', {
                  get: function(){
                        return this.songs[this.currentIndex];
                  }
            });
      }
      ,
      handleEvents(){
            const _this = this;
            const cdWidth = cd.offsetWidth;

            // cd rotate 360deg
            const cdAnimate = cd.animate(
                  [{transform: 'rotate(360deg)'}],
                  {     duration: 10000,
                        iterations: Infinity,
                        easing: 'linear',
                  }
                  
            );
      
            cdAnimate.pause();

            document.onscroll = () =>{
                  const scrollTop = document.documentElement.scrollTop || window.scrollY;
                  var cdNewWidth = cdWidth - scrollTop;
                  
                  cd.style.width = cdNewWidth > 0 ? `${cdNewWidth}px` : 0;
                  cd.style.opacity = cdNewWidth / cdWidth;
            }

            // onclick
            playBtn.onclick = () => {
                  if(_this.isPlaying){
                        audio.pause();
                        cdAnimate.pause();
                  }else{
                        audio.play();
                        cdAnimate.play();
                  }
            }

            audio.onplay = () =>{
                  _this.isPlaying = true;
                  player.classList.add('playing');
            }
            audio.onpause = () =>{
                  _this.isPlaying = false;
                  player.classList.remove('playing');
            }
            audio.ontimeupdate = () => {
                  let progressPercent;
                  if(audio.duration){
                        progressPercent = (audio.currentTime/audio.duration * 100);
                        progress.value = progressPercent;
                  }else{
                        progressPercent = 0;
                  }
            }
            
            progress.oninput = (e) => {
                  audio.currentTime = e.target.value / 100 * audio.duration;
            }

            // other btn functions

            // reloadBtn.onclick = () => {
            //       audio.load();
            //       audio.play();
            // }
            nextBtn.onclick = () => { 
                  if(_this.isRandom){
                        _this.randomSong();
                  }else{
                        _this.nextSong();
                  }
                  audio.play();
                  _this.render();
                  _this.setConfig('currentIndex', this.currentIndex);
                  _this.scrollToActiveSong();
            }
            preBtn.onclick = () => { 
                  if(_this.isRandom){
                        _this.randomSong();
                  }else{
                        _this.preSong();
                  }
                  audio.play();
                  _this.render();
                  _this.setConfig('currentIndex', this.currentIndex);
                  _this.scrollToActiveSong();
            }
            randomBtn.onclick = () => {
                  _this.isRandom = !_this.isRandom;
                  _this.setConfig('isRandom', _this.isRandom);
                  randomBtn.classList.toggle('shuffle', _this.isRandom);
            }
            repeatBtn.onclick = () => {
                  _this.isRepeat = !_this.isRepeat;
                  _this.setConfig('isRepeat', _this.isRepeat);
                  repeatBtn.classList.toggle('repeat', _this.isRepeat);
            }

            //next song when current song ended
            audio.onended = () => {
                  if(_this.isRepeat){
                        // audio.currentTime = 0;
                        audio.play();
                  }else{
                        nextBtn.click();
                  }
                        _this.setConfig('currentIndex', this.currentIndex);
            }

            playlist.onclick = (e) =>{
                  const noActiveSong = e.target.closest('.song:not(.active)');

                  if(noActiveSong){
                        const indexSongClick = noActiveSong.dataset.index;
                        

                        if(!e.target.closest('.song .fa-trash')){
                              _this.currentIndex = Number(indexSongClick);
                              _this.loadCurrentSong();
                              audio.play();
                              _this.render();
                              _this.setConfig('currentIndex', this.currentIndex);

                        }else{
                              const songdeleted = $(`.song[data-index="${Number(indexSongClick)}"]`);
                              songdeleted.remove();
                        }
                  }
            }
             
      },
      scrollToActiveSong(){
            setTimeout(()=>{
                  $('.song.active').scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});

            }, 200)
      }
      ,
      loadCurrentSong(){
            heading.textContent = this.currentSong.name;
            cd.style.backgroundImage = `url('${this.currentSong.image}')`;
            audio.src = this.currentSong.path;
      },
      loadConfig(){
            this.currentIndex = this.config.currentIndex;
            this.isRandom = this.config.isRandom;
            this.isRepeat = this.config.isRepeat;
      },
      configIntoApp(){
            randomBtn.classList.toggle('shuffle', this.isRandom);
            repeatBtn.classList.toggle('repeat', this.isRepeat);
      }
      ,
      nextSong(){
            var nextIndex = this.currentIndex + 1;
            this.currentIndex = nextIndex == this.songs.length ? 0 : nextIndex;
            this.loadCurrentSong();
      },
      preSong(){
            var preIndex = this.currentIndex - 1;
            this.currentIndex = preIndex == -1 ? this.songs.length-1 : preIndex ;
            this.loadCurrentSong();
      },
      randomSong(){
            let randomIndex;
            do{
                  randomIndex = Math.round(Math.random() * (this.songs.length - 1));
            }while(randomIndex === this.currentIndex && this.songs.length > 1);
            console.log(randomIndex);
            this.currentIndex = randomIndex;
            this.loadCurrentSong();
      }
      ,
      start(){
            //load config
            this.loadConfig();
            this.configIntoApp();

            this.defineProperties();
            this.handleEvents();    
            
            this.loadCurrentSong();

            this.render();
      }

      
}

app.start();
