import { HelperService } from './helper.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Song } from '../models/song.model';
import { Playlist } from '../models/song.model';
import { Download } from '../models/song.model';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';

import { AuthService } from '../../core/services/auth.service';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })

export class SongService {
  itemDoc: any;
  songSub: any;
  collectionRef:any;
  song: Blob;
  meta: Observable<any>;
  myPlaylist = [];
  songsCollection: AngularFirestoreCollection<Song>;
  songsCollectionByPlan: AngularFirestoreCollection<Song>;
  songsPP: AngularFirestoreCollection<Playlist>;
  songsDownload: AngularFirestoreCollection<Download>;
  
  isSave: boolean = true;
  constructor(
    private file: File,
    private auth: AuthService,
    private helper: HelperService,
    private transfer: FileTransfer,
    private db: AngularFirestore,
    private nativeStorage: NativeStorage,
    private storage: AngularFireStorage,
    private toastCtrl: ToastController,
  ) {
    this.init();
  }

  private init(): void {

    /*var plan_name = this.auth.user.planName;
    var plan_name = 'Early Bird Annual Plan';
    console.log('Plan Name = ' +  plan_name);*/
    this.songsCollection = this.db.collection<Song>('songs');
    
    /*this.songsCollectionByPlan = this.db.collection<Song>('songs',
      ref => ref.where('plan_name', '==', plan_name));*/



  }

  getSongs(): Observable<Song[]> {

    var plan_name = this.auth.user.planName;
    var plan_name = 'Early Bird Annual Plan';
    console.log('Plan Name' +  plan_name);
    console.log('song services call GetSongs');
    this.songsCollectionByPlan = this.db.collection<Song>('songs',
      ref => ref.where('plan_name', '==', plan_name));
    return this.songsCollectionByPlan.valueChanges();

   
   

  }



  savePlaylistmodal(song: Song, userEmail) {

      console.log(song.title);
      var my_custome_doc = 'pl_'+userEmail; 
      let isSavenew = true;
      this.itemDoc = this.db.doc<Playlist>('playlist/'+my_custome_doc+'');
      this.songSub = this.itemDoc.valueChanges();
      this.songSub.subscribe((res:any)=>{
          
           if(typeof res == "undefined"){
              console.log('No found any playlist songs');

            }else{
              
              this.myPlaylist = res.my_playlist;
              let listofp = res.my_playlist;
              
              listofp.forEach(function(val, key) {
                
                if(val.title == song.title){                      
                    isSavenew = false;
                    return false;
                }

              })


            }

          if(isSavenew == false){
            return false;
          }

      });

      setTimeout(() => {

          if(isSavenew)  {
            
              console.log('need to salve');
              this.helper.presentLoading('Added to Playlist');
              this.myPlaylist.unshift(song);
              var my_custome_doc = 'pl_'+userEmail;          
              this.db.collection("playlist").doc(my_custome_doc).set({        
                  my_playlist: this.myPlaylist
              }).then((data)=>{                
                 this.helper.dismissLoading();
              }).catch((err)=>{
                
              })


          }else{

            this.toastCtrl
            .create({
                message: `Already added`,
                duration: 500
            }).then(toastEl => toastEl.present());
            
          }
               
      }, 2000);
     
      
  }

  saveDownloadmodal(song: Song, userEmail) {

      console.log(userEmail);
      console.log('add to playlist now');
      console.log('Save = ' + userEmail);

      this.songsDownload = this.db.collection<Download>('download',
      ref => ref.where('song_name', '==', song.title));
      const songSub = this.songsDownload.valueChanges();

      songSub.subscribe(apiQuotes => {
        
          if(apiQuotes.length == 0){

              this.helper.presentLoading('Added to Download');
              this.db.collection("download").add({
                userEmail:userEmail,
                userId:"1",
                song:song,
                sortBy:0,
                song_name:song.title
              }).then((data)=>{
                
                 this.helper.dismissLoading();
              }).catch((err)=>{
                
              })

          }else{

            this.toastCtrl
              .create({
                message: `Already download`,
                duration: 500
              }).then(toastEl => toastEl.present());

          }
      });  
      
  }

