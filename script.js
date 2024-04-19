document.addEventListener('DOMContentLoaded', () => {
    const youtubeUrlInput = document.getElementById('youtube-url');
    const outputLabel = document.getElementById('output-label');
    const outputUrlBox = document.getElementById('output-url-box');
    const generateButton = document.getElementById('generate-btn');
    const autoplayCheckbox = document.getElementById('autoplay');
    const copyBtn = document.getElementById('copy-btn');

    generateButton.addEventListener('click', () => {
        outputLabel.textContent = '';
        outputUrlBox.textContent = '';
        outputUrlBox.style.display = 'none'; // Ensure it's hidden
        copyBtn.style.display = 'none'; // Hide the copy button

        const url = youtubeUrlInput.value;
        try {
            if (!url || !isValidHttpUrl(url)) {
                throw new Error('Please enter a valid YouTube URL.');
            }
            
            const newEmbedUrl = extractAndBuildNewUrl(url, autoplayCheckbox.checked);
            outputLabel.textContent = 'Full Screen URL:';
            outputUrlBox.textContent = newEmbedUrl;
            outputUrlBox.style.display = 'inline-block'; // Show output box
            copyBtn.style.display = 'inline-block'; // Show copy button
        } catch (error) {
            outputLabel.textContent = error.message;
        }
    });

    copyBtn.addEventListener('click', () => {
        if (outputUrlBox.textContent) {
            navigator.clipboard.writeText(outputUrlBox.textContent).then(() => {
                copyBtn.innerHTML = '<img src="img/copied-icon-checkmark.png" alt="Copied" width="30" height="30">';
                setTimeout(() => {
                    copyBtn.innerHTML = '<img src="img/copy-icon.png" alt="Copy URL" width="30" height="30">';
                }, 2000);
            }).catch(err => {
                console.error('Error copying text: ', err);
            });
        }
    });
});

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function extractAndBuildNewUrl(url, autoplay) {
    // Check if the URL is already in the fullscreen embed format
    const fullScreenEmbedPattern = /^https:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/;
    if (fullScreenEmbedPattern.test(url)) {
        throw new Error('This is already a full screen ready URL.');
    }

    const patterns = [
        /^https:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/
        // Removed the fullscreen embed pattern as we're handling it above
    ];

    let code;
    patterns.some(pattern => {
        const match = url.match(pattern);
        if (match && match[1]) {
            code = match[1];
            return true;
        }
        return false;
    });

    if (code) {
        let embedUrl = `https://www.youtube.com/embed/${code}`;
        if (autoplay) {
            embedUrl += '?autoplay=1';
        }
        return embedUrl;
    } else {
        throw new Error('No valid code found in the YouTube URL.');
    }
}
