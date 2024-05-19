import { getMarkerByID } from "../Utils/getDatabseInformation.js";
import { updateDataIndex } from "../page.js";

let updateMessageBoxPosition;

export async function callMarkerMessage(markerID, modifiedUrl, dIndex) {
   document.getElementById('url-display').innerHTML = modifiedUrl;

   const element = document.getElementById('url-display');
   const marker = await getMarkerByID(markerID);

   getMessage(element, dIndex, marker);
   updateDataIndex();
}

function getMessage(element, dIndex, marker) {
   const spanElements = element.querySelectorAll('span.dangerousSymbol');

   spanElements.forEach(spanElement => {
      const dataIndexElement = parseInt(spanElement.getAttribute('dataIndex'));

      if (dIndex === dataIndexElement) {
         updateMessageBoxPosition = () => {
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
         };

         updateMessageBoxPosition();
      }
   });
}

function showMessage(x, y, marker) {
   const container = document.getElementById('url-signs');

   const messageBox = document.createElement('div');
   messageBox.classList.add('message-box');
   container.appendChild(messageBox);

   messageBox.style.left = `${x}px`;
   messageBox.style.top = `${y}px`;

   messageBox.style.display = 'block';
   messageBox.textContent = marker;
   var boxWidth = marker.length * 7.5;
   messageBox.style.width = `${boxWidth}px`;

   const button = document.createElement('button');
   button.textContent = 'x';
   button.classList.add('close-button');
   messageBox.appendChild(button);

   button.addEventListener('click', () => {
      messageBox.remove();
   });
}