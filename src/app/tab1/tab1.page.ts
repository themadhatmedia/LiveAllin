import { QuoteService } from '../core/services/quote.service';
import { SongStudyService } from '../core/services/songstudy.service';
import { Component, OnInit } from '@angular/core';
import { Quote } from '../core/models/quote.model';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page implements OnInit {

  quote: Quote = new Quote();
  currentDate: string = new Date().toLocaleDateString();

  constructor(
    public quoteService: QuoteService,
    public songStudyService: SongStudyService,
    public alertController: AlertController
  ) {
  }

  ngOnInit() {
    this.getCurrentQuotesFromFirebase();
    this.getCurrentSongStudyQuestion();
  }

  getQuotesFromFirebase(): void {
    const quoteSub = this.quoteService.getAllQuotes().subscribe(apiQuotes => {
      quoteSub.unsubscribe();
    });
  }

  getCurrentQuotesFromFirebase(): void {

    const quoteSub = this.quoteService.getQuoteFromDB(this.currentDate).subscribe(apiQuotes => {

      if (apiQuotes.length < 1) {
        this.quote.Author = "I will praise the name of God with a song.";
        this.quote.Quote = "Music has the power to deeply move our souls.  It connects us with heaven revealing our God-given strength and potential.\n\nIt lifts us to higher purposes and inspires us to greater climbs.  Music can speak for us and to us.  It can express what our lips cannot.\n\nIt is comfort, peace, vision, brilliance, hope, awe and encouragement - in perfect harmony.\n\nSimply put, music brings us to God.\n\nIt is a privilege to share the Live All In journey and music with you.";
        this.quote.Date = "";
      } else {
        if (apiQuotes[0].Author === "") {
            this.quote.Author = "Anonymous";
        } else {
            this.quote.Author = apiQuotes[0].Author;
        }

        this.quote.Quote = apiQuotes[0].Quote;
        this.quote.Date = apiQuotes[0].Date;
      }

      quoteSub.unsubscribe();
    });
  }

  getSongStudyQuestions(): void {
    const songStudySub = this.songStudyService.getAllSongStudy().subscribe(apiSongStudy => {
      songStudySub.unsubscribe();
    });
  }

  getCurrentSongStudyQuestion(): void {
    var dt = new Date();
    var mm = dt.getMonth() + 1;
    var dd = "01";
    var yyyy = dt.getFullYear();
    var firstDate = mm + '/' + dd + '/' + yyyy

    var userEmail = window.localStorage.getItem('userEmail');
    const songStudySub = this.songStudyService.getSpecificSongStudy(firstDate).subscribe(apiSongStudy => {

      apiSongStudy.forEach(res => {
        const isAnswered = this.songStudyService.getUserIsAnswered(res.id, userEmail).subscribe(song=> {
          if(song.length == 0) {
            this.presentAlertPrompt(res.question, res.id);
          }
        });
      });

      songStudySub.unsubscribe();
    });
  }

  /*async presentAlertPrompt(question: string, id: string) {
      const alert = await this.alertController.create({
        header: 'Song Study',
        message: question,
        inputs: [
          {
            name: 'answer',
            type: 'text',
            placeholder: 'Answer'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {

            }
          }, {
            text: 'Submit',
            handler: data => {
              const songStudyAns = this.songStudyService.addSongStudyAnswer(id, question,data.answer);
            }
          }
        ]
      });
      await alert.present();
    }*/

  async presentAlertPrompt(question: string, id: string) {
      const alert = await this.alertController.create({
        header: this.quote.Quote,
        
      });
      await alert.present();
    }

}
