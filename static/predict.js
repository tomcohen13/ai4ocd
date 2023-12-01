// Send ongoing images and receive predictions from Azure Prediction API
const apiEndpoint = 'https://eastus.api.cognitive.microsoft.com/customvision/v3.0/Prediction/2b49bf5d-5af3-4b95-a0f2-930148518a7d/detect/iterations/Iteration3/image';
const predictionKey = '7824460ed88e41e1b071037787a729ae'

export async function sendImageToModel(image) {
    /* 
    The function sends a frame captured by User's camera
    to the model's API and returns the response in JSON-like format
    */
    const requestOptions = {
        method: 'POST',
        headers: {
            'Prediction-Key': predictionKey,
            'Content-Type': 'application/octet-stream',
        },
        body: dataURItoBlob(image),
    };

    try {
        const response = await fetch(apiEndpoint, requestOptions);

        if (response.ok) {
            const result = await response.json();
            const predictions = result.predictions;

            if (Array.isArray(predictions) && predictions.length > 0) {
                return getHighestProbabilityTagName(predictions);
            } 
            else {
                throw new Error('No valid predictions found in the response.');
            }

        } 
        else {
            throw new Error(`Failed to send image. Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error sending image to model:', error);
        throw error;
    }
  }


// Convert data URI to Blob
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
  
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
  
    return new Blob([ab], { type: mimeString });
  }


// extract the dominant label from all region-based predictions made by the model
function getHighestProbabilityTagName(predictions) {
    // Find the prediction with the highest probability
    const highestProbabilityPrediction = predictions.reduce(
      (maxPrediction, currentPrediction) =>
        currentPrediction.probability > maxPrediction.probability ? currentPrediction : maxPrediction,
      predictions[0]
    );
    console.log(highestProbabilityPrediction);
    // Return the 'tagName' of the prediction with the highest probability
    return highestProbabilityPrediction.tagName;
  }