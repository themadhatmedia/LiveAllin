import { AuthService } from './../core/services/auth.service';
import { SongType } from './../core/models/song.model';
import { HelperService } from './../core/services/helper.service';
import { Component, OnInit } from '@angular/core';
import { SongService } from '../core/services/song.service';
import { Song } from '../core/models/song.model';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ModalController } from '@ionic/angular';
import { MusicPlayerComponent } from '../core/components/music-player/music-player.component';
import { Router,NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'download.page.html',
  styleUrls: ['download.page.scss']
})

export class DownloadPage implements OnInit {

  allSongs: Song[] = [];
  
  normalSongs: Song[] = [];
  instrumentalSongs: Song[] = [];
  backgroundVocalsSongs: Song[] = [];
  otherSongs: Song[] = [];
  songsToDownload: Song[] = [];

  selectedSong: Song = new Song();

  constructor(
    private auth: AuthService,
    private helper: HelperService,
    private modalCtrl: ModalController,
    private nativeStorage: NativeStorage,
    public songService: SongService,
    private router: Router,
    ) {
  }

  ngOnInit() {
    this.getSongsFromDB();
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

  downloadSong(song: Song, index: number): void {
    this.helper.presentLoading('Downloading Song');
    this.songService.downloadSongAudio(song).then((audioEntry) => {
      song.audioPath = audioEntry.toURL();
      this.songService.downloadSongImage(song).then((imageEntry) => {
        song.imagePath = imageEntry.toURL();
        switch (song.songType) {
          case SongType.Normal:
            this.normalSongs.push(song);
            break;
          case SongType.Instrumental:
            this.instrumentalSongs.push(song);
            break;
          case SongType.BackgroundVocals:
            this.backgroundVocalsSongs.push(song);
            break;
          case SongType.Other:
            this.otherSongs.push(song);
            break;
          default:
            alert('Invalid Song Type');
        }
        this.songsToDownload.splice(index, 1);
        this.saveSongs();
        this.helper.dismissLoading();
      });
    });
  }

  filterSongsByReleaseDate(songs: Song[]): void {
    const currentDate = new Date();
    // If it's a subscription user they only have access to songs since their signup date
    if (this.auth.user.planType === 'subscription') {
      songs = songs.filter(song => new Date(song.releaseDate) > new Date(this.auth.user.signUpDate));
    } else if (this.auth.user.planType === 'charge' && !this.auth.user.planName.includes('Early')) {
      songs = songs.filter(song => new Date(song.releaseDate) > new Date('12/31/18'));
    }
    const filteredSongs = songs.filter(song => new Date(song.releaseDate) < currentDate);
    filteredSongs.forEach(song => {
      if (song.audioPath) {
        switch (song.songType) {
          case SongType.Normal:
            this.normalSongs.push(song);
            break;
          case SongType.Instrumental:
            this.instrumentalSongs.push(song);
            break;
          case SongType.BackgroundVocals:
            this.backgroundVocalsSongs.push(song);
            break;
          case SongType.Other:
            this.otherSongs.push(song);
            break;
          default:
            alert('Invalid Song Type');
        }
      } else {
        this.songsToDownload.push(song);
      }
    });
    this.sortSongs();
  }

  getSongsFromDB(): void {
    this.nativeStorage.getItem('songs').then(dbSongs => {
      this.allSongs = dbSongs;
      this.getSongsFromFirebase();
    }).catch(() => {
      this.getSongsFromFirebase();
    });
  }

  getSongsFromFirebase(): void {
    console.log('get songs');
    const songSub = this.songService.getSongs().subscribe(apiSongs => {
      console.log(apiSongs);
      this.addNewSongs(apiSongs);
      console.log(this.allSongs);
      this.filterSongsByReleaseDate(this.allSongs); // All Songs may just be dbSongs
      songSub.unsubscribe();
    });
  }

  selectSong(item,index){
      
      console.log(item);
      item.push({'song':item});
      console.log(item);

      const c_current = item[index];

      var song = [];
      song.push({'song':c_current});
      console.log('songvar');
      console.log(song);

      item = song[0];
      console.log('=======item====');
      console.log(item);
      const index_next = parseInt(index + 1);
      console.log(index_next);
      const next_songs = item[index_next];

      const current_songs = song[0];

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

/*  async selectSong(songs: Song[], selectedIndex: number) {
    const modal = await this.modalCtrl.create({
      component: MusicPlayerComponent,
      componentProps: {
        'songs': songs,
        'activeIndex': selectedIndex
      }
    });
    modal.onDidDismiss().then(() => {
      this.selectedSong = new Song();
    });
    return await modal.present();
  }*/

  private addNewSongs(apiSongs: Song[]): void {
    let addedSong = false;
    apiSongs.forEach(apiSong => {
      let foundSong = false;
      for (let i = 0; i < this.allSongs.length; i++) {
        const song = this.allSongs[i];
        if (apiSong.title === song.title) {
          foundSong = true;
          break;
        }
      }
      if (!foundSong) {
        addedSong = true;
        this.allSongs.push(apiSong);
      }
    });
    if (addedSong) {
      this.nativeStorage.setItem('songs', this.allSongs);
    }
  }

  private saveSongs(): void {
    const allSongs = this.normalSongs.concat(
      this.instrumentalSongs.concat(this.backgroundVocalsSongs.concat(this.otherSongs.concat(this.songsToDownload)))
    );
    this.nativeStorage.setItem('songs', allSongs);
  }

  private sortSongs(): void {
    this.normalSongs.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
    this.instrumentalSongs.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
    this.songsToDownload.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
    this.backgroundVocalsSongs.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
    this.otherSongs.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
  }
}
