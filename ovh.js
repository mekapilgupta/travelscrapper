const axios = require('axios');

// Replace with your actual token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzMyNzk3NDM4LCJpYXQiOjE3MzIxOTI2MzgsInN1YiI6IjM2YmMzNDM0LWFlNzgtNDE5ZS1hZTBlLWUzODRjOTYwMzBhNSIsImVtYWlsIjoicXdlcnR5c2FtODdAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJnZW5lcmljMSIsInByb3ZpZGVycyI6WyJnZW5lcmljMSJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6InF3ZXJ0eXNhbTg3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL3d3dy5vdmguY29tL2F1dGgvb2F1dGgyL3VzZXIiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6ImdrMTY3OTgxLW92aCJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im9hdXRoIiwidGltZXN0YW1wIjoxNzMyMTkyNjM4fV0sInNlc3Npb25faWQiOiJhYjA3YmQ3Zi1hYTE0LTQ1YTMtYjkyZi0zZjgzODZlZTEyNmMifQ.3vVzNcTKKq6QBFgMkG6K9vYdCZ90qYC6O5682Qc2i2Y';

const url = "https://llama-3-1-70b-instruct.endpoints.kepler.ai.cloud.ovh.net/api/openai_compat/v1/chat/completions";
const payload = {
    max_tokens: 512,
    messages: [
        {
            content: "Explain gravity for a 6 years old",
            name: "User",
            role: "user"
        }
    ],
    model: "Meta-Llama-3-70B-Instruct",
    temperature: 0,
};

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
};

axios.post(url, payload, { headers })
    .then(response => {
        if (response.status === 200) {
            // Handle response
            const choices = response.data.choices;
            choices.forEach(choice => {
                const text = choice.message.content;
                // Process text
                console.log(text);
            });
        }
    })
    .catch(error => {
        console.error('Error:', error.response ? error.response.data : error.message);
    });
