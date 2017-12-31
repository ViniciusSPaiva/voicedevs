var constants = Object.freeze({

  // App ID TODO: set your APP ID
  appId: '',

  // DynamoDB Table name
  dynamoDBTableName: 'VoiceDevsUsers',

  // Skill states
  states:{
    ONBOARDING: '',
    MAIN: '_MAIN',
    AUDIO_PLAYER: '_AUDIO_PLAYER'
  }

});

module.exports = constants;
