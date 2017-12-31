var Alexa = require('alexa-sdk');

// Constants
var constants = require('../constants/constants');

// Data
var alexaDevChatPodcasts = require('../data/alexaDevChatPodcasts');


// Audio Players Handlers
var audioPlayerHandlers = Alexa.CreateStateHandler(constants.states.AUDIO_PLAYER, {

  'LaunchRequest': function(){
    this.handler.state = constants.states.MAIN;
    this.emitWithState('LaunchRequest');
  },

  // Main audio player intent - start a podcast
  'PlayPodcast': function (){

    // Get episode slot
    var episodeSlot = parseInt(this.event.request.intent.slots.Episode.value);

    // Play specific episode
    if(episodeSlot > 0 && episodeSlot <= alexaDevChatPodcasts.length){
      // Set audio player session attributes
      this.attributes['currentEpisode'] = episodeSlot;
      this.attributes['offsetInMilliseconds'] = 0;

      // Speech output
      this.response.speak(`Playing episode ${episodeSlot} of the Alexa Dev Chat podcast.`)

      // Audio directive
      this.response.audioPlayerPlay('REPLACE_ALL', alexaDevChatPodcasts[episodeSlot-1].audioURL, episodeSlot, null, 0);

      // Build response and send to Alexa
      this.emit(':responseReady');
    }
    // Invalid episode number
    else if(episodeSlot){
      this.handler.state = constants.states.MAIN;
      this.emit(':tell', `Sorry, there are currently only ${alexaDevChatPodcasts.length}, Alexa Dev Chat podcasts episodes. Tweet Dave Isbitski @ the dave dev to get the next one recorded.`);
    }
    // Play latest episode
    else{
      // Set audio player session attributes
      this.attributes['currentEpisode'] = alexaDevChatPodcasts.length;
      this.attributes['offsetInMilliseconds'] = 0;

      // Speech output
      this.response.speak(`Playing latest episode: ${alexaDevChatPodcasts.length}, of the Alexa Dev Chat podcast.`)

      // Audio directive
      this.response.audioPlayerPlay('REPLACE_ALL', alexaDevChatPodcasts[alexaDevChatPodcasts.length-1].audioURL, alexaDevChatPodcasts.length, null, 0);

      // Build response and send to Alexa
      this.emit(':responseReady');
    }
  },

  // Audio control intents - Intent request handlers
  'AMAZON.PauseIntent': function (){
    this.response.audioPlayerStop();
    this.emit(':responseReady');
  },
  'AMAZON.StopIntent': function (){
    this.response.audioPlayerStop();
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function (){
    this.response.audioPlayerStop();
    this.emit(':responseReady');
  },
  'AMAZON.ResumeIntent': function (){
    // Get audio player session attributes
    var currentEpisode = this.attributes['currentEpisode'];
    var offsetInMilliseconds = this.attributes['offsetInMilliseconds'];

    // Audio directive
    this.response.audioPlayerPlay('REPLACE_ALL', alexaDevChatPodcasts[currentEpisode-1].audioURL, currentEpisode, null, offsetInMilliseconds);

    // Build response and send to Alexa
    this.emit(':responseReady');
  },

  'AMAZON.NextIntent': function (){
    // Get audio player session attributes
    var currentEpisode = this.attributes['currentEpisode'];
    var offsetInMilliseconds = this.attributes['offsetInMilliseconds'];

    // Last episode - Resume playing
    if(currentEpisode === alexaDevChatPodcasts.length){
      // Speech output
      this.response.speak(`Sorry, ${currentEpisode}, episode is the latest episode. Resuming...`)

      // Audio directive
      this.response.audioPlayerPlay('REPLACE_ALL', alexaDevChatPodcasts[currentEpisode-1].audioURL, currentEpisode, null, offsetInMilliseconds);

      // Build response and send to Alexa
      this.emit(':responseReady');
    }
    // Play next episode
    else{
      currentEpisode++;

      // Speech output
      this.response.speak(`Playing episode ${currentEpisode}, of the Alexa Dev Chat podcast.`)

      // Audio directive
      this.response.audioPlayerPlay('REPLACE_ALL', alexaDevChatPodcasts[currentEpisode-1].audioURL, currentEpisode, null, 0);

      // Build response and send to Alexa
      this.emit(':responseReady');
    }
  },

  'AMAZON.PreviousIntent': function (){
    // Get audio player session attributes
    var currentEpisode = this.attributes['currentEpisode'];
    var offsetInMilliseconds = this.attributes['offsetInMilliseconds'];

    // First episode - Resume playing
    if(currentEpisode === 1){
      // Speech output
      this.response.speak(`This is the first episode! Resuming...`)

      // Audio directive
      this.response.audioPlayerPlay('REPLACE_ALL', alexaDevChatPodcasts[currentEpisode-1].audioURL, currentEpisode, null, offsetInMilliseconds);

      // Build response and send to Alexa
      this.emit(':responseReady');
    }
    // Play previous episode
    else{
      currentEpisode--;

      // Speech output
      this.response.speak(`Playing episode ${currentEpisode}, of the Alexa Dev Chat podcast.`)

      // Audio directive
      this.response.audioPlayerPlay('REPLACE_ALL', alexaDevChatPodcasts[currentEpisode-1].audioURL, currentEpisode, null, 0);

      // Build response and send to Alexa
      this.emit(':responseReady');
    }
  },

  'AMAZON.RepeatIntent': function (){
    // Get audio player session attributes
    var currentEpisode = this.attributes['currentEpisode'];

    //Audio directive
    this.response.audioPlayerPlay('REPLACE_ALL', alexaDevChatPodcasts[currentEpisode-1].audioURL, currentEpisode, null, 0);

    // Build response and send to Alexa
    this.emit(':responseReady');
  },

  'AMAZON.StartOverIntent': function (){
    this.emitWithState('AMAZON.RepeatIntent');
  },


  'AMAZON.HelpIntent': function (){
    var audioHelpMessage = 'You are listening to the Alexa Dev Chat Podcast. You can say next or previous to navigate through the podcast. At any time you can say pause to pause the audio and resume to resume';
    this.emit(':ask', audioHelpMessage, audioHelpMessage);
  },

  // Audio event handlers - AudioPlayer request handlers
  'PlaybackStarted': function (){
    this.attributes['currentEpisode'] = parseInt(this.event.request.token);
    this.attributes['offsetInMilliseconds'] = parseInt(this.event.request.offsetInMilliseconds);
    this.emit(':saveState', true);
  },

  'PlaybackFinished': function (){
    // Back to the Main State
    this.handler.state = constants.state.MAIN;
    this.emit(':saveState', true);
  },

  'PlaybackStopped': function (){
    this.attributes['currentEpisode'] = parseInt(this.event.request.token);
    this.attributes['offsetInMilliseconds'] = parseInt(this.event.request.offsetInMilliseconds);
    this.emit(':saveState', true);
  },

  'PlaybackFailed': function (){
    console.log(`Playback failed: `, this.event.request.error);
    this.context.succeed = true;
  },


  // Unhandled Function - Handles Optional Audio Intents Gracefully
  'Unhandled': function (){
    this.emitWithState('AMAZON.HelpIntent');
  }

});

module.exports = audioPlayerHandlers;
