function submitHandler(e) {
  e.preventDefault();

  /** @type HTMLElement */
  const form = e.target;

  // Find all elements
  const correct = form.querySelector('[data-correct="true"]');
  const selected = form.querySelector(':checked');

  if (!correct) {
    console.error('correct answer not found');
    return;
  }

  // Set the correct and incorrect classes
  if (correct !== selected) {
    selected?.parentElement?.classList.add('answer--incorrect');
  }

  correct.parentElement?.classList.add('answer--correct');

  // Disable all inputs and button
  form.querySelectorAll('input').forEach((input) => {
    input.disabled = true;
  });
  form.querySelector('button')?.setAttribute('disabled', 'disabled');
}

const forms = document.querySelectorAll('.question__form');

forms.forEach((form) => {
  form.addEventListener('submit', submitHandler);
});
