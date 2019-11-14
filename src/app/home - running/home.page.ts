import {Component, ViewChild} from '@angular/core';
import {trigger, state, style, animate, transition } from '@angular/animations';
import {NavController, NavParams, Navbar, Content} from 'ionic-angular';
import {AudioProvider} from './../providers/audio/audio';
import {FormControl} from '@angular/forms';
import {CANPLAY, LOADEDMETADATA, PLAYING, TIMEUPDATE, LOADSTART, RESET} from './../providers/store/store';
import {Store} from '@ngrx/store';
import {CloudProvider} from './../providers/cloud/cloud';
import { DownloadService } from '../core/services/download.service';
import {pluck, filter, map, distinctUntilChanged} from 'rxjs/operators';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  providers:[DatePipe],
  animations: [
    trigger('showHide', [
      state(
        'active',
        style({
          opacity: 1
        })
      ),
      state(
        'inactive',
        style({
          opacity: 0
        })
      ),
      transition('inactive => active', animate('250ms ease-in')),
      transition('active => inactive', animate('250ms ease-out'))
    ])
  ]
})

export class HomePage {
  listItems: any;
  isRepeat:boolean;
  isShuffle:boolean;
  files: any = [];
  seekbar: FormControl = new FormControl("seekbar");
  state: any = {};
  onSeekState: boolean;
  currentFile: any = {};
  displayFooter: string = "inactive";
  loggedIn: Boolean;
  @ViewChild(Navbar) navBar: Navbar;
  @ViewChild(Content) content: Content;

  constructor(
    //public navCtrl: NavController,
    //public navParams: NavParams,
    public audioProvider: AudioProvider,
    //public loadingCtrl: LoadingController,
    public cloudProvider: CloudProvider,
    private store: Store<any>,
    public downloadService: DownloadService,
   
  ) {

    this.getDocuments();
  }

  

  getDocuments() {

    this.downloadService.getDownloadlistSongs().subscribe(apiSongs => {
      this.listItems = apiSongs;
      console.log('Start My list');
      console.log(apiSongs);
      console.log('Start My list');
    });  

    //let loader = this.presentLoading();
    this.cloudProvider.getFiles().subscribe(files => {
      console.log('clode My list');
      console.log(files);
      console.log('clode My list');

      this.files = files;
      //loader.dismiss();
      this.ionViewWillLoad();
    });
  }

  /*presentLoading() {
    let loading = this.loadingCtrl.create({
      content: 'Loading Content. Please Wait...'
    });
    loading.present();
    return loading;
  }*/

  ionViewWillLoad() {
    console.log('called ... ');
    this.store.select('appState').subscribe((value: any) => {
      this.state = value.media;
    });

    // Resize the Content Screen so that Ionic is aware of footer
    this.store
      .select('appState')
      .pipe(pluck('media', 'canplay'), filter(value => value === true))
      .subscribe(() => {
        this.displayFooter = 'active';
        this.content.resize();
      });

    // Updating the Seekbar based on currentTime
    this.store
      .select('appState')
      .pipe(
        pluck('media', 'timeSec'),
        filter(value => value !== undefined),
        map((value: any) => Number.parseInt(value)),
        distinctUntilChanged()
      )
      .subscribe((value: any) => {        
        this.seekbar.setValue(value);
      });
  }

  openFile(file, index) {
    this.currentFile = { index, file };
    this.playStream(file.url);
  }

  resetState() {
    this.audioProvider.stop();
    this.store.dispatch({ type: RESET });
  }

  playStream(url) {
    this.resetState();
    this.audioProvider.playStream(url).subscribe(event => {
      const audioObj = event.target;
      console.log(event.type);
      switch (event.type) {
        case 'canplay':
          return this.store.dispatch({ type: CANPLAY, payload: { value: true } });

        case 'loadedmetadata':
          return this.store.dispatch({
            type: LOADEDMETADATA,
            payload: {
              value: true,
              data: {
                time: this.audioProvider.formatTime(
                  audioObj.duration * 1000,
                  'HH:mm:ss'
                ),
                timeSec: audioObj.duration,
                mediaType: 'mp3'
              }
            }
          });

        case 'playing':
          return this.store.dispatch({ type: PLAYING, payload: { value: true } });

        case 'ended':

          if(this.isRepeat){

            return this.play();

          }else if(this.isShuffle){

            var myindex = this.randomNumber(0, this.files.length);    
            console.log('randon index = '+myindex);
            let index = this.currentFile.myindex;
            let file = this.files[index];
            return this.next();  

          }else{

            return this.next();  
          }

        case 'pause':
          return this.store.dispatch({ type: PLAYING, payload: { value: false } });

        case 'timeupdate':
          return this.store.dispatch({
            type: TIMEUPDATE,
            payload: {
              timeSec: audioObj.currentTime,
              time: this.audioProvider.formatTime(
                audioObj.currentTime * 1000,
                'HH:mm:ss'
              )
            }
          });

        case 'loadstart':
          return this.store.dispatch({ type: LOADSTART, payload: { value: true } });
      }
    });
  }

  pause() {
    this.audioProvider.pause();
  }

  play() {
    this.audioProvider.play();
  }

  stop() {
    this.audioProvider.stop();
  }

  next() {
    let index = this.currentFile.index + 1;
    let file = this.files[index];
    this.openFile(file, index);
  }

  previous() {
    let index = this.currentFile.index - 1;
    let file = this.files[index];
    this.openFile(file, index);
  }

  isFirstPlaying() {
    return this.currentFile.index === 0;
  }

  isLastPlaying() {
    return this.currentFile.index === this.files.length - 1;
  }

  onSeekStart() {
    this.onSeekState = this.state.playing;
    if (this.onSeekState) {
      this.pause();
    }
  }

  onSeekEnd(event) {
    
    console.log(event.target.value);
    if (this.onSeekState) {
      
      this.audioProvider.seekTo(event.target.value);
      this.play();
    } else {
      
      this.audioProvider.seekTo(event.target.value);
    }
  }


  reset() {
    this.resetState();
    this.currentFile = {};
    this.displayFooter = "inactive";
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