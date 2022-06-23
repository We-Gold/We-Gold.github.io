document.addEventListener('DOMContentLoaded', () => {
    // Add a toggle listener to each lazy-loading details element to 
    // only load a child iframe when it is toggled
    document.querySelectorAll('.lazy-details').forEach(element => {
        element.addEventListener('toggle', () => {
            element.querySelectorAll('iframe')
                .forEach(iframe => loadIframe(iframe))
        })
    })
})

const loadIframe = (iframe) => {
    // Find the src data attribute of the element
    const src = iframe.dataset.src
    
    // Update the iframe src with the data attribute value (only do this once)
    if (src !== undefined) {
        iframe.src = src

        delete iframe.dataset.src
    }
}