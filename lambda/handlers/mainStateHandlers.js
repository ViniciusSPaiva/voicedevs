var Alexa = require('alexa-sdk');

// Constants
var constants = require('../constants/constants');

// Data
var alexaMeetups = require('../data/alexaMeetups');

//Helpers
var convertArrayToReadableString = require('../helpers/convertArrayToReadableString')
var meetupAPI = require('../helpers/meetupAPI');
var checkMeetupCity = require('../helpers/checkMeetupCity');
var getNewYorkAudio = require('../helpers/getNewYorkAudio');
var alexaDateUtil = require('../helpers/alexaDateUtil');

var number = 1;

// Main Handlers
var mainStateHandlers = Alexa.CreateStateHandler(constants.states.MAIN,{

  'LaunchRequest': function () {
    //Check for user data in session attributes
    var userName = this.attributes['userName'];

    if(userName){
      //Welcome user back by name
      this.emit(':ask', `Welcome back, ${userName}. You can ask me about the various alexa meetups around the world or listen to the Alexa Dev Chat podcast`, 'What would you like to do?');
    }else{
      this.handler.state = constants.states.ONBOARDING;
      this.emitWithState('NewSession');
    }
  },

  'PlayPodcast': function (){
    // Change the state to AudioPlayer
    this.handler.state = constants.states.AUDIO_PLAYER;
    this.emitWithState('PlayPodcast');
  },

  'AlexaMeetupNumbers': function () {
    var meetupNumbers = alexaMeetups.length;
    this.emit(':ask',
    `I currently know of ${meetupNumbers} Alexa Developer meetups. Check to see if your city is one of them.`,
    'How can I help?');
  },

  'AlexaMeetupCityCheck': function () {
    //get slot values
    var USCitySlot = this.event.request.intent.slots.USCity.value;
    var EuropeanCitySlot = this.event.request.intent.slots.EuropeanCity.value;

    var cityMatch = checkMeetupCity(USCitySlot, EuropeanCitySlot);

    //Respond to User
    if(cityMatch){
      this.emit(':ask',
      `${getNewYorkAudio(cityMatch.city)} Yes! ${cityMatch.city} has an Alexa developer meetup.`,
      'How can I help?');
    }else{
      this.emit(':ask',
      `Sorry, looks like ${(USCitySlot || EuropeanCitySlot)} doesn't have an Alexa developer meetup yet - Why don't you start one?`,
      'How can I help?');
    }


  },

  'AlexaMeetupOrganiserCheck': function () {
    //get slot values
    var USCitySlot = this.event.request.intent.slots.USCity.value;
    var EuropeanCitySlot = this.event.request.intent.slots.EuropeanCity.value;

    var cityMatch = checkMeetupCity(USCitySlot, EuropeanCitySlot);

    //Respond to User
    if(cityMatch){

      // Get access token from Alexa Request
      var accessToken = this.event.session.user.accessToken;
      if(accessToken){

        // get meetup group details from the API
        meetupAPI.GetMeetupGroupDetails(accessToken, cityMatch.meetupURL)
        .then((meetupDetails) => {
          var organiser = meetupDetails.organizer;

          if(organiser){
            // Get organiser name
            var organiserName = organiser.name;

            var cardTitle = `${organiserName}`;
            var cardContent = `The organiser of the ${cityMatch.city} Alexa developer meetup is ${organiserName}!`;
            var imageObj = {
            	smallImageUrl: `${meetupDetails.organizer.photo.photo_link}`,
            	largeImageUrl: `${meetupDetails.organizer.photo.photo_link}`
            };

            var imageObj2 = {
            	smallImageUrl: `https://pbs.twimg.com/media/C25OPmwWEAArnOZ.jpg`,
            	largeImageUrl: `https://pbs.twimg.com/media/C25OPmwWEAArnOZ.jpg`
            };

            // Respond to the user
            this.emit(':askWithCard',
            `${getNewYorkAudio(cityMatch.city)} The organiser of the ${cityMatch.city} Alexa developer meetup is ${organiserName}.`,
            'How can I help?', cardTitle, cardContent, imageObj2);
          }else{
            // There is no organiser
            this.emit(':ask',
            `${getNewYorkAudio(cityMatch.city)} This meetup has no organiser. How weird.`, `How can I help?`);
          }
        })
        .catch((error) => {
          console.log('MEETUP API ERROR: ', error);
          this.emit(':tell', 'Sorry, there was a problem accessing your meetup account details');
        });
      }
      // Account not linked
      else{
        this.emit(':tellWithLinkAccountCard', 'Please link your account to use this skill. I\'ve sent the details to your Alexa App');
      }
    }else{
      this.emit(':ask',
      `Sorry, looks like ${(USCitySlot || EuropeanCitySlot)} doesn't have an Alexa developer meetup yet - Why don't you start one?`,
      'How can I help?');
    }

  },

  'AlexaMeetupMembersCheck': function () {
    // Get Slot Values
    var USCitySlot = this.event.request.intent.slots.USCity.value;
    var EuropeanCitySlot = this.event.request.intent.slots.EuropeanCity.value;

    // Check City Match
    var cityMatch = checkMeetupCity(USCitySlot, EuropeanCitySlot);

    // Respond to User
    if (cityMatch) {

      // Get Access Token from Alexa Request
      var accessToken = this.event.session.user.accessToken;

      // Account Linked
      if (accessToken) {

        // Get Meetup Group Details from API
        meetupAPI.GetMeetupGroupDetails(accessToken, cityMatch.meetupURL)
          .then((meetupDetails) => {

            // Get Number of Meetup Members
            var meetupMembers = meetupDetails.members;

            // Respond to User
            this.emit(':ask', `${getNewYorkAudio(cityMatch.city)} The ${cityMatch.city} Alexa developer meetup currently has ${meetupMembers} members - Nice! How else can i help you?`, 'How can i help?');
          })
          .catch((error) => {
            console.log("MEETUP API ERROR: ", error);
            this.emit(':tell', 'Sorry, there was a problem accessing your meetup account details.');
          });
      }
      // Account Not Linked
      else {
        this.emit(':tellWithLinkAccountCard', 'Please link your account to use this skil. I\'ve sent the details to your alexa app.');
      }
    }
    else {
      this.emit(':ask', `Sorry, looks like ${(USCitySlot || EuropeanCitySlot)} doesn't have an Alexa developer meetup yet - why don't you start one?`, 'How can i help?');
    }
  },

  'AlexaNextMeetupCheck': function () {
    // Get Slot Values
    var USCitySlot = this.event.request.intent.slots.USCity.value;
    var EuropeanCitySlot = this.event.request.intent.slots.EuropeanCity.value;

    // Check City Match
    var cityMatch = checkMeetupCity(USCitySlot, EuropeanCitySlot);

    // Respond to User
    if (cityMatch) {

      // Get Access Token from Alexa Request
      var accessToken = this.event.session.user.accessToken;

      // Account Linked
      if (accessToken) {

        // Get Meetup Group Details from API
        meetupAPI.GetMeetupGroupDetails(accessToken, cityMatch.meetupURL)
          .then((meetupDetails) => {

            // Get Next Event
            var nextEvent = meetupDetails.next_event;

            if (nextEvent) {
              var nextEventDate = new Date(nextEvent.time);

              // Respond to User
              this.emit(':ask', `${getNewYorkAudio(cityMatch.city)} The next ${cityMatch.city} Alexa developer meetup is on ${alexaDateUtil.getFormattedDate(nextEventDate)} at ${alexaDateUtil.getFormattedTime(nextEventDate)}! Currently ${nextEvent.yes_rsvp_count} members have RSVP'd. How else can i help you?`, 'How can i help?');
            }
            else {
              this.emit(':ask', `${getNewYorkAudio(cityMatch.city)} There's currently no upcoming meetups in ${cityMatch.city}. You should chase the organiser, ${meetupDetails.organizer ? meetupDetails.organizer.name : 'Unknown'} to schedule one!. How else can i help you?`, 'How else can i help?');
            }

          })
          .catch((error) => {
            console.log("MEETUP API ERROR: ", error);
            this.emit(':tell', 'Sorry, there was a problem accessing your meetup account details.');
          });
      }
      // Account Not Linked
      else {
        this.emit(':tellWithLinkAccountCard', 'Please link your account to use this skil. I\'ve sent the details to your alexa app.');
      }
    }
    else {
      this.emit(':ask', `Sorry, looks like ${(USCitySlot || EuropeanCitySlot)} doesn't have an Alexa developer meetup yet - why don't you start one?`, 'How can i help?');
    }
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', 'Bye bye!');
  },

  //State automatically saved with :tell
  'AMAZON.CancelIntent': function () {
    this.emit(':tell', 'Cancelling...');
  },

  'SessionEndedRequest': function () {
    //Force state to save when the user times out
    this.emit(':saveState', true);
  },

  'AMAZON.HelpIntent': function () {
    //State automatically saved with :tell
    this.emit(':ask', `You can ask me about the various alexa meetups around the world or listen to the Alexa Dev Chat podcast`, 'What would you like to do?');
  },

  'Unhandled': function () {
    this.emit(':ask', `This is unhandled. I don't know what to do.`, 'What would you like to do?');
    //this.emitWithState('AMAZON.HelpIntent');
  },

  'Hello': function () {
    var userName = this.attributes['userName'];
    this.emit(':ask', `Hello ${userName}! The number is ${number++}`, 'Anyone there?');
  },

  'SayMyName': function(){
    var userName = this.attributes['userName'];
    this.emit(':ask', `Your name is ${userName}!`, 'What would you like to do?');
  },

  'DidNotUnderstand': function () {
    this.emit(':ask', 'I did not understand you. Please, try again.', 'Please, try again.');
  }

});

module.exports = mainStateHandlers;
