type Page<T> = {docs:T[];hasNextPage?:boolean};
type ReadPage<T> = (page:number)=>Promise<Page<T>>;

async function readPages<T>(read:ReadPage<T>):Promise<T[]> {
 const records:T[]=[];
 let page=1;
 while(true){
  const result=await read(page);
  records.push(...result.docs);
  if(!result.hasNextPage)return records;
  page++;
 }
}

export async function readCatalogueRecords<Product,Category>(
 readProducts:ReadPage<Product>,readCategories:ReadPage<Category>,
):Promise<[Product[],Category[]]> {
 // The collections are independent; pages within each collection remain serial.
 // Promise.all propagates either read failure instead of returning partial data.
 return Promise.all([readPages(readProducts),readPages(readCategories)]);
}