  reorderSavePlaylist(Reorderlist, userEmail) {
    
      console.log(userEmail);
      console.log('===================================================');
      console.log(Reorderlist);

      var dbthis = this.db;

      Reorderlist.forEach(function(val, key) {
          dbthis.collection("playlist").add({
            userEmail:userEmail,
            userId:"1",
            song:val.song,
            sortBy:key
          }).then((data)=>{
          }).catch((err)=>{
          });
      })
  }

  downloadSongAudio(song: Song): Promise<any> {
    let fileName = song.title.replace(/[^A-Za-z]/g, '');
    fileName += '.mp3';

    console.log(fileName);

    const fileTransfer: FileTransferObject = this.transfer.create();
    // const url = `https://firebasestorage.googleapis.com/v0/b/live-all-in-test.appspot.com/o/audio%2FBe%20Where%20You%20Are.mp3?alt=media&token=819e99ea-0a22-4d56-9f05-c51257d53fae`;
    // this.soundPath = entry.toURL();
    return fileTransfer.download(song.audioUrl, this.file.dataDirectory + fileName);
  }

  downloadSongImage(song: Song): Promise<any> {
    let fileName = song.title.replace(/[^A-Za-z]/g, '');
    fileName += '.svg';

    console.log(fileName);

    const fileTransfer: FileTransferObject = this.transfer.create();
    // const url = `https://firebasestorage.googleapis.com/v0/b/live-all-in-test.appspot.com/o/audio%2FBe%20Where%20You%20Are.mp3?alt=media&token=819e99ea-0a22-4d56-9f05-c51257d53fae`;
    // this.soundPath = entry.toURL();
    return fileTransfer.download(song.imageUrl, this.file.dataDirectory + fileName);
  }

