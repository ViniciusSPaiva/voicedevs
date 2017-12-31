module.exports = function getLondonAudio(city) {

  var londonAudio = ``;
  if (city.toLowerCase() === 'new york') {
    londonAudio = `<audio src="https://s3-sa-east-1.amazonaws.com/alexa-voice-devs/New+-+York+crop.mp3"/>`;
  }

  return londonAudio;
};
