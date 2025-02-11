/**
 * @typedef {import('../types.js').Answer} Answer
 * @typedef {import('../types.js').Question} Question
 * @typedef {import('../types.js').QuestionCategory} QuestionCategory
 */

/**
 * Generate HTML for a page.
 * @param {string} title Title of the page.
 * @param {string} body HTML body of the page.
 * @returns Full HTML body for the page.
 */
export function template(title, body) {
  return /* HTML */ `<!DOCTYPE html>
    <html lang="is">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <link rel="stylesheet" href="styles.css" />
        <script type="module" src="main.js"></script>
        <title>${title}</title>
      </head>
      <body>
        <main>${body}</main>
      </body>
    </html>`;
}

/**
 *
 * @param {QuestionCategory[]} categories
 * @returns
 */
export function indexTemplate(categories) {
  const body = /* HTML */ `
    <h1>Spurningaflokkar</h1>
    <p>Veldu flokk til að fá spurningar úr:</p>
    <ul>
      ${categories
        .map((category) => {
          return /* HTML */ ` <li>
            <a href="${category.file?.replace('.json', '.html')}"
              >${category.title}</a
            >
          </li>`;
        })
        .join('')}
    </ul>
  `;

  return template('Spurningaflokkar', body);
}

export function replaceHtmlEntities(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function stringToHtml(str) {
  return replaceHtmlEntities(str)
    .split('\n\n')
    .map((line) => `<p>${line}</p>`)
    .join('')
    .replace(/\n/g, '<br>')
    .replace(/ {2}/g, '&nbsp;&nbsp;');
}

/**
 *
 * @param {Answer} answer
 * @param {number} questionIndex
 * @param {number} answerIndex
 * @returns
 */
export function answerTemplate(answer, questionIndex, answerIndex) {
  const index = `${questionIndex}-${answerIndex}`;
  return /* HTML */ `
    <div class="answer">
      <input
        class="answer__input"
        data-correct="${answer.correct}"
        type="radio"
        name="question${questionIndex}"
        id="question${index}"
      />
      <label class="answer__label" for="question${index}"
        >${replaceHtmlEntities(answer.answer)}</label
      >
    </div>
  `;
}

/**
 *
 * @param {Question} question
 * @param {number} index
 * @returns {string}
 */
export function questionTemplate(question, index) {
  const questionHtml = stringToHtml(question.question);
  const shuffledAnswers = question.answers.sort(() => Math.random() - 0.5);

  return /* HTML */ `
    <section class="question">
      <h2>Spurning ${index + 1}</h2>
      <div class="question__text">${questionHtml}</div>
      <form class="question__form">
        ${shuffledAnswers
          .map((answer, answerIndex) =>
            answerTemplate(answer, index, answerIndex)
          )
          .join('')}
        <button>Svara</button>
      </form>
    </section>
  `;
}

/**
 *
 * @param {QuestionCategory} questionCategory
 * @returns {string}
 */
export function questionCategoryTemplate(questionCategory) {
  const body = /* HTML */ `
    <h1>${questionCategory.title}</h1>
    <div class="questions">
      ${questionCategory.questions.map(questionTemplate).join('')}
    </div>
    <p><a href="index.html">Til baka</a></p>
  `;
  return template(`Spurningaflokkur—${questionCategory.title}`, body);
}
