import { Component, OnInit } from '@angular/core';
import {
  NavController,
  LoadingController,
  Platform,
  ToastController
} from '@ionic/angular';
import { DatePipe } from '@angular/common';

import {
  FileTransfer,
  FileTransferObject
} from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-player',
  templateUrl: 'player.page.html',
  styleUrls: ['player.page.scss'],
  providers:[DatePipe]
})

export class PlayerPage implements OnInit {

  data: any;
  next: any;
  prev: any;
  all: any;
  allSongs: any;
  current_index: any;
  songsDetail_next: any;
  songsDetail_index: any;
  songsImage: any;
  title = 'Live All In';
  audioUrl = '';
  filename = 'I_Have_a_Dream.mp3';
  curr_playing_file: MediaObject;
  storageDirectory: any;

  is_playing: boolean = false;
  is_in_play: boolean = false;
  is_ready: boolean = false;
  isLastPlaying: boolean = true;
  isFirstPlaying: boolean = true;

  isRepeat: boolean = false;
  isShuffle: boolean = false;

  message: any;

  duration: any = -1;
  position: any = 0;

  get_duration_interval: any;
  get_position_interval: any;

  constructor(
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private file: File,
    private transfer: FileTransfer,
    private media: Media,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router

  ) {

    //this.data = this.route.snapshot.queryParams['item'];
    this.data = this.route.snapshot.paramMap.get('item');
    this.route.queryParams.subscribe(params => {
      if (params && params.special) {
        this.data = JSON.parse(params.special);
        this.current_index = JSON.parse(params.current_index);
        this.all = JSON.parse(params.all);
        this.next = JSON.parse(params.next);
        this.prev = JSON.parse(params.prev);
      }
    });

    /*this.route.queryParams.subscribe(params => {
      if (params) {
        this.data = JSON.parse(params);
        console.log('======================');
        console.log(this.data);
      }
    });*/

    this.platform.ready().then(() => {
      if (this.platform.is('ios')) {
        this.storageDirectory = this.file.dataDirectory;
      } else if (this.platform.is('android')) {
        this.storageDirectory = this.file.externalDataDirectory;
      } else {
        this.storageDirectory = this.file.cacheDirectory;
      }
    });
  }

  ngOnInit() {


     var allSongs = this.all;          
     var current_index = this.current_index;
     


     var songsDetail = this.data;
     this.songsImage = songsDetail.imageUrl;
     this.title = songsDetail.title;
     this.audioUrl = songsDetail.audioUrl;
     this.prepareAudioFile(this.audioUrl,this.title);

     this.allSongs = allSongs;
     this.current_index = current_index;

      if( current_index === 0){
        this.isFirstPlaying =  false;
      }else{
        this.isFirstPlaying =  true;
      }

      if( current_index === allSongs.length - 1){
        this.isLastPlaying =  false;
      }else{
        this.isLastPlaying =  true;
      }

      
      /*setTimeout(function(){          
          document.getElementById('stopbtn').click();          
      }, 1000);*/
      /*setTimeout(function(){          
          document.getElementById('playbtn').click();          
      }, 3000);*/


  }

  prepareAudioFile(url,title) {

    //let url = 'https://ia800207.us.archive.org/29/items/MLKDream/MLKDream_64kb.mp3';
    //let url = this.audioUrl;
    console.log('hhhhhhhhhhh');
    console.log(url);
    this.filename = title+'.mp3';
    this.platform.ready().then(() => {
      this.file
        .resolveDirectoryUrl(this.storageDirectory)
        .then(resolvedDirectory => {
          // inspired by: https://github.com/ionic-team/ionic-native/issues/1711
          console.log('resolved  directory: ' + resolvedDirectory.nativeURL);
          this.file
            .checkFile(resolvedDirectory.nativeURL, this.filename)
            .then(data => {
              if (data == true) {
                // exist
                this.getDurationAndSetToPlay();
              } else {
                // not sure if File plugin will return false. go to download
                console.log('not found!');
                throw { code: 1, message: 'NOT_FOUND_ERR' };
              }
            })
            .catch(async err => {
              console.log('Error occurred while checking local files:');
              console.log(err);
              if (err.code == 1) {
                // not found! download!
                console.log('not found! download!');
                let loadingEl = await this.loadingCtrl.create({
                  message: 'Downloading the song from the web...'
                });
                loadingEl.present();
                const fileTransfer: FileTransferObject = this.transfer.create();
                fileTransfer
                  .download(url, this.storageDirectory + this.filename)
                  .then(entry => {
                    console.log('download complete' + entry.toURL());
                    loadingEl.dismiss();
                    this.getDurationAndSetToPlay();
                  })
                  .catch(err_2 => {
                    console.log('Download error!');
                    loadingEl.dismiss();
                    console.log(err_2);
                  });
              }
            });
        });
    });
  }

