import { AuthService } from './../core/services/auth.service';
import { SongType } from './../core/models/song.model';
import { HelperService } from './../core/services/helper.service';
import { Component, OnInit } from '@angular/core';
import { SongService } from '../core/services/song.service';
import { Song } from '../core/models/song.model';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ModalController } from '@ionic/angular';
import { MusicPlayerComponent } from '../core/components/music-player/music-player.component';

@Component({
  selector: 'app-tab5',
  templateUrl: 'playlist.page.html',
  styleUrls: ['playlist.page.scss']
})

export class PlaylistPage implements OnInit {

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
    public songService: SongService
    ) {
  }

  ngOnInit() {
    this.getSongsFromDB();
    //this.getSongsFromFirebase();
  }

  toggleReorder(): void {
  
      const reorderGroup = document.getElementById('reorder');
      reorderGroup.disabled = !reorderGroup.disabled;
      reorderGroup.addEventListener('ionItemReorder', ({detail}) => {
        detail.complete(true);
      });
      
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
      
    this.songsToDownload = songs;
    
  }


  reorderItems(indexes){
    console.log(indexes);
    
    this.songService.updatePlaylistOrder(index);

  };

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
    console.log('--call-- Playlist page ');
    console.log('get playlist songs');
    const songSub = this.songService.getPlaylistSongs().subscribe(apiSongs => {
      console.log(apiSongs);      
      console.log('all songs playlist');
      console.log(this.allSongs);
      this.filterSongsByReleaseDate(apiSongs); // All Songs may just be dbSongs
      
    });
  }

  async selectSong(songs: Song[], selectedIndex: number) {
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
