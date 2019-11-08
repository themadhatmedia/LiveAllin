import { HelperService } from './../core/services/helper.service';
import { SubscriptionType } from './../core/models/user.model';
import { AuthService } from './../core/services/auth.service';
import { Router,NavigationExtras } from '@angular/router';

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { SongType } from './../core/models/song.model';
import { Component, OnInit } from '@angular/core';
import { SongService } from '../core/services/song.service';
import { DownloadService } from '../core/services/download.service';

import { Song,Download } from '../core/models/song.model';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ModalController } from '@ionic/angular';
//import { MusicPlayerComponent } from '../core/components/music-player/music-player.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'download.page.html',
  styleUrls: ['download.page.scss']
})
export class DownloadPage {

  listItems: any;
  download: any;
  reorder_songs: any;
  full_list: any;



  next_songs: any;
  current_songs: any;
  index_next: any;
  index_prev: any;


  audio: any;
  showToggle:boolean = true;


  allSongs: Song[] = [];
  songsToDownload: Song[] = [];
  SubscriptionType = SubscriptionType;

  items: any;
  btnName: any = 'edit';
  flag: any = false;
  constructor(
    public auth: AuthService,
    public helper: HelperService,
    private router: Router,
    private nativeStorage: NativeStorage,
    public songService: SongService,
    public downloadService: DownloadService,
    private db: AngularFirestore,
  ) {

    this.download = this.db.collection('download');
    const pl = this.db.collection('download');

    this.downloadService.getDownloadlistSongs().subscribe(apiSongs => {
      this.listItems = apiSongs;
    });


  }

  ngOnInit() {

    this.getSongsFromDB();
    console.log(this.auth.user.email);
    this.audio = new Audio();
    this.audio.src = 'https://firebasestorage.googleapis.com/v0/b/live-all-in-17081.appspot.com/o/audio%2Fat%20the%20same%20time.mp3?alt=media&token=6c7593d1-9bad-4dee-8e37-dbe5595425be';
    this.audio.load();

  }


  playAudio(mpplay): void {
    console.log('play audio'+mpplay);
     this.stopAudio();
     this.audio.src = mpplay;
     this.audio.pause();
     this.audio.play();
     //this.audio.loop = true;
  }

  stopAudio():void {
    this.audio.pause();
  }

  getSongsFromDB(): void {
    this.nativeStorage.getItem('download').then(dbSongs => {

      console.log('==============Download Page==========');
      console.log(dbSongs);
      this.allSongs = dbSongs;
      this.getSongsFromFirebase();
    }).catch(() => {
      console.log('==============Else==========');
      this.getSongsFromFirebase();
    });
  }

  getSongsFromFirebase(): void {
    
    const songSub = this.downloadService.getDownloadlistSongs().subscribe(apiSongs => {
      console.log(apiSongs);
      console.log('all songs Download');
      //console.log(this.allSongs);
      this.filterSongsByReleaseDate(apiSongs); // All Songs may just be dbSongs
    });
  }

  filterSongsByReleaseDate(songs: Song[]): void {
    this.songsToDownload = songs;
  }

  onClickDetails(item,index){

    const current_songs = item[index];

    const index_next = parseInt(index + 1);
    console.log(index_next);
    const next_songs = item[index_next];

    let prev_songs = index - 1;
    console.log(prev_songs);
    prev_songs = item[prev_songs];

    console.log('current_songs');
    console.log(current_songs);


    console.log('prev_songs');
    console.log(prev_songs);

    console.log('next_songs');
    console.log(next_songs);
    
    
    let navigationExtras: NavigationExtras = {
      queryParams: {
        special: JSON.stringify(current_songs),
        current_index: index,
        all: JSON.stringify(item),
        next: JSON.stringify(next_songs),
        prev: JSON.stringify(prev_songs)
      }
    };
    this.router.navigate(['home'], navigationExtras);
  }

}
