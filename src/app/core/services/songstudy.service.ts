import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { SongStudy } from '../models/songstudy.model';

@Injectable({
  providedIn: 'root'
})

export class SongStudyService {

  quote: SongStudy = new SongStudy();
  songStudyCollection: AngularFirestoreCollection<SongStudy>;

  constructor(
    private db: AngularFirestore
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
}
