var Alexa = require('alexa-sdk');

// Constants
var constants = require('../constants/constants');

// Helpers
var meetupAPI = require('../helpers/meetupAPI');


// Onboarding Handlers
var onboardingStateHandlers = Alexa.CreateStateHandler(constants.states.ONBOARDING, {

  'NewSession': function () {

    //Check for user data in session attributes
    var userName = this.attributes['userName'];

    if(userName){
      // Change state to Main
      this.handler.state = constants.states.MAIN;
      this.emitWithState('LaunchRequest');

    }else{

      // Get access token
      var accessToken = this.event.session.user.accessToken;
            
      //Account linked
      if(accessToken){
        // Get user details from Meetup API
        meetupAPI.GetUserDetails(accessToken)
          .then((userDetails) => {
            // Get user information
            var name = userDetails.name;
            var country = userDetails.country;

            //store information in session
            this.attributes['userName'] = name;
            this.attributes['country'] = country;

            // Change state to Main
            this.handler.state = constants.states.MAIN;

            // Welcome user for the first time
            this.emit(':ask', `Hi, ${name}, welcome to Voice Devs, the skill that gives you information about the Alexa Developer community. You can ask me about the various alexa meetups around the world, or listen to the Alexa Dev Chat podcast. What would you like to do?`, 'What would you like to do?');
          })
          .catch((error) => {
            console.log('MEETUP API ERROR: ', error);
            this.emit(':tell', 'Sorry, there was a problem accessing your meetup account details');
          });
      }
      //Account not linked
      else{
        this.emit(':tellWithLinkAccountCard', 'Please link your account to use this skill. I\'ve sent the details to your Alexa App');
      }

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
    // User name attribute check
    var userName = this.attributes['userName'];

    if(userName){
      this.emit(':ask', `Please tell me what country you're from by saying: I'm from, and then the country you're from.`, `Tell me what country you're from by saying: I'm from, and then the country you're from.`);
    }else{
      this.emit(':ask', `Please tell me your name by saying: my name is, and then your name.`, `Tell me your name by saying: my name is, and then your name.`);
    }
  },

  'Unhandled': function () {
    this.emitWithState('AMAZON.HelpIntent');
  }

});

module.exports = onboardingStateHandlers;
