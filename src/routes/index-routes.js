import express from 'express';
import { getDatabase } from '../lib/db.js';
import { createQuestionValidationMiddleware, sanitizationMiddleware, xssSanitizationMiddleware} from '../lib/validation.js';
import { catchErrors } from '../lib/catch-errors.js';
import { validationResult } from 'express-validator';


export const indexRouter = express.Router();

async function indexRoute(reg, res) {
    const categories = await getDatabase()?.getCategories();
    
    return res.render('index', {
        title: 'Forsíða',
        categories,
    });
}

async function questionsRoute(req,res,category) {
    const questions = await getDatabase()?.getQuestionsAnswers([category]);
    const title = `Spurningar úr ${category}`;
    const categories = await getDatabase()?.getCategories();

    if (!questions || !categories) {
        return res.render('error', {
          title: 'Villa',
          message: 'Ekki tókst að sækja spurningar',
          categories,
        });
    }
    
    return res.render('questions', {
        title,
        questions,
        categories,
    });
}

async function formRoute(req, res) {
    const categories = await getDatabase()?.getCategories();
    
    let message;
    if (req.session.messages && req.session.messages.length > 0) {
        message = req.session.messages.join(', ');
        req.session.messages = [];
    }
    
    return res.render('form', {
        title: 'Form',
        categories,
        message,
    });

}

async function validationCheck(req, res, next) {
    const {categories, question, answer, correct} = req.body;
  
    const allCategories = await getDatabase()?.getCategories();
  
    const data = {
      categories,
      question,
      answer,
      correct,
    };
  
    const validation = validationResult(req);
  
    if (!validation.isEmpty()) {
      return res.render('form', {
        title: 'Form',
        categories: allCategories,
        data,
        errors: validation.array(),
      });
    }
  
    return next();
  }

async function createQuestion(req, res) {
    const {categories, question, answer, correct} = req.body;
    const result = await getDatabase()?.insertQuestion([question, categories]);
    const questions_id = await getDatabase()?.getQuestionID(question);
    for (let i = 0; i<4; i++) {
        await getDatabase()?.insertAnswer([answer[i], correct[i], questions_id[0].id]);
    }

    return res.redirect('/edit');
}


indexRouter.get('/', indexRoute);
indexRouter.get('/edit', formRoute);
indexRouter.post('/edit/add',createQuestionValidationMiddleware(),
    xssSanitizationMiddleware(),
    catchErrors(validationCheck),
    sanitizationMiddleware(),
    createQuestion,
);
const categories = await getDatabase()?.getCategories();
for (const category of categories) {
    indexRouter.get(`/${category.file.split(".")[0]}`, (req, res) => questionsRoute(req,res,category.name) );
}