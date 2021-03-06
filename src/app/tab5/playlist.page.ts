import { HelperService } from './../core/services/helper.service';
import { SubscriptionType } from './../core/models/user.model';
import { AuthService } from './../core/services/auth.service';
import { Router,NavigationExtras } from '@angular/router';

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { SongType } from './../core/models/song.model';
import { Component, OnInit } from '@angular/core';
import { SongService } from '../core/services/song.service';
import { PlaylistService } from '../core/services/playlist.service';
import { Song } from '../core/models/song.model';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ModalController } from '@ionic/angular';
//import { MusicPlayerComponent } from '../core/components/music-player/music-player.component';



@Component({
  selector: 'app-tab5',
  templateUrl: 'playlist.page.html',
  styleUrls: ['playlist.page.scss']
})

export class PlaylistPage {

  listItems: any;
  playlist: any;
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
    public playlistService: PlaylistService,
    private db: AngularFirestore,
  ) {


    /*this.listItems = [
      "1. Aylin Roberts",
      "2. Autumn Kuhic",
      "3. Tiffany Windler",
      "4. Sheila Bauch",
      "5. Diana Gerhold",
      "6. Arielle Kuhn"
    ];*/

    //var userEmail = this.auth.user.email;
    /*this.listItems = this.db.collection('playlist',
      ref => ref.where('userEmail', '==', userEmail).orderBy('sortBy', 'asc')).get();*/
    this.playlist = this.db.collection('playlist');
    const pl = this.db.collection('playlist');

    this.listItems = this.playlistService.getPlaylistSongs().subscribe((apiSongs:any) => {
      
      if(typeof apiSongs == "undefined"){
        console.log('No found any playlist songs');
      }else{
        this.listItems = apiSongs.my_playlist;
        console.log('vvvvvvvvvvv');
      }

    });


  }

  ngOnInit() {

    this.getSongsFromDB();
    console.log(this.auth.user.email);

    this.audio = new Audio();
    this.audio.src = 'https://firebasestorage.googleapis.com/v0/b/live-all-in-17081.appspot.com/o/audio%2Fat%20the%20same%20time.mp3?alt=media&token=6c7593d1-9bad-4dee-8e37-dbe5595425be';
    this.audio.load();

  }

  onRenderItems(event) {
    console.log(event);
    console.log(`Moving item from ${event.detail.from} to ${event.detail.to}`);
    let draggedItem = this.listItems.splice(event.detail.from,1)[0];
    this.listItems.splice(event.detail.to,0,draggedItem)
    //this.listItems = reorderArray(this.listItems, event.detail.from, event.detail.to);
    event.detail.complete();
  }

  getListOrder() {
    

    let myReorderData = this.listItems;
    var userEmail = this.auth.user.email;
    
    var my_custome_doc = 'pl_'+userEmail;
    
    this.db.collection("playlist").doc(my_custome_doc).set({        
        my_playlist: myReorderData
    })





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



/*  ngOnDestroy() {
    if(this.audio) {
      this.audio.pause();
      this.audio = null;
    }*/


  /*toggleReorder(): void {

      const reorderGroup = document.getElementById('reorder');
      reorderGroup.disabled = !reorderGroup.disabled;
      reorderGroup.addEventListener('ionItemReorder', ({detail}) => {
        detail.complete(true);
      });

  }*/

  getSongsFromDB(): void {

    this.nativeStorage.getItem('playlist').then(dbSongs => {
      console.log('=========play list page ==================');
      console.log(dbSongs);
      this.allSongs = dbSongs;
      this.getSongsFromFirebase();
    }).catch(() => {
      console.log('=========Else ==================');
      this.getSongsFromFirebase();
    });
  }

  getSongsFromFirebase(): void {
    
    const songSub = this.playlistService.getPlaylistSongs().subscribe((apiSongs:any) => {
      console.log('all songs playlist');
      console.log(this.allSongs);

      if(typeof apiSongs == "undefined"){
        console.log('No');
      }else{        
        this.filterSongsByReleaseDate(apiSongs.my_playlist); // All Songs may just be dbSongs        
      }
    });
  }

  filterSongsByReleaseDate(songs: Song[]): void {
    console.log('======================================================================');
    console.log(songs);
    this.songsToDownload = songs;
  }

   /*onClickDetails(item){

      let navigationExtras: NavigationExtras = {
        queryParams: {
          special: JSON.stringify(item)
        }
      };
      this.router.navigate(['home'], navigationExtras);

      //console.log(item);
      //this.router.navigate(['home',{item:item}])
    }*/

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


    onClickDetailsPlayer(item,index){

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
      this.router.navigate(['listhome'], navigationExtras);
    }

}
