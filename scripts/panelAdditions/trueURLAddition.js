// Show true URL to user when applicable

export function showTrueURL(url, reason) {
    const container = document.getElementById('url-signs');

    const div = document.createElement('div');
    container.appendChild(div);

    const paragraph = document.createElement('p');
    paragraph.id = 'url-display';
    div.append(paragraph);

    if (reason === 'At_Sign') {
        paragraph.textContent = 'Ar tikrai bandote patekti į šią svetainę? ' + url;
    } else {
        paragraph.textContent = 'Ar nenorite patekti į šią svetainę? ' + url;
    }
}