  createAudioFile(pathToDirectory, filename): MediaObject {
    if (this.platform.is('ios')) {
      //ios
      return this.media.create(
        pathToDirectory.replace(/^file:\/\//, '') + '/' + filename
      );
    } else {
      // android
      return this.media.create(pathToDirectory + filename);
    }
  }

  getDurationAndSetToPlay() {
    this.curr_playing_file = this.createAudioFile(
      this.storageDirectory,
      this.filename
    );

    this.curr_playing_file.play();
    this.curr_playing_file.setVolume(0.0); // you don't want users to notice that you are playing the file
    let self = this;
    this.get_duration_interval = setInterval(function() {
      if (self.duration == -1) {
        self.duration = ~~self.curr_playing_file.getDuration(); // make it an integer
      } else {
        self.curr_playing_file.stop();
        self.curr_playing_file.release();
        self.setRecordingToPlay();
        clearInterval(self.get_duration_interval);
      }
    }, 100);
  }

  getAndSetCurrentAudioPosition() {
    let diff = 1;
    let self = this;
    this.get_position_interval = setInterval(function() {
      let last_position = self.position;
      self.curr_playing_file.getCurrentPosition().then(position => {
        if (position >= 0 && position < self.duration) {
          if (Math.abs(last_position - position) >= diff) {
            // set position
            self.curr_playing_file.seekTo(last_position * 1000);
          } else {
            // update position for display
            self.position = position;
          }
        } else if (position >= self.duration) {
          self.stopPlayRecording();
          self.setRecordingToPlay();
        }
      });
    }, 100);
  }

  setRecordingToPlay() {
    console.log('=============================');
    console.log(this.isShuffle);
    this.songsImage = this.songsImage;
    this.title = this.title;
    this.curr_playing_file = this.createAudioFile(
      this.storageDirectory,
      this.filename
    );
    this.curr_playing_file.onStatusUpdate.subscribe(status => {
      // 2: playing
      // 3: pause
      // 4: stop
      this.message = status;
      switch (status) {
        case 1:
          this.is_in_play = false;
          break;
        case 2: // 2: playing
          this.is_in_play = true;
          this.is_playing = true;
          break;
        case 3: // 3: pause
          this.is_in_play = true;
          this.is_playing = false;
          break;
        case 4: // 4: stop
        default:
          this.is_in_play = false;
          this.is_playing = false;
          if(this.isRepeat){
            this.playRecording();            
          }else if(this.isShuffle){            
            var myindex = this.randomNumber(0, this.all.length);            
            this.onNextSongs(this.all,myindex);
            

          }else{
            this.onNextSongs(this.all,this.current_index);
            this.stopPlayRecording();
            /*setTimeout(function(){                         
              //this.playRecording();
              document.getElementById('playbtn').click();
            }, 3000);*/

            
          }

          break;
      }
    });
    console.log('audio file set');
    this.message = 'audio file set';
    this.is_ready = true;
    this.getAndSetCurrentAudioPosition();
  }

  playRecording() {
        
    this.curr_playing_file.play();
    this.toastCtrl
      .create({
        message: `Start playing from ${this.fmtMSS(this.position)}`,
        duration: 2000
      })
      .then(toastEl => toastEl.present());
  }

  pausePlayRecording() {
    this.curr_playing_file.pause();
    this.toastCtrl
      .create({
        message: `Paused at ${this.fmtMSS(this.position)}`,
        duration: 2000
      })
      .then(toastEl => toastEl.present());
  }

  stopPlayRecording() {
    this.curr_playing_file.stop();
    this.curr_playing_file.release();
    clearInterval(this.get_position_interval);
    this.position = 0;
  }

  controlSeconds(action) {
    let step = 15;

    let number = this.position;
    switch (action) {
      case 'back':        
        this.position = number < step ? 0.001 : number - step;
        this.toastCtrl
          .create({
            message: `Went back ${step} seconds`,
            duration: 2000
          })
          .then(toastEl => toastEl.present());
        break;
      case 'forward':
        this.position =
          number + step < this.duration ? number + step : this.duration;
        this.toastCtrl
          .create({
            message: `Went forward ${step} seconds`,
            duration: 2000
          })
          .then(toastEl => toastEl.present());
        break;
      default:
        break;
    }
  }

  fmtMSS(s) {
    return this.datePipe.transform(s * 1000, 'mm:ss');

    /** The following has been replaced with Angular DatePipe */
    // // accepts seconds as Number or String. Returns m:ss
    // return (
    //   (s - // take value s and subtract (will try to convert String to Number)
    //     (s %= 60)) / // the new value of s, now holding the remainder of s divided by 60
    //     // (will also try to convert String to Number)
    //     60 + // and divide the resulting Number by 60
    //   // (can never result in a fractional value = no need for rounding)
    //   // to which we concatenate a String (converts the Number to String)
    //   // who's reference is chosen by the conditional operator:
    //   (9 < s // if    seconds is larger than 9
    //     ? ':' // then  we don't need to prepend a zero
    //     : ':0') + // else  we do need to prepend a zero
    //   s
    // ); // and we add Number s to the string (converting it to String as well)
  }


  onNextSongs(item,index){
    this.duration = -1;
    this.position = 0;
    this.stopPlayRecording();
    console.log('Curent Index = ' + index);
    const current_songs = item[index];
    const index_next = parseInt(index + 1);      
    const next_songs = item[index_next];
    
    var title_s = next_songs.title;
    var audioUrl_s = next_songs.audioUrl;
    this.title = title_s;      
    this.songsImage = next_songs.imageUrl;      
    this.audioUrl = audioUrl_s;


    if( index_next === item.length - 1){
      this.isLastPlaying =  false;
    }else{
      this.isLastPlaying =  true;
    }

    if( index_next === 0){
      this.isFirstPlaying =  false;
    }else{
      this.isFirstPlaying =  true;
    }

    this.current_index = index_next;

    console.log('=================Next Is Disable ==============');
    console.log(index);
    console.log(item.length);
    console.log(this.isLastPlaying);    
    this.prepareAudioFile(audioUrl_s,title_s);


  }

  onPrevSongs(item,index){

    this.duration = -1;
    this.position = 0;
    this.stopPlayRecording();
    console.log('Curent Index = ' + index);
    const current_songs = item[index];
    const index_prev = Number(index - 1);  
    const prev_songs = item[index_prev];
    
    var title_s = prev_songs.title;
    var audioUrl_s = prev_songs.audioUrl;
    this.title = title_s;      
    this.songsImage = prev_songs.imageUrl;      
    this.audioUrl = audioUrl_s;


    if( index_prev === item.length - 1){
      this.isLastPlaying =  false;
    }else{
      this.isLastPlaying =  true;
    }

    if( index_prev === 0){
      this.isFirstPlaying =  false;
    }else{
      this.isFirstPlaying =  true;
    }

    this.current_index = index_prev;

    console.log('=================Prev Is Disable ==============');
    console.log(index);
    console.log(item.length);
    console.log(this.isFirstPlaying);
    
    this.prepareAudioFile(audioUrl_s,title_s);

  }

  onIsRepeat(){
    
    if(this.isRepeat){
      this.isRepeat = false;
    }else{
      this.isRepeat = true;
    }
    console.log('isRepeat');
    console.log(this.isRepeat);
  }


  onIsShuffle(){
    
    if(this.isShuffle){
      this.isShuffle = false;
    }else{
      this.isShuffle = true;
    }
    console.log('isShuffle');
    console.log(this.isShuffle);
  }


  toggleClass(item){
    item = !item;
  }
  toggleShuffle(item){
    item = !item;
  }

  randomNumber(min, max) {  
      min = Math.ceil(min); 
      max = Math.floor(max); 
      return Math.floor(Math.random() * (max - min + 1)) + min; 
  } 


}
