import { getDescriptionByID, getNameByID } from "../Utils/getDatabseInformation.js";

export async function callCollapsible(id) {
    const name = await getNameByID(id);
    const description = await getDescriptionByID(id);

    showCollapsible(name, description);
}

function showCollapsible(name, description) {
    const div = document.createElement('div');
    div.classList.add('collapsible');

    const div2 = document.createElement('div');
    div2.classList.add('collapsible-wrap');

    const button = document.createElement('button');
    button.classList.add('collapsible-btn');
    button.textContent = name;

    const div3 = document.createElement('div');
    div3.classList.add('collapsible-con');
    div3.textContent = description;

    div.appendChild(div2);
    div2.appendChild(button);
    div2.appendChild(div3);
    document.body.appendChild(div);

    button.addEventListener('click', function() {
        this.classList.toggle('show');
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    });
}