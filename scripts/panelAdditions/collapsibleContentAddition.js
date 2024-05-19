import { getDescriptionByID, getNameByID, getSampleByID, getUrlsByID } from "../Utils/getDatabseInformation.js";

export async function callCollapsible(id) {
   const name = await getNameByID(id);
   const description = await getDescriptionByID(id);
   var urls = await getUrlsByID(id);
   var sample = await getSampleByID(id);

   showCollapsible(name, description, urls, sample);
}

function showCollapsible(name, description, urls, sample) {
   const parentDiv = document.getElementById('phishingReasons');

   const div = document.createElement('div');
   div.classList.add('collapsible');
   parentDiv.appendChild(div);

   const div2 = document.createElement('div');
   div2.classList.add('collapsible-wrap');
   div.appendChild(div2);

   const button = document.createElement('button');
   button.classList.add('collapsible-btn');
   button.textContent = name;
   div2.appendChild(button);

   const div3 = document.createElement('div');
   div3.classList.add('collapsible-con');
   div3.textContent = description;
   div2.appendChild(div3);

   if (urls.length > 1) {
      const lineBreak = document.createElement('br');
      div3.appendChild(lineBreak);

      const similarUrls = document.createTextNode('Panašios svetainės:');
      div3.appendChild(similarUrls);

      const bulletPointList = document.createElement('ul');
      div3.appendChild(bulletPointList);

      for (let i = 0; i < urls.length; i++) {
         var bulletPoint = document.createElement('li');
         bulletPointList.appendChild(bulletPoint);
         bulletPoint.textContent = urls[i];
      }
   }

   if (sample) {
      const lineBreak = document.createElement('br');
      div3.appendChild(lineBreak);

      const sampleText = document.createTextNode(sample);
      div3.appendChild(sampleText);
   }

   button.addEventListener('click', function () {
      this.classList.toggle('show');
      var content = this.nextElementSibling;
      if (content.style.maxHeight) {
         content.style.maxHeight = null;
         moveOtherButtons();
      } else {
         content.style.maxHeight = content.scrollHeight + 'px';
         moveOtherButtons();
      }
   });
}

function moveOtherButtons() {
   var reasonsContainer = document.getElementById('reasons');
   var buttonContainer = document.getElementById('buttons');

   var buttonsRect = buttonContainer.getBoundingClientRect();
   var reasonsRect = reasonsContainer.getBoundingClientRect();

   if (reasonsRect.bottom > buttonsRect.top) {
      var overlapDistance = reasonsRect.bottom - buttonsRect.top;
      var current = parseFloat(buttonContainer.style.transform.replace('translateY(', '').replace('px)', '')) || 0;
      var newOffset = current + overlapDistance;
      buttonContainer.style.transform = 'translateY(' + newOffset + 'px)';
   } else {
      buttonContainer.style.transform = 'translateY(0)';
   }
}