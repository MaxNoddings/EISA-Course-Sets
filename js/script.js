// script.js

const options = [
    { value: "option1", text: "Option 1" },
    { value: "option2", text: "Option 2" },
    { value: "option3", text: "Option 3" },
    { value: "option4", text: "Option 4" },
    { value: "option5", text: "Option 5" },
    { value: "option6", text: "Option 6" },
    { value: "option7", text: "Option 7" },
    { value: "option8", text: "Option 8" },
    { value: "option9", text: "Option 9" },
    { value: "option10", text: "Option 10" },
    { value: "option11", text: "Option 11" },
    { value: "option12", text: "Option 12" },
    { value: "option13", text: "Option 13" }
];

const dropdowns = document.querySelectorAll('.dropdown');

// Initialize all dropdowns with options
dropdowns.forEach(dropdown => {
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        dropdown.appendChild(opt);
    });

    // Add change event listener
    dropdown.addEventListener('change', handleSelection);
});

function handleSelection() {
    // Get all selected values
    const selectedValues = [...dropdowns].map(dropdown => dropdown.value);

    // Update all dropdowns based on selected values
    dropdowns.forEach(dropdown => {
        [...dropdown.options].forEach(option => {
            if (selectedValues.includes(option.value) && option.value !== dropdown.value) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });
    });
}
