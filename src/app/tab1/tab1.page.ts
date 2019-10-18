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
    console.log('get quotes');
    const quoteSub = this.quoteService.getAllQuotes().subscribe(apiQuotes => {
      console.log(apiQuotes);

      quoteSub.unsubscribe();
    });
  }

  getCurrentQuotesFromFirebase(): void {
    console.log('get current quotes');
    const quoteSub = this.quoteService.getQuoteFromDB(this.currentDate).subscribe(apiQuotes => {
      console.log(apiQuotes);
      console.log(this.currentDate);

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
    console.log('get qustions');
    const songStudySub = this.songStudyService.getAllSongStudy().subscribe(apiSongStudy => {
      console.log(apiSongStudy);

      songStudySub.unsubscribe();
    });
  }

  getCurrentSongStudyQuestion(): void {
    console.log('get current questions');
    const songStudySub = this.songStudyService.getSpecificSongStudy(this.currentDate).subscribe(apiSongStudy => {
      console.log(apiSongStudy);
      console.log(this.currentDate);

      apiSongStudy.forEach(res => {
        console.log(res.question);
        console.log(res.date);

        this.presentAlertPrompt(res.question);
      });

      songStudySub.unsubscribe();
    });
  }

  async presentAlertPrompt(question: string) {
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
              console.log('Confirm Cancel');
            }
          }, {
            text: 'Submit',
            handler: data => {
              console.log(data.answer);
            }
          }
        ]
      });

      await alert.present();
    }
}
