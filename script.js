// Wait until the DOM content is fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    // Get references to the DOM elements that will be interacted with
    const youtubeUrlInput = document.getElementById('youtube-url');
    const outputLabel = document.getElementById('output-label');
    const outputUrlBox = document.getElementById('output-url-box');
    const generateButton = document.getElementById('generate-btn');
    const autoplayCheckbox = document.getElementById('autoplay');
    const relatedVideosCheckbox = document.getElementById('related-videos');
    const copyBtn = document.getElementById('copy-btn');

    // Add an event listener to the 'Generate Full Screen' button
    generateButton.addEventListener('click', () => {
        // Clear out the output label and URL box, and hide them initially
        outputLabel.textContent = '';
        outputUrlBox.textContent = '';
        outputUrlBox.style.display = 'none';
        copyBtn.style.display = 'none';

        // Capture the YouTube URL entered by the user
        const url = youtubeUrlInput.value;

        try {
            // Validate the URL; if it's not valid, throw an error
            if (!url || !isValidHttpUrl(url)) {
                throw new Error('Please enter a valid YouTube URL.');
            }

            // Generate the full screen URL using the provided YouTube URL and checkbox states
            const newEmbedUrl = extractAndBuildNewUrl(
              url,
              autoplayCheckbox.checked,
              relatedVideosCheckbox.checked
            );

            // Display the generated full screen URL and make output elements visible
            outputLabel.textContent = 'Full Screen URL:';
            outputUrlBox.textContent = newEmbedUrl;
            outputUrlBox.style.display = 'inline-block';
            copyBtn.style.display = 'inline-block';
        } catch (error) {
            // If an error occurs, display the error message to the user
            outputLabel.textContent = error.message;
        }
    });

    // Add an event listener to the copy button
    copyBtn.addEventListener('click', () => {
        // If there is text in the output URL box, copy it to the clipboard
        if (outputUrlBox.textContent) {
            navigator.clipboard.writeText(outputUrlBox.textContent)
                .then(() => {
                    // If copying is successful, change the icon to a 'copied' checkmark
                    copyBtn.innerHTML = '<img src="img/copied-icon-checkmark.png" alt="Copied" width="30" height="30">';
                    // Change the icon back to the original copy icon after 2 seconds
                    setTimeout(() => {
                        copyBtn.innerHTML = '<img src="img/copy-icon.png" alt="Copy URL" width="30" height="30">';
                    }, 2000);
                }).catch(err => {
                    // Log an error if the copying failed
                    console.error('Error copying text: ', err);
                });
        }
    });
});

// Function to validate if the string is a valid HTTP or HTTPS URL
function isValidHttpUrl(string) {
    let url;
    try {
        // Attempt to create a URL object from the string
        url = new URL(string);
    } catch (_) {
        // If failed, the URL is not valid
        return false;
    }
    // Check the URL protocol to confirm it's http or https
    return url.protocol === "http:" || url.protocol === "https:";
}

// Function to construct a new embed URL with optional autoplay and related videos parameters
function extractAndBuildNewUrl(url, autoplay, showRelated) {
    // Define regex to check if the URL is already a fullscreen embed URL
    const fullScreenEmbedPattern = /^https:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/;
    if (fullScreenEmbedPattern.test(url)) {
        throw new Error('This is already a full screen ready URL.');
    }

    // Define regex patterns to match YouTube URLs and extract video IDs
    const patterns = [
        /^https:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/
    ];

    let code;
    // Loop over the patterns to find the video ID
    patterns.some(pattern => {
        const match = url.match(pattern);
        if (match && match[1]) {
            code = match[1];
            return true;
        }
        return false;
    });

    // If a video ID is found, construct the new embed URL
    if (code) {
        let embedUrl = `https://www.youtube.com/embed/${code}`;
        let queryParams = [];
        if (autoplay) {
            queryParams.push('autoplay=1');
        }
        // The 'rel' parameter is added when the 'Show only related videos?' checkbox is checked
        if (showRelated) {
            queryParams.push('rel=0');
        }
        // Combine the query parameters and append them to the embed URL
        if (queryParams.length) {
            embedUrl += `?${queryParams.join('&')}`;
        }
        return embedUrl;
    } else {
        // If no video ID could be extracted, throw an error
        throw new Error('No valid code found in the YouTube URL.');
    }
}
