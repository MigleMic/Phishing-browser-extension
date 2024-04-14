export function getMessage(element, dIndex, marker){
    const spanElements = element.querySelectorAll('span.dangerousSymbol');

    spanElements.forEach(spanElement => {
        const dataIndexElement = parseInt(spanElement.getAttribute('dataIndex'));

        if (dIndex === dataIndexElement){
            const spanBox = spanElement.getBoundingClientRect();

            var x, y;
            if (dIndex % 2 === 1) {
                x = spanBox.left + 10;
                y = spanBox.top - 30;
            } else {
                x = spanBox.left - 10;
                y = spanBox.top + 30;
            }
            

            showMessage(x, y, marker);
        }
    });
}

function showMessage(x, y, marker){
    const messageBox = document.createElement('div');
    messageBox.classList.add('message-box');

    messageBox.style.left = `${x}px`;
    messageBox.style.top = `${y}px`;

    messageBox.style.display = 'block';
    messageBox.textContent = marker;
    var boxWidth = marker.length * 7.5;
    messageBox.style.width = `${boxWidth}px`;

    const button = document.createElement('button');
    button.textContent = 'x';
    button.classList.add('close-button');
    button.addEventListener('click', () => {
        messageBox.remove();
    });

    messageBox.appendChild(button);
    document.body.appendChild(messageBox);
}