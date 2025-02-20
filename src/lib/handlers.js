/**
 * Middleware that renders 404 page.
 * @param {import('express').Request | null} req Request object
 * @param {import('express').Response} res Response object
 */
export function handler404(req, res) {
  const title = 'Síða fannst ekki';
  return res.status(404).render('error', { title });
}

/**
 * Middleware that logs error and renders error page.
 * @param {Error} err Error object
 * @param {import('express').Request | null} req Request object
 * @param {import('express').Response} res Response object
 * @param {import('express').NextFunction | null} next Next function
 */
export function handlerError(err, req, res, next) {
  console.error('error occured', err, next);
  const templateData = { title: 'Villa kom upp' };

  return res.status(500).render('error', templateData);
}
