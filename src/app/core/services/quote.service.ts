import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Quote } from '../models/quote.model';

@Injectable({
  providedIn: 'root'
})

export class QuoteService {

  quote: Quote = new Quote();
  quoteCollection: AngularFirestoreCollection<Quote>;

  constructor(
    private db: AngularFirestore
  ) {
    this.quoteCollection = this.db.collection<Quote>('quotes');
  }

  getAllQuotes(): Observable<Quote[]> {
    return this.quoteCollection.valueChanges();
  }
  //
  // getQuote(firebaseUser: firebase.Quote): Observable<any> {
  //   const userRef = this.db.collection('quotes').doc(firebaseUser.Quote);
  //   return userRef.get();
  // }

  getQuoteFromDB(currentDate: string): Observable<Quote[]> {
    const quoteQuery = this.db.collection<Quote>('quotes', ref => ref.where('Date', '==', currentDate)).valueChanges();
    return quoteQuery;
  }
}
