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
import { MusicPlayerComponent } from '../core/components/music-player/music-player.component'; 

@Component({
  selector: 'app-tab5',
  templateUrl: 'playlist.page.html',
  styleUrls: ['playlist.page.scss']
})

export class PlaylistPage {

  listItems: any;
  playlist: any;
  reorder_songs: any;

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
      
    this.playlistService.getPlaylistSongs().subscribe(apiSongs => {           
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

  onRenderItems(event) {
    console.log(event);
    console.log(`Moving item from ${event.detail.from} to ${event.detail.to}`);
    let draggedItem = this.listItems.splice(event.detail.from,1)[0];
    this.listItems.splice(event.detail.to,0,draggedItem)
    //this.listItems = reorderArray(this.listItems, event.detail.from, event.detail.to);
    event.detail.complete();
  }
 
  getList() {

    let myReorderData = this.listItems;
    var userEmail = this.auth.user.email;
    // first delete old playlist
    const deletlist = this.db.collection('playlist', ref => ref.where('userEmail', '==', userEmail))
    deletlist.get().subscribe(delitems => delitems.forEach( doc=> doc.ref.delete()));

    // Reorder  playlist
     if(userEmail == ''){
        var userEmail = window.localStorage.getItem('userEmail');
      } 
    setTimeout( () => {       
        this.songService.savePlaylistmodalOrder(myReorderData,userEmail);
    }, 2200);

    

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
      
      console.log(dbSongs);
      this.allSongs = dbSongs;
      this.getSongsFromFirebase();
    }).catch(() => {
      this.getSongsFromFirebase();
    });
  }

  getSongsFromFirebase(): void {
    console.log('get playlist songs');
    const songSub = this.playlistService.getPlaylistSongs().subscribe(apiSongs => {
      console.log(apiSongs);      
      console.log('all songs playlist');
      console.log(this.allSongs);
      this.filterSongsByReleaseDate(apiSongs); // All Songs may just be dbSongs      
    });
  }

  filterSongsByReleaseDate(songs: Song[]): void {      
    this.songsToDownload = songs;    
  }

   onClickDetails(item){

      let navigationExtras: NavigationExtras = {
        queryParams: {
          special: JSON.stringify(item)
        }
      };
      this.router.navigate(['home'], navigationExtras);

      /*console.log(item);
      this.router.navigate(['home',{item:item}])*/
    }
  
}
