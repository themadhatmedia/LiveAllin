import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { SongStudy } from '../models/songstudy.model';

@Injectable({
  providedIn: 'root'
})

export class SongStudyService {

  quote: SongStudy = new SongStudy();
  songStudyCollection: AngularFirestoreCollection<SongStudy>;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth
  ) {
    this.songStudyCollection = this.db.collection<SongStudy>('songStudy');
  }

  getAllSongStudy(): Observable<SongStudy[]> {
    return this.songStudyCollection.valueChanges();
  }
  //
  // getQuote(firebaseUser: firebase.Quote): Observable<any> {
  //   const userRef = this.db.collection('quotes').doc(firebaseUser.Quote);
  //   return userRef.get();
  // }

  getSpecificSongStudy(currentDate: string): Observable<SongStudy[]> {
    const quoteQuery = this.db.collection<SongStudy>('songStudy', ref => ref.where('date', '==', currentDate)).valueChanges();
    return quoteQuery;
  }

  addSongStudyAnswer(answer: String) {
      var userEmail = window.localStorage.getItem('userEmail');

      this.db.collection("songStudyAnswer").add({
        userEmail:userEmail,
        answer:answer
      }).then((data)=>{
        console.log(data);
      }).catch((err)=>{
        console.log(err);
      })
  }
}