  // Not using right now but should figure out since file transfer plugin is deprecated
  downloadSong(): void {

    //   console.log('in downloadSong');
    //   // const fileTransfer: FileTransferObject = this.transfer.create();

    //   const ref = this.storage.ref(`/audio/2014-12-006-youll-never-run-out-of-love-256k-eng.mp3`);
    //   this.meta = ref.getMetadata();
    //   this.meta.subscribe(res => {
    //     console.log(res);
    //   });

    //   // const httpsReference = this.storage.refFromURL('https://firebasestorage.googleapis.com/b/bucket/o/images%20stars.jpg');
    const url = `https://firebasestorage.googleapis.com/v0/b/live-all-in-test.appspot.com/o/audio%2FBe%20Where%20You%20Are.mp3?alt=media&token=819e99ea-0a22-4d56-9f05-c51257d53fae`;
    console.log(url);
    // This can be downloaded directly:
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = (event) => {
      const blob = xhr.response;
      this.song = xhr.response;
      // console.log('Got Song: ' + this.song);
      console.log(this.song.size);
      console.log(this.song.type);

      const folderPath = this.file.dataDirectory;
      console.log(this.file.dataDirectory);
      this.file.listDir('file:///', folderPath).then((dir: any) => {
        dir.getFile('song.mp3', {create:true}, (file) => {
            file.createWriter((fileWriter) => {
                fileWriter.write(blob);
                fileWriter.onwrite = () => {
                    console.log('File written successfully.');
                }
            }, () => {
                alert('Unable to save file in path '+ folderPath);
            });
        });
    });

      //   window.resolveLocalFileSystemURL(this.file.dataDirectory, (dir) => {
      //     console.log("Access to the directory granted succesfully");
      //     dir.getFile(filename, {create:true}, function(file) {
      //         console.log("File created succesfully.");
      //         file.createWriter(function(fileWriter) {
      //             console.log("Writing content to file");
      //             fileWriter.write(DataBlob);
      //         }, function(){
      //             alert('Unable to save file in path '+ folderpath);
      //         });
      //     });
      // });

      // const reader = new FileReader();
      // reader.onloadend = (event) => {

      //   const base64FileData = reader.result.toString();
      //   console.log('reading file');
      //   console.log(base64FileData);
      //   window.resolveLocalFileSystemURL(this.file.dataDirectory, (d: any) => {
      //     window.resolveLocalFileSystemURL(base64FileData, (fe) => {
      //       fe.copyTo(d, 'song', (e) => {
      //         console.log('success inc opy');
      //         console.dir(e);
      //         this.soundFile = e.nativeURL;
      //         this.soundPath = e.fullPath;
      //         console.debug(this.soundPath);

      //         // Sounds.save($scope.sound).then(function() {
      //         //   $ionicHistory.nextViewOptions({
      //         //       disableBack: true
      //         //   });
      //         //   $state.go("home");
      //         // });

      //       }, function(e) {
      //         console.log('error in coipy');console.dir(e);
      //       });
      //     }, function(e) {
      //       console.log("error in inner bullcrap");
      //       console.dir(e);
      //     });
      //   });
      //   // this.nativeStorage.setItem('song', base64FileData).catch(error => console.error(error));
      //   // console.log(event.target.result);
      //   // var mediaFile = {
      //   //   fileUrl: audioFileUrl,
      //   //   size: blob.size,
      //   //   type: blob.type,
      //   //   src: base64FileData
      //   // };
      // };

      // reader.readAsDataURL(blob);
    };
    xhr.open('GET', url);
    xhr.send();
    console.log('going to download song');
  }

//   downloadSongFileWay(): void {
//     window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, (fs) => {

//       console.log('file system open: ' + fs.name);
//       this.getSampleFile(fs.root);

//     }, (error) => console.log(error));
//   }

//   getSampleFile(dirEntry) {
//   //   // const httpsReference = this.storage.refFromURL('https://firebasestorage.googleapis.com/b/bucket/o/images%20stars.jpg');
//   const url = `https://firebasestorage.googleapis.com/v0/b/live-all-in-test.appspot.com/o/audio%2F2014-12-006-youll-never-run-out-of-love-256k-eng.mp3?alt=media&token=4df61b56-ede0-45b3-abc4-460a4d17cb11`;
//   console.log(url);
//   // This can be downloaded directly:
//   const xhr = new XMLHttpRequest();
//   xhr.responseType = 'blob';
//   xhr.onload = (event) => {
//     const blob = xhr.response;
//     this.song = xhr.response;
//     console.log('Got Song: ' + this.song);
//     console.log(this.song.size);
//     console.log(this.song.type);

//     this.saveFile(dirEntry, blob, 'downloadedSong.mp3');

//   //   window.resolveLocalFileSystemURL(this.file.dataDirectory, (dir) => {
//   //     console.log("Access to the directory granted succesfully");
//   //     dir.getFile(filename, {create:true}, function(file) {
//   //         console.log("File created succesfully.");
//   //         file.createWriter(function(fileWriter) {
//   //             console.log("Writing content to file");
//   //             fileWriter.write(DataBlob);
//   //         }, function(){
//   //             alert('Unable to save file in path '+ folderpath);
//   //         });
//   //     });
//   // });
//     };
//   xhr.open('GET', url);
//   xhr.send();
// }

//   saveFile(dirEntry, fileData, fileName) {

//     dirEntry.getFile(fileName, { create: true, exclusive: false }, (fileEntry) => {

//         this.writeFile(fileEntry, fileData);

//     }, (error) => console.log(error));
//   }

//   writeFile(fileEntry, dataObj) {

//     // Create a FileWriter object for our FileEntry (log.txt).
//     fileEntry.createWriter((fileWriter) => {

//         fileWriter.onwriteend = () => {
//             console.log("Successful file write...");
//             if (dataObj.type == "image/png") {
//                 readBinaryFile(fileEntry);
//             }
//             else {
//                 readFile(fileEntry);
//             }
//         };

//         fileWriter.onerror = function(e) {
//             console.log("Failed file write: " + e.toString());
//         };

//         fileWriter.write(dataObj);
//     });
//   }

//   readBinaryFile(fileEntry) {

//     fileEntry.file(function (file) {
//         var reader = new FileReader();

//         reader.onloadend = function() {

//             console.log("Successful file write: " + this.result);
//             displayFileData(fileEntry.fullPath + ": " + this.result);

//             var blob = new Blob([new Uint8Array(this.result)], { type: "image/png" });
//             displayImage(blob);
//         };

//         reader.readAsArrayBuffer(file);

//     }, onErrorReadFile);
//   }
}
