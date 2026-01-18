
import { Router } from 'express';
import { CreateUserController } from './controllers/user/CreateUserController';
import { AuthUserController } from './controllers/user/AuthUserController';
import { DetailUserController } from './controllers/user/DetailUserController';
import { isAuthenticated } from './middleware/isAuthenticated';
import { CreateCategoryController } from './controllers/category/CreateCategoryController';
import { ListCategoryController } from './controllers/category/ListCategoryController';
import { CreateProductController } from './controllers/product/CreateProductController';
import uploadConfig from './config/multer';
import { validateSchema } from './middleware/validateSchema';
import { createUserSchema } from './schemas/userSchema';

const router = Router();

// instancia do multer (sem tipagem explícita aqui)
const upload = uploadConfig.upload('tmp');

// -- ROTAS USER --
router.post('/users', validateSchema( createUserSchema ), new CreateUserController().handle);

// -- ROTAS AUTH --
router.post('/session', new AuthUserController().handle);
router.get('/me', isAuthenticated, new DetailUserController().handle);

// -- ROTAS CATEGORY --
router.post('/category', isAuthenticated, new CreateCategoryController().handle);
router.get('/category', isAuthenticated, new ListCategoryController().handle);

// -- ROTAS PRODUCT --
//Wrapper para encaminhar erros do Multer ao middleware global de erros
//router.post('/product', isAuthenticated, (req, res, next) => {
//  upload.single('banner')(req, res, (err) => {
//if (err) return next(err);
    //return new CreateProductController().handle(req, res);
 //});
//});



router.post('/product', isAuthenticated, (req, res, next) => {
     upload.single('banner')(req, res, async (err) => {
       if (err) {
         return next(err); // Trata erro do multer
       }

       try {
         await new CreateProductController().handle(req, res);
       } catch (error) {
         next(error); // Captura erros do controller
       }
     });
   });

export { router };
