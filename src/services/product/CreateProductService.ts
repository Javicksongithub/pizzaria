import { PrismaClient } from "@prisma/client";
interface ProductRequest{
    name: string;
    price: number;
    description: string;
    banner: string;
    category_id: string;
}
class CreateProductService{
    async execute ({name, price, description, banner, category_id}: ProductRequest){
        return {ok:true}



    } 
         
}
 export {CreateProductService}