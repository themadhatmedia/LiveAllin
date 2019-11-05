export class User {
  constructor(
    public email: string = '',
    public firstName: string = '',
    public lastName: string = '',
    public planID: string = '',
    public planName: string = '',
    public planType: string = '',
    public signUpDate: string = '',
    public status: string = '',
    public question1: string = '',
    public question2: string = '',
    public question3: string = '',
    // public type: UserType = null,
    // public uid: string = ''
  ) {}
}

  export enum SubscriptionType {
    Annual = 0,
    Monthly = 1,
  }
