import { HelperService } from './../core/services/helper.service';
import { SubscriptionType } from './../core/models/user.model';
import { AuthService } from './../core/services/auth.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

import { User } from './../core/models/user.model';

@Component({
  selector: 'app-tab4',
  templateUrl: 'journal.page.html',
  styleUrls: ['journal.page.scss']
})

export class JournalPage {

  SubscriptionType = SubscriptionType;
  question1 : any;
  question2 : any;
  question3 : any;
  userEmail : any;

  firstName : any;
  lastName : any;
  planID : any;
  planName : any;
  planType : any;
  signUpDate : any;
  status : any;

  todo = [];
  
  //usersCollection: AngularFirestoreCollection<User>;
  constructor(
    public auth: AuthService,
    public helper: HelperService,
    private router: Router,
    private db: AngularFirestore,
  ) {

    //this.usersCollection = this.db.collection<User>('users');

    console.log('vvvvvvvvvvvvvvvvvvvvvvvvvv');
    console.log(this.auth.user);
    console.log('vvvvvvvvvvvvvvvvvvvvvvvvvv');
    this.question1 = this.auth.user.question1;
    this.question2 = this.auth.user.question2;
    this.question3 = this.auth.user.question3;
    this.userEmail = this.auth.user.email;

    this.firstName = this.auth.user.firstName;
    this.lastName = this.auth.user.lastName;
    this.planID = this.auth.user.planID;
    this.planName = this.auth.user.planName;
    this.planType = this.auth.user.planType;
    this.signUpDate = this.auth.user.signUpDate;
    this.status = this.auth.user.status;


    console.log('============');
    console.log(this.question1);
    console.log('============');
   
  }

  ngOnInit() {
    console.log('Journal page call');    
  }
  
  login(form){
    console.log(form);
    console.log(form.value);
    console.log(this.userEmail);
    const data = {  
      question1:form.value.question1,
      question2:form.value.question2,
      question3:form.value.question3,
    }
    const members = this.db.doc( `users/${this.userEmail}`);
    //members.update(data);

    this.helper.presentLoading('Question saved');
    members.update(data).then((data)=>{
       this.helper.dismissLoading();
    }).catch((err)=>{
      //console.log(err);
    })
      
   
  }




}
