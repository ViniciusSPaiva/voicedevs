var constants = Object.freeze({

  // App ID TODO: set your APP ID
  appId: '',

  // DynamoDB Table name
  dynamoDBTableName: 'VoiceDevsUsers',

  // Skill states
  states:{
    ONBOARDING: '',
    MAIN: '_MAIN'
  }

});

module.exports = constants;